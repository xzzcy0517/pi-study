# 第 13 讲 · 判断运行形态

> **对应源码**：`pi/packages/coding-agent/src/config.ts:17-29`

---

## 一句话

`config.ts` 需要知道 Pi 当前是以什么形态运行的：Bun 编译的二进制、Bun 运行时，还是 esbuild 打包的 Node。不同形态找文件的方式不一样。

## 三种形态

| 常量 | 含义 | 判断依据 |
|---|---|---|
| `isBunBinary` | 是不是 Bun 编译出来的单文件可执行程序 | `import.meta.url` 里有没有 Bun 虚拟文件系统的特征 |
| `isBunRuntime` | 是不是正在用 Bun 运行 | `process.versions.bun` 是否存在 |
| `isBundledNode` | 是不是 esbuild 打包后的 Node 发布包 | 有没有全局常量 `PI_BUNDLED_NODE` |

## Bun 编译二进制

```ts
export const isBunBinary =
	import.meta.url.includes("$bunfs") ||
	import.meta.url.includes("~BUN") ||
	import.meta.url.includes("%7EBUN");
```

Bun 编译成单文件后，代码会放在一个虚拟文件系统里。`import.meta.url` 会包含这些特殊标记：

- `$bunfs`
- `~BUN`
- `%7EBUN`（`~BUN` 的 URL 编码）

只要命中一个，就认为自己是 Bun 编译二进制。

## Bun 运行时

```ts
export const isBunRuntime = !!process.versions.bun;
```

`process.versions` 是 Node/Bun 提供的版本信息对象。Bun 会给它加一个 `bun` 字段。

`!!` 是“双感叹号”，作用是把值转成布尔值：

```ts
!!"1.0.0"  // true
!!undefined // false
```

## Bundled Node

```ts
declare const PI_BUNDLED_NODE: boolean;
export const isBundledNode = typeof PI_BUNDLED_NODE !== "undefined" && PI_BUNDLED_NODE;
```

这里用了 `declare`，意思是：TypeScript，请你相信构建时可能会有一个叫 `PI_BUNDLED_NODE` 的全局常量。

为什么不直接写 `PI_BUNDLED_NODE`？因为如果这个常量不存在，直接读取会抛 `ReferenceError`。先用 `typeof` 安全探测：

```ts
typeof PI_BUNDLED_NODE !== "undefined"
```

如果存在，再读它的值。

## 三者关系

```text
isBunBinary：是不是 Bun 编译出来的单文件
isBunRuntime：是不是 Bun 在跑（包括 bun run，不一定是编译二进制）
isBundledNode：是不是 esbuild 打包的 Node
```

一个程序可能同时满足多个条件吗？理论上 `isBunBinary` 一定是 `isBunRuntime`，但代码里还是分开判断，保持语义清晰。

## 动手跑：当前环境是什么

```bash
cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a13/runtime.mts <<'EOF'
import {
	isBunBinary,
	isBunRuntime,
	isBundledNode,
} from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/config.ts";

console.log("isBunBinary:", isBunBinary);
console.log("isBunRuntime:", isBunRuntime);
console.log("isBundledNode:", isBundledNode);

if (!isBunBinary && !isBunRuntime && !isBundledNode) {
	console.log("当前是普通 Node 源码运行");
}
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a13/runtime.mts
```

**预期输出**（普通 Node 环境）：

```text
isBunBinary: false
isBunRuntime: false
isBundledNode: false
当前是普通 Node 源码运行
```

## 动手跑：typeof 安全探测

```bash
cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a13/typeof.mjs <<'EOF'
// 直接读取不存在的变量会报错
try {
	console.log(MY_UNDEFINED_VAR);
} catch (err) {
	console.log("直接读取报错:", err.message);
}

// 用 typeof 探测不会报错
console.log("typeof 探测:", typeof MY_UNDEFINED_VAR);
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a13/typeof.mjs
```

**预期输出**：

```text
直接读取报错: MY_UNDEFINED_VAR is not defined
typeof 探测: undefined
```

## 小结

- `isBunBinary` 识别 Bun 编译单文件；
- `isBunRuntime` 识别 Bun 运行时；
- `isBundledNode` 识别 esbuild 打包的 Node；
- 读取可能不存在的全局变量时，先用 `typeof` 探测，避免 `ReferenceError`。

## 下一讲预告

根据运行形态，Pi 怎么找到自己的“家”（包根目录）？

---

## 自测

1. `isBunBinary` 和 `isBunRuntime` 有什么区别？
2. 为什么要用 `typeof PI_BUNDLED_NODE` 而不是直接读它？
3. `!!process.versions.bun` 在普通 Node 下返回什么？
4. 当前你的环境属于哪种形态？
