# 第 21 讲 · 内置资源路径

> **对应源码**：`pi/packages/coding-agent/src/config.ts:432-506`

---

## 一句话

Pi 自带主题、导出模板、文档、示例等资源。这些资源在源码运行和构建后运行时位置不同，`config.ts` 用一组小函数统一算出它们的路径。

## 统一的三种情况

每个资源路径函数都遵循同一个套路：

```text
Bun 编译二进制：资源就在可执行文件旁边
Node 源码运行：从 <包根>/src/ 下找
Node 构建运行：从 <包根>/dist/ 下找
```

源码里用一个变量决定后两种：

```ts
const srcOrDist = existsSync(join(packageDir, "src")) ? "src" : "dist";
```

- 包目录里有 `src/`：说明是源码 checkout，用 `src`；
- 否则：说明是构建后的发布包，用 `dist`。

## 资源路径对照表

| 函数 | Bun 二进制 | Node（src 或 dist 下） |
|---|---|---|
| `getThemesDir()` | `<包根>/theme` | `modes/interactive/theme` |
| `getExportTemplateDir()` | `<包根>/export-html` | `core/export-html` |
| `getInteractiveAssetsDir()` | `<包根>/assets` | `modes/interactive/assets` |
| `getPackageJsonPath()` | `<包根>/package.json` | 同左 |
| `getReadmePath()` | `<包根>/README.md` | 同左 |
| `getDocsPath()` | `<包根>/docs` | 同左 |
| `getExamplesPath()` | `<包根>/examples` | 同左 |
| `getChangelogPath()` | `<包根>/CHANGELOG.md` | 同左 |

`getBundledInteractiveAssetPath(name)` 只是在 `getInteractiveAssetsDir()` 后面再拼一个文件名：

```ts
export function getBundledInteractiveAssetPath(name: string): string {
	return join(getInteractiveAssetsDir(), name);
}
```

## 源码：以主题目录为例

```ts
export function getThemesDir(): string {
	if (isBunBinary) {
		return join(getPackageDir(), "theme");
	}
	const packageDir = getPackageDir();
	const srcOrDist = existsSync(join(packageDir, "src")) ? "src" : "dist";
	return join(packageDir, srcOrDist, "modes", "interactive", "theme");
}
```

先处理 Bun 二进制（资源在可执行文件旁边），再处理 Node 的两种情况。

其他几个函数是同一模式的复制，只是子路径不同。

## 只是算路径，不代表文件一定存在

这些函数只做字符串拼接，不会：

- 创建目录；
- 检查文件是否存在；
- 读取文件内容。

真正读取发生在使用这些资源的代码里。

## 动手跑：列出所有资源路径

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a21

cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a21/resource-paths.mts <<'EOF'
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import {
	getPackageJsonPath,
	getThemesDir,
	getExportTemplateDir,
	getReadmePath,
	getDocsPath,
	getExamplesPath,
	getChangelogPath,
	getInteractiveAssetsDir,
	getBundledInteractiveAssetPath,
} from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/config.ts";

const items: [string, string][] = [
	["package.json", getPackageJsonPath()],
	["主题目录", getThemesDir()],
	["导出模板目录", getExportTemplateDir()],
	["README.md", getReadmePath()],
	["docs 目录", getDocsPath()],
	["examples 目录", getExamplesPath()],
	["CHANGELOG.md", getChangelogPath()],
	["交互资源目录", getInteractiveAssetsDir()],
];

for (const [name, path] of items) {
	console.log(name.padEnd(14), path, existsSync(path) ? "✅ 存在" : "（不存在）");
}

const asset = getBundledInteractiveAssetPath("clankolas.png");
console.log("单个资源".padEnd(14), asset, existsSync(asset) ? "✅ 存在" : "（不存在）");

// 演示 src/ 与 dist/ 的选择规则
const fake = "/tmp/pi-res-demo";
rmSync(fake, { recursive: true, force: true });
mkdirSync(join(fake, "src"), { recursive: true });
process.env.PI_PACKAGE_DIR = fake;

console.log("\n只有 src/ 时:");
console.log("  themes:", getThemesDir());
console.log("  export:", getExportTemplateDir());

mkdirSync(join(fake, "dist"), { recursive: true });
console.log("\n同时有 src/ 和 dist/ 时（src 优先）:");
console.log("  themes:", getThemesDir());

delete process.env.PI_PACKAGE_DIR;
rmSync(fake, { recursive: true, force: true });
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a21/resource-paths.mts
```

**预期输出**（中文列宽对不齐是正常的，因为一个汉字占两个字符宽度）：

```text
package.json   /Users/admin/Desktop/pi-study/pi/packages/coding-agent/package.json ✅ 存在
主题目录           /Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/modes/interactive/theme ✅ 存在
导出模板目录         /Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/core/export-html ✅ 存在
README.md      /Users/admin/Desktop/pi-study/pi/packages/coding-agent/README.md ✅ 存在
docs 目录        /Users/admin/Desktop/pi-study/pi/packages/coding-agent/docs ✅ 存在
examples 目录    /Users/admin/Desktop/pi-study/pi/packages/coding-agent/examples ✅ 存在
CHANGELOG.md   /Users/admin/Desktop/pi-study/pi/packages/coding-agent/CHANGELOG.md ✅ 存在
交互资源目录         /Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/modes/interactive/assets ✅ 存在
单个资源           /Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/modes/interactive/assets/clankolas.png ✅ 存在

只有 src/ 时:
  themes: /tmp/pi-res-demo/src/modes/interactive/theme
  export: /tmp/pi-res-demo/src/core/export-html

同时有 src/ 和 dist/ 时（src 优先）:
  themes: /tmp/pi-res-demo/src/modes/interactive/theme
```

## 观察点

1. 所有路径都指向真实的源码目录，说明当前是源码运行；
2. 伪造一个只有 `src/` 的包目录，路径自动变成 `src/...`；
3. 再建一个空的 `dist/`，结果仍然是 `src/...`——`src` 优先级更高。

## 小结

- 资源路径分 Bun 二进制、Node 源码、Node 构建三种情况；
- Node 下用“有没有 `src/`”决定用 `src` 还是 `dist`；
- 所有函数只是拼路径，不创建、不检查、不读取；
- `getBundledInteractiveAssetPath()` 是资源目录加文件名。

## 下一讲预告

有两种资源比较特殊：QuickJS 的 Wasm 文件和 codemode 的 worker 入口。它们要按运行形态解析，还会被缓存。

---

## 自测

1. Node 源码运行时，主题目录在哪？
2. 如果包目录里同时有 `src/` 和 `dist/`，选哪个？
3. 这些函数会创建目录吗？
4. `getBundledInteractiveAssetPath("a.png")` 做了什么？
