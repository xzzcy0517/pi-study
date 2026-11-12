# 第 19 讲 · 三道安全门

> **对应源码**：`pi/packages/coding-agent/src/config.ts:289-335`

---

## 一句话

即使识别出安装方式、也拼好了命令，Pi 也不会立刻更新。`getSelfUpdateCommand()` 还要过三道安全门：命令能生成、安装确实归包管理器管、目录可写。

## 源码

```ts
export function getSelfUpdateCommand(
	packageName: string,
	npmCommand?: string[],
	updatePackageTarget: SelfUpdatePackageTarget = packageName,
): SelfUpdateCommand | undefined {
	const method = detectInstallMethod();
	const command = getSelfUpdateCommandForMethod(method, packageName, updatePackageTarget, npmCommand);
	if (!command || !isManagedByGlobalPackageManager(method, packageName, npmCommand) || !isSelfUpdatePathWritable()) {
		return undefined;
	}
	return command;
}
```

三个条件用 `||` 连在一起：只要有任何一个不满足，就返回 `undefined`（表示“不要自动更新”）。

| 门 | 检查函数 | 问题 |
|---|---|---|
| 第 1 门 | `getSelfUpdateCommandForMethod()` | 这种安装方式能生成命令吗？ |
| 第 2 门 | `isManagedByGlobalPackageManager()` | 当前目录真的属于全局包管理器吗？ |
| 第 3 门 | `isSelfUpdatePathWritable()` | 包目录和父目录可写吗？ |

## 第 1 门：能生成命令吗

```ts
const command = getSelfUpdateCommandForMethod(method, packageName, updatePackageTarget, npmCommand);
```

上一讲已经看过：`bun-binary` 和 `unknown` 会返回 `undefined`，其余四种会生成命令。

## 第 2 门：真的归包管理器管吗

```ts
function isManagedByGlobalPackageManager(method: InstallMethod, packageName: string, npmCommand?: string[]): boolean {
	const packageDirs = [getPackageDir(), getEntrypointPackageDir()].filter((dir): dir is string => !!dir);
	const packageDirCandidates = packageDirs.flatMap((dir) => getPathComparisonCandidates(dir));
	return getGlobalPackageRoots(method, packageName, npmCommand).some((root) => {
		return getPathComparisonCandidates(root).some((normalizedRoot) => {
			const rootPrefix = normalizedRoot.endsWith(sep) ? normalizedRoot : `${normalizedRoot}${sep}`;
			return packageDirCandidates.some((packageDir) => packageDir.startsWith(rootPrefix));
		});
	});
}
```

用人话说：

```text
当前包目录，是否位于包管理器报告的“全局根目录”里面？
```

它同时检查两个目录：

- `getPackageDir()`：`config.ts` 找到的包根；
- `getEntrypointPackageDir()`：从 `process.argv[1]` 向上找到的包根。

### 为什么要补路径分隔符

```ts
const rootPrefix = normalizedRoot.endsWith(sep) ? normalizedRoot : `${normalizedRoot}${sep}`;
```

如果只看字符串开头：

```text
root     = /global/node_modules
包目录    = /global/node_modules-old/pkg
```

后者会被误判成“在 root 里面”。补上结尾的 `/` 以后：

```text
/global/node_modules-old/pkg
```

就不以 `/global/node_modules/` 开头了，误判消失。

### 为什么源码目录必须被挡住

假设你在源码 checkout 里跑 Pi，路径中也可能出现 `node_modules`（因为装了依赖）。如果只凭“路径含 node_modules”就自动执行全局更新，可能把开发环境搞坏。

第 2 门就是用来挡住这种“看着像，但其实不归包管理器管”的情况。

## 第 3 门：目录可写吗

```ts
function isSelfUpdatePathWritable(): boolean {
	const packageDir = getPackageDir();
	try {
		accessSync(packageDir, constants.W_OK);
		accessSync(dirname(packageDir), constants.W_OK);
		return true;
	} catch {
		return false;
	}
}
```

检查两个位置：

1. 包目录本身；
2. 包目录的父目录。

为什么父目录也要查？因为安装/卸载时可能要改同级的链接或文件。

任何一项检查失败，就返回 `false`，不自动更新。

## 提示和许可是两回事

`config.ts` 里还有 `getUpdateInstruction()`：

```ts
export function getUpdateInstruction(packageName: string): string {
	const method = detectInstallMethod();
	const command = getSelfUpdateCommandForMethod(method, packageName);
	if (command) {
		return `Run: ${command.display}`;
	}
	return getSelfUpdateUnavailableInstruction(packageName);
}
```

它只生成一句**给人看的提示**，不检查第 2、3 门。

所以会出现这种情况：

```text
识别出 npm → 能生成提示“Run: npm install -g ...”
           → 但 getSelfUpdateCommand() 返回 undefined
           → Pi 不会自己执行，只是把命令告诉你
```

`getSelfUpdateCommand()` 才代表“Pi 获得许可，可以自己动手”。

## 动手跑：亲眼看三道门

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a19

cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a19/three-gates.mts <<'EOF'
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	detectInstallMethod,
	getSelfUpdateCommand,
	getUpdateInstruction,
} from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/config.ts";

const originalExecPath = Object.getOwnPropertyDescriptor(process, "execPath");
const originalPkgDir = process.env.PI_PACKAGE_DIR;

function setExecPath(value: string) {
	Object.defineProperty(process, "execPath", { value, configurable: true });
}

// 让当前环境看起来像 npm 安装
setExecPath("/fake/npm/bin/node");

// 情况 1：临时目录，不属于任何全局包管理器
const plain = "/tmp/pi-gate-plain/package-dir";
mkdirSync(plain, { recursive: true });
process.env.PI_PACKAGE_DIR = plain;

console.log("=== 情况 1：普通临时目录 ===");
console.log("安装方式:", detectInstallMethod());
console.log("可自动更新的命令:", getSelfUpdateCommand("@earendil-works/pi-coding-agent"));
console.log("给用户的手动提示:", getUpdateInstruction("@earendil-works/pi-coding-agent"));

// 情况 2：伪造一个 npm 全局前缀 <prefix>/lib/node_modules/<包>
const prefix = "/tmp/pi-gate-prefix";
const packageDir = join(prefix, "lib", "node_modules", "@earendil-works", "pi-coding-agent");
mkdirSync(packageDir, { recursive: true });
writeFileSync(join(packageDir, "package.json"), "{}");
process.env.PI_PACKAGE_DIR = packageDir;

console.log("\n=== 情况 2：伪造 npm 全局前缀 ===");
console.log("安装方式:", detectInstallMethod());
const command = getSelfUpdateCommand("@earendil-works/pi-coding-agent");
console.log("可自动更新的命令:", command?.display);

// 清理，并恢复环境
rmSync("/tmp/pi-gate-plain", { recursive: true, force: true });
rmSync(prefix, { recursive: true, force: true });
if (originalExecPath) Object.defineProperty(process, "execPath", originalExecPath);
if (originalPkgDir === undefined) delete process.env.PI_PACKAGE_DIR;
else process.env.PI_PACKAGE_DIR = originalPkgDir;
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a19/three-gates.mts
```

**预期输出**（临时路径是脚本里写死的，应该与下面一致）：

```text
=== 情况 1：普通临时目录 ===
安装方式: npm
可自动更新的命令: undefined
给用户的手动提示: Run: npm install -g --ignore-scripts --min-release-age=0 @earendil-works/pi-coding-agent

=== 情况 2：伪造 npm 全局前缀 ===
安装方式: npm
可自动更新的命令: npm --prefix /tmp/pi-gate-prefix install -g --ignore-scripts --min-release-age=0 @earendil-works/pi-coding-agent
```

两个情况对比：

| | 情况 1 | 情况 2 |
|---|---|---|
| 识别安装方式 | npm | npm |
| 第 1 门（生成命令） | ✅ | ✅ |
| 第 2 门（归属检查） | ❌ 不在全局根目录里 | ✅ 在伪造的全局前缀里 |
| 第 3 门（可写） | ✅ | ✅ |
| 结果 | 不自动更新 | 生成 `--prefix` 命令 |

## 补充：npm 前缀是怎么推断的

情况 1 里 `getSelfUpdateCommand()` 返回 `undefined`，但之后如果路径形状是：

```text
<prefix>/lib/node_modules/<包名>
```

`getInferredNpmInstall()` 会从目录形状反推出 `prefix`，让第 2 门有机会通过。这就是情况 2 能生成 `--prefix /tmp/pi-gate-prefix` 的原因。

Windows 的 `<prefix>\node_modules` 和项目本地安装形状太像，仅凭路径无法区分，所以代码明确不推断 Windows 自定义前缀。

## 小结

- 自动更新要同时通过三道门；
- 第 2 门检查“当前目录是否真的在包管理器全局根目录里”；
- 第 3 门检查包目录和父目录是否可写；
- `getUpdateInstruction()` 只给提示，不代表 Pi 会自己执行；
- 源码 checkout、wrapper 安装通常只能拿到提示，不能自动更新。

## 下一讲预告

如果用户用 Nix、mise 之类的工具管理安装，三道门可能都过不了。Pi 允许用户自己配置更新命令。

---

## 自测

1. 三道门分别检查什么？
2. 为什么补上路径结尾的分隔符能避免误判？
3. `getUpdateInstruction()` 和 `getSelfUpdateCommand()` 有什么区别？
4. 情况 1 中 `getSelfUpdateCommand()` 为什么返回 `undefined`？
