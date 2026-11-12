# 第 15 讲 · 读取 package.json

> **对应源码**：`pi/packages/coding-agent/src/config.ts:577-607`

---

## 一句话

`config.ts` 在模块加载时会同步读取 `package.json`，去掉可能存在的 BOM，解析 JSON，然后从中推导出包名、版本、应用名等常量。

## 为什么要同步读取

这些常量（`APP_NAME`、`VERSION` 等）在 `setupCli()` 里就要用：

```ts
process.title = APP_NAME;
```

所以它们必须在 `setupCli()` 被调用之前就已经算好。而 `setupCli()` 之前是 `import` 阶段，因此 `config.ts` 选择在**模块顶层**同步读取 `package.json`。

## 源码

```ts
interface PackageJson {
	name?: string;
	version?: string;
	piConfig?: {
		name?: string;
		configDir?: string;
	};
}

let pkg: PackageJson = {};
let startupPackageJsonPath: string | undefined;
try {
	const packageJsonPath = getPackageJsonPath();
	pkg = JSON.parse(stripBom(readFileSync(packageJsonPath, "utf-8"))) as PackageJson;
	startupPackageJsonPath = packageJsonPath;
} catch (e: unknown) {
	const err = e as NodeJS.ErrnoException;
	if (err.code !== "ENOENT") throw e;
}
```

分步解释：

1. 声明一个接口 `PackageJson`，只描述本文件关心的字段；
2. 初始化 `pkg = {}`；
3. 调用 `getPackageJsonPath()` 得到路径；
4. `readFileSync` 同步读取文件内容；
5. `stripBom` 去掉开头的 BOM；
6. `JSON.parse` 解析成对象；
7. 把路径存到 `startupPackageJsonPath`；
8. 只捕获 `ENOENT`（文件不存在），其他错误继续抛出。

## 什么是 BOM

BOM（Byte Order Mark）是某些 UTF-8 文件开头的隐形字符，肉眼看不见，但会让 `JSON.parse` 失败。

`stripBom()` 会在解析前把它去掉。后面第 30 讲会专门拆解 `text.ts`。

## 为什么只放过 ENOENT

```ts
if (err.code !== "ENOENT") throw e;
```

- `ENOENT`：文件不存在 → 用默认值继续；
- JSON 语法错误、权限不足 → 直接抛错，因为这不是正常情况。

注意：这个 `try/catch` 发生在模块加载阶段。如果这里抛错，`cli.ts` 里的 `setupCli()` 根本不会开始。

## 动手跑：读 package.json

```bash
cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a15/read.mts <<'EOF'
import { readFileSync } from "node:fs";
import { stripBom } from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/utils/text.ts";

const path = "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/package.json";
const content = readFileSync(path, "utf-8");
const pkg = JSON.parse(stripBom(content));

console.log("name:", pkg.name);
console.log("version:", pkg.version);
console.log("piConfig:", pkg.piConfig);
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a15/read.mts
```

**预期输出**：

```text
name: @earendil-works/pi-coding-agent
version: 1.5.0
piConfig: { configDir: '.pi' }
```

## 动手跑：带 BOM 的 JSON

```bash
cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a15/bom.mjs <<'EOF'
import { writeFileSync, readFileSync, rmSync } from "node:fs";

const path = "/tmp/bom-test.json";

// 写一个带 BOM 的 JSON 文件
writeFileSync(path, "\uFEFF{\"name\":\"pi\"}");

// 直接读原始内容
const raw = readFileSync(path, "utf-8");
console.log("原始内容开头:", JSON.stringify(raw.slice(0, 5)));

// 直接 parse 会报错
try {
	JSON.parse(raw);
} catch (err) {
	console.log("直接 parse 报错:", err.message);
}

// 用 stripBom 后 parse
const { stripBom } = await import("/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/utils/text.ts");
const parsed = JSON.parse(stripBom(raw));
console.log("去 BOM 后:", parsed);

rmSync(path);
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a15/bom.mjs
```

**预期输出**（BOM 是不可见字符，所以第一行看起来像 `"﻿{"na"`，开头那一点就是 BOM；不同 Node 版本的报错措辞可能略有不同）：

```text
原始内容开头: "﻿{\"na"
直接 parse 报错: Unexpected token '﻿', "﻿{"name":"pi"}" is not valid JSON
去 BOM 后: { name: 'pi' }
```

## 小结

- `config.ts` 在模块加载时同步读取 `package.json`；
- 读取后用 `stripBom` 去掉 BOM，再用 `JSON.parse` 解析；
- 只放过 `ENOENT`，其他错误会直接抛出；
- 读到的数据用来推导 `APP_NAME`、`VERSION` 等常量。

## 下一讲预告

从 `package.json` 推导出 `APP_NAME`、`APP_TITLE`、`VERSION` 等常量。

---

## 自测

1. `config.ts` 为什么要在顶层同步读取 `package.json`？
2. `stripBom` 的作用是什么？
3. 如果 `package.json` 不存在，代码会怎么做？
4. 如果 `package.json` 有语法错误，代码会怎么做？
