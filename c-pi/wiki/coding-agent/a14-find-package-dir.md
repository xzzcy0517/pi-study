# 第 14 讲 · 找到包根目录

> **对应源码**：`pi/packages/coding-agent/src/config.ts:391-430`

---

## 一句话

Pi 需要知道自己安装在哪个目录，才能找到 `package.json`、主题、模板等资源。不同发布形态找法不同：Bun 二进制看可执行文件旁边，Node 从 `config.ts` 所在位置向上找。

## 为什么要找包根

Pi 运行时可能需要读取这些文件：

- `package.json`（看版本、名字）
- 内置主题目录
- HTML 导出模板
- 示例代码目录

这些文件的位置在源码运行、构建后运行、Bun 编译二进制三种情况下都不一样。所以 `config.ts` 里有一组函数专门负责“找到正确的根目录”。

## 从源码位置向上找

```ts
export function findNodePackageDir(startDir: string): string {
	let dir = startDir;
	while (dir !== dirname(dir)) {
		if (existsSync(join(dir, "package.json"))) {
			const parent = dirname(dir);
			if (basename(dir) === "dist" && existsSync(join(parent, "package.json"))) {
				return parent;
			}
			return dir;
		}
		dir = dirname(dir);
	}
	return startDir;
}
```

逻辑：

1. 从 `startDir` 开始；
2. 往上一级一级走；
3. 如果某一层有 `package.json`，就停下来；
4. 特殊：如果这一层叫 `dist`，且上一层也有 `package.json`，返回上一层。

## 特殊情况：dist 目录

Bun 编译二进制时，会把一些元数据复制进 `dist/`。Node 发布时如果停在 `dist/`，资源路径可能拼成 `dist/dist/...` 这种重复路径。所以源码规定：如果当前目录名是 `dist`，而且父目录也有 `package.json`，就选父目录作为包根。

## getPackageDir 的优先级

```ts
export function getPackageDir(): string {
	const envDir = process.env.PI_PACKAGE_DIR;
	if (envDir) {
		return normalizePath(envDir);
	}
	if (isBunBinary) {
		return dirname(process.execPath);
	}
	return findNodePackageDir(__dirname);
}
```

三种情况按顺序判断：

1. `PI_PACKAGE_DIR` 环境变量：用户显式指定，最高优先级；
2. Bun 二进制：可执行文件所在目录；
3. Node：从 `config.ts` 所在目录向上找。

## 动手跑：看当前包根在哪

```bash
cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a14/package-dir.mts <<'EOF'
import {
	getPackageDir,
	findNodePackageDir,
} from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/config.ts";

console.log("包根目录:", getPackageDir());
console.log("从 src 向上找:", findNodePackageDir("/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src"));
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a14/package-dir.mts
```

**预期输出**：

```text
包根目录: /Users/admin/Desktop/pi-study/pi/packages/coding-agent
从 src 向上找: /Users/admin/Desktop/pi-study/pi/packages/coding-agent
```

## 动手跑：用环境变量覆盖

```bash
cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a14/override.mts <<'EOF'
import { getPackageDir } from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/config.ts";

process.env.PI_PACKAGE_DIR = "/tmp/pi-override";
console.log("覆盖后包根:", getPackageDir());
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a14/override.mts
```

**预期输出**：

```text
覆盖后包根: /tmp/pi-override
```

## 动手跑：模拟 dist 特殊情况

```bash
cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a14/dist.mjs <<'EOF'
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const tmp = join(__dirname, "tmp-project");

// 建一个临时项目结构：tmp-project/package.json 和 tmp-project/dist/bundle/
rmSync(tmp, { recursive: true, force: true });
mkdirSync(join(tmp, "dist", "bundle"), { recursive: true });
writeFileSync(join(tmp, "package.json"), '{"name":"root"}');
writeFileSync(join(tmp, "dist", "package.json"), '{"name":"dist-meta"}');

// 动态导入 config.ts 的 findNodePackageDir（从源码）
const { findNodePackageDir } = await import("/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/config.ts");

console.log("从 dist/bundle 找:", findNodePackageDir(join(tmp, "dist", "bundle")));
console.log("（正确结果是 root，不是 dist）");

rmSync(tmp, { recursive: true, force: true });
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a14/dist.mjs
```

**预期输出**：

```text
从 dist/bundle 找: /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a14/tmp-project
（正确结果是 root，不是 dist）
```

## 小结

- `findNodePackageDir()` 从起点向上找最近的 `package.json`；
- 遇到 `dist` 目录会往上跳一层，避免资源路径重复；
- `getPackageDir()` 支持环境变量覆盖、Bun 二进制、Node 自动查找三种方式；
- 找到包根是读取 `package.json` 和内置资源的第一步。

## 下一讲预告

找到包根后，Pi 怎么读 `package.json`？

---

## 自测

1. `getPackageDir()` 的优先级是什么？
2. 为什么遇到 `dist` 目录要返回父目录？
3. 如果 `PI_PACKAGE_DIR` 设置了，`findNodePackageDir()` 还会被调用吗？
4. 当前环境下，`getPackageDir()` 返回什么路径？
