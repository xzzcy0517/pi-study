# 第 17 讲 · 识别安装方式

> **对应源码**：`pi/packages/coding-agent/src/config.ts:79-100`

---

## 一句话

Pi 要自动更新自己，首先得知道自己当初是怎么装进来的：npm、pnpm、yarn、bun，还是 Bun 编译的单文件。`detectInstallMethod()` 用路径特征来猜。

## 为什么需要知道安装方式

不同包管理器的更新命令不一样：

```text
npm  → npm install -g ...
pnpm → pnpm install -g ...
yarn → yarn global add ...
bun  → bun install -g ...
```

如果 Pi 用错命令，轻则更新失败，重则装出两份互相打架的副本。所以第一步是识别“我是谁装的”。

## 源码

```ts
export type InstallMethod = "bun-binary" | "npm" | "pnpm" | "yarn" | "bun" | "unknown";

export function detectInstallMethod(): InstallMethod {
	if (isBunBinary) {
		return "bun-binary";
	}

	const resolvedPath = `${__dirname}\0${process.execPath || ""}`.toLowerCase().replace(/\\/g, "/");

	if (resolvedPath.includes("/pnpm/") || resolvedPath.includes("/.pnpm/")) {
		return "pnpm";
	}
	if (resolvedPath.includes("/yarn/") || resolvedPath.includes("/.yarn/")) {
		return "yarn";
	}
	if (isBunRuntime || resolvedPath.includes("/install/global/node_modules/")) {
		return "bun";
	}
	if (resolvedPath.includes("/npm/") || resolvedPath.includes("/node_modules/")) {
		return "npm";
	}

	return "unknown";
}
```

## 第一步：Bun 编译二进制

```ts
if (isBunBinary) {
	return "bun-binary";
}
```

Bun 编译出来的单文件不是“安装在某个 node_modules 里”，而是整个程序就一个可执行文件。它的更新方式是去 GitHub Releases 下载新版本，不是跑包管理器。所以单独归为一类，直接返回。

## 第二步：拼一条用于检查的字符串

```ts
const resolvedPath = `${__dirname}\0${process.execPath || ""}`.toLowerCase().replace(/\\/g, "/");
```

这行做了四件事：

| 动作 | 作用 |
|---|---|
| `` `${__dirname}\0${process.execPath}` `` | 把“本文件所在目录”和“node 可执行文件路径”拼起来 |
| `\0` | 一个不可见的分隔符，防止两段路径首尾相连造成误判 |
| `.toLowerCase()` | 统一小写，避免大小写差异 |
| `.replace(/\\/g, "/")` | Windows 反斜杠统一成正斜杠，方便用 `/` 特征匹配 |

`__dirname` 在当前源码里是：

```text
/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src
```

`process.execPath` 是你当前用的 node 路径，例如：

```text
/Users/admin/.nvm/versions/node/v24.20.0/bin/node
```

## 第三步：按顺序匹配特征

| 特征 | 判定 |
|---|---|
| 路径含 `/pnpm/` 或 `/.pnpm/` | pnpm |
| 路径含 `/yarn/` 或 `/.yarn/` | yarn |
| 是 Bun 运行时，或路径含 `/install/global/node_modules/` | bun |
| 路径含 `/npm/` 或 `/node_modules/` | npm |
| 都不匹配 | unknown |

### 为什么顺序不能乱

pnpm 的安装路径里通常也包含 `node_modules`。如果把 npm 的判断放在前面，pnpm 安装会被误判成 npm。

所以代码先检查更具体的特征（pnpm、yarn），最后才检查很宽泛的 `/node_modules/`。

## 动手跑：看不同路径会被识别成什么

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a17

cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a17/install-method.mts <<'EOF'
import { detectInstallMethod } from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/config.ts";

const originalExecPath = Object.getOwnPropertyDescriptor(process, "execPath");

// 临时替换 process.execPath，观察不同路径会被识别成什么
function withExecPath(value: string, fn: () => void) {
	Object.defineProperty(process, "execPath", { value, configurable: true });
	try {
		fn();
	} finally {
		if (originalExecPath) Object.defineProperty(process, "execPath", originalExecPath);
	}
}

console.log("当前真实环境:", detectInstallMethod());

const cases = [
	["pnpm", "/home/me/.local/share/pnpm/global/5/.pnpm/pkg/node_modules/pkg/dist/cli.js"],
	["yarn", "/home/me/.config/yarn/global/node_modules/pkg/dist/cli.js"],
	["bun", "/home/me/.bun/install/global/node_modules/pkg/dist/cli.js"],
	["npm", "/usr/local/lib/node_modules/pkg/dist/cli.js"],
	["unknown", "/usr/local/bin/node"],
] as const;

for (const [label, execPath] of cases) {
	withExecPath(execPath, () => {
		console.log(label.padEnd(8), "=>", detectInstallMethod());
	});
}
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a17/install-method.mts
```

**预期输出**：

```text
当前真实环境: unknown
pnpm     => pnpm
yarn     => yarn
bun      => bun
npm      => npm
unknown  => unknown
```

几个观察点：

1. 当前是从源码直接跑，路径里没有包管理器特征，所以是 `unknown`；
2. 把 `execPath` 换成带 `/.pnpm/` 的路径，就识别成 pnpm；
3. 带 `/install/global/node_modules/` 的路径识别成 bun，而不是 npm——因为 bun 的判断在前面。

## 这是“推断”，不是“证明”

`detectInstallMethod()` 只看路径长什么样。它不知道：

- 这个目录是不是真的由 npm 全局安装的；
- 当前用户有没有权限改它；
- 更新命令会不会影响别的程序。

所以“识别出 npm”只是第一关。下一讲讲它怎么构造命令，再下一讲讲为什么识别了也不一定能自动更新。

## 小结

- `detectInstallMethod()` 返回六种安装方式之一；
- Bun 编译二进制单独判断；
- 其余靠 `__dirname + process.execPath` 的路径特征；
- 匹配顺序从具体到宽泛，避免 pnpm 被误判成 npm；
- 路径推断不等于“确认归属”。

## 下一讲预告

知道安装方式后，Pi 怎么拼出一条更新命令？

---

## 自测

1. `detectInstallMethod()` 一共有哪几种返回值？
2. 为什么要先判断 pnpm，再判断 npm？
3. `\0` 在拼接字符串时起什么作用？
4. 路径推断能证明“这个安装真的由 npm 管理”吗？
