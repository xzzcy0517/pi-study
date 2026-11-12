# 第 22 讲 · 特殊资源：QuickJS Wasm 与 worker

> **对应源码**：`pi/packages/coding-agent/src/config.ts:508-552`

---

## 一句话

有两种资源不能简单地拼路径：QuickJS 的 Wasm 文件要先“解析依赖位置”，codemode 的 worker 入口要按运行形态选择。它们都是**用到时才找**，不是启动时找。

## 资源一：QuickJS Wasm

Codemode 功能需要在 QuickJS 虚拟机里跑脚本，而 QuickJS 的 Wasm 文件放在 npm 依赖 `quickjs-wasi` 里。

### 源码

```ts
let quickJSWasmPath: string | undefined;

/** Called by the Bun entry with the path of the QuickJS wasm file embedded in the compiled executable. */
export function setEmbeddedQuickJSWasmPath(path: string): void {
	quickJSWasmPath = path;
}

export function getQuickJSWasmPath(): string {
	quickJSWasmPath ??= createRequire(import.meta.url).resolve("quickjs-wasi/quickjs.wasm");
	return quickJSWasmPath;
}
```

### 逐行理解

```ts
let quickJSWasmPath: string | undefined;
```

模块级缓存变量。第一次找到路径后存在这里。

```ts
export function setEmbeddedQuickJSWasmPath(path: string): void {
	quickJSWasmPath = path;
}
```

Bun 编译二进制会把 Wasm 嵌进可执行文件。Bun 入口启动时调用这个函数，提前告诉配置中心“内嵌文件在这里”。

```ts
quickJSWasmPath ??= createRequire(import.meta.url).resolve("quickjs-wasi/quickjs.wasm");
```

- `??=`：只有缓存为空时才去找；
- `createRequire(import.meta.url)`：在 ES 模块里造一个 CommonJS 风格的 `require`；
- `.resolve(...)`：按 Node 的包解析规则找到 `quickjs-wasi/quickjs.wasm` 的真实路径。

### 为什么不用 `join(包根, "node_modules/quickjs-wasi/...")`

因为依赖可能被提升（hoist）到上层 `node_modules`。写死路径很容易找错。用 `require.resolve` 让 Node 自己按规则找，兼容性更好。

### 为什么找到后要缓存

源码注释给了原因（#10439）：如果 Pi 在运行中被更新，旧安装目录可能被删除。但当前进程已经加载的模块还要继续用原来的路径。缓存一下，避免下次再找时找不到。

## 资源二：Codemode worker 入口

worker 是 codemode 用来在后台线程/进程中执行脚本的入口文件。三种发布形态下位置不同。

### 源码

```ts
export function resolveCodemodeWorkerSpecifier(
	runtime: "bun-binary" | "bundled-node" | "unbundled",
	moduleUrl: string,
): string | URL | undefined {
	if (runtime === "bun-binary") return "./src/extensions/codemode/worker.ts";
	if (runtime === "bundled-node") return new URL("./codemode-worker.js", moduleUrl);
	return undefined;
}
```

| 运行形态 | 返回 | 为什么 |
|---|---|---|
| `bun-binary` | 相对字符串 `"./src/extensions/codemode/worker.ts"` | Bun 能识别源码入口；Windows 上 Bun 无法把 `B:\~BUN` 绝对 URL 映射回入口，相对字符串最稳 |
| `bundled-node` | 相邻的 `codemode-worker.js` 的 URL | 打包时 worker 被输出到同目录 |
| `unbundled` | `undefined` | 用依赖包自带的 worker，不需要指定 |

### 打包后的特殊处理

```ts
let codemodeWorkerDataUrl: URL | undefined;

export function getCodemodeWorkerSpecifier(): string | URL | undefined {
	const runtime = isBunBinary ? "bun-binary" : isBundledNode ? "bundled-node" : "unbundled";
	const specifier = resolveCodemodeWorkerSpecifier(runtime, import.meta.url);
	if (runtime !== "bundled-node" || !(specifier instanceof URL)) return specifier;
	// Spawn workers from an in-memory copy. An update replaces or deletes the file while this
	// process keeps running (#10439). The bundle build keeps the worker free of relative imports
	// and import.meta, so it runs from a data: URL.
	codemodeWorkerDataUrl ??= new URL(`data:text/javascript;base64,${readFileSync(specifier).toString("base64")}`);
	return codemodeWorkerDataUrl;
}
```

Bun 和 unbundled 直接返回。

只有 bundled-node 会：

1. 读取 worker 文件；
2. 转成 Base64；
3. 拼成 `data:text/javascript;base64,...` 的 URL；
4. 缓存起来。

这样即使另一个终端把磁盘上的 worker 文件替换或删除，当前进程仍然能用内存里的副本启动 worker。

### data URL 是什么

普通 URL 指向一个文件：

```text
file:///release/codemode-worker.js
```

data URL 把内容直接塞进 URL 里：

```text
data:text/javascript;base64,Y29uc29sZS5sb2coImhlbGxvIik=
```

`base64,` 后面就是文件内容的 Base64 编码。使用时不需要再读磁盘。

## 动手跑：观察两种特殊资源

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a22

cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a22/special-resources.mts <<'EOF'
import { existsSync } from "node:fs";
import {
	getQuickJSWasmPath,
	setEmbeddedQuickJSWasmPath,
	resolveCodemodeWorkerSpecifier,
	getCodemodeWorkerSpecifier,
} from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/config.ts";

// ① QuickJS Wasm：首次调用时解析并缓存
const wasm = getQuickJSWasmPath();
console.log("QuickJS wasm:", wasm);
console.log("文件存在:", existsSync(wasm));

// ② Bun 入口可以提前告诉配置中心内嵌文件的位置
setEmbeddedQuickJSWasmPath("/tmp/embedded-quickjs.wasm");
console.log("设置内嵌路径后:", getQuickJSWasmPath());

// ③ worker 入口按运行形态选择
console.log("\nworker 入口:");
for (const runtime of ["bun-binary", "bundled-node", "unbundled"] as const) {
	const spec = resolveCodemodeWorkerSpecifier(runtime, "file:///release/config.js");
	console.log(" ", runtime.padEnd(12), "=>", spec instanceof URL ? spec.href : spec);
}

console.log("\n当前运行时 =>", getCodemodeWorkerSpecifier());

// ④ data URL 是什么
const source = 'console.log("hello from data url")';
const dataUrl = new URL(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
console.log("\ndata URL:", dataUrl.href.slice(0, 72) + "...");
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a22/special-resources.mts
```

**预期输出**：

```text
QuickJS wasm: /Users/admin/Desktop/pi-study/pi/node_modules/quickjs-wasi/quickjs.wasm
文件存在: true
设置内嵌路径后: /tmp/embedded-quickjs.wasm

worker 入口:
  bun-binary   => ./src/extensions/codemode/worker.ts
  bundled-node => file:///release/codemode-worker.js
  unbundled    => undefined

当前运行时 => undefined

data URL: data:text/javascript;base64,Y29uc29sZS5sb2coImhlbGxvIGZyb20gZGF0YSB1cmwi...
```

三个观察点：

1. Wasm 路径在 `pi/node_modules` 下，而不是 `packages/coding-agent/node_modules`——这就是依赖提升，写死路径会找错；
2. 调用 `setEmbeddedQuickJSWasmPath()` 后，后续读取直接返回设置的值；
3. 当前是普通源码运行（unbundled），所以 worker 入口是 `undefined`。

## 重要：这些都不是启动时执行的

`setupCli()` 不会调用这两个函数。只有真正使用 codemode 功能时，才会解析 Wasm 和 worker。

## 小结

- QuickJS Wasm 用 `require.resolve` 找依赖包里的文件，并缓存结果；
- `setEmbeddedQuickJSWasmPath()` 供 Bun 二进制提前注入内嵌路径；
- worker 入口按 bun-binary / bundled-node / unbundled 三种形态选择；
- bundled-node 会把 worker 读成 Base64 data URL 缓存，避免更新后文件消失；
- 两者都是惰性解析，不是启动准备的一部分。

## 下一讲预告

如果 Pi 运行期间，另一个终端把安装更新了，会发生什么？`detectInstallChange()` 专门检查这件事。

---

## 自测

1. `getQuickJSWasmPath()` 第一次调用做了什么？第二次呢？
2. 为什么不用字符串拼接写死 Wasm 路径？
3. 三种运行形态下，worker 入口分别是什么？
4. 为什么 bundled-node 要用 data URL？普通文件路径不行吗？
