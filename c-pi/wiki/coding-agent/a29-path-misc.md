# 第 29 讲 · 路径小工具：来源判断、文件指纹、云同步标记

> **对应源码**：`pi/packages/coding-agent/src/utils/paths.ts:80-109`、`169-184`

---

## 一句话

`paths.ts` 还剩三个小工具：`isLocalPath()` 判断一个字符串是不是本地路径，`getFileRevision()` 给文件拍个“指纹”，`markPathIgnoredByCloudSync()` 尽量让云同步工具忽略某个目录。

## 1. isLocalPath：这个来源是本地吗

```ts
export function isLocalPath(value: string): boolean {
	const trimmed = value.trim();
	if (
		trimmed.startsWith("npm:") ||
		trimmed.startsWith("git:") ||
		trimmed.startsWith("github:") ||
		trimmed.startsWith("http:") ||
		trimmed.startsWith("https:") ||
		trimmed.startsWith("ssh:") ||
		trimmed.startsWith("builtin:")
	) {
		return false;
	}
	return true;
}
```

规则：**认识的非本地前缀返回 `false`，其余都算本地**。

| 输入 | 结果 | 原因 |
|---|---|---|
| `./tool.ts` | true | 相对路径 |
| `tool` | true | 裸名称按本地处理 |
| `file:///tmp/tool.ts` | true | file URL 是本地路径 |
| `npm:pkg` | false | npm 包来源 |
| `git:...` | false | Git 来源 |
| `https://...` | false | 远程 URL |
| `builtin:...` | false | 内置扩展 |

先 `trim()`，所以首尾空白不影响判断。

## 2. getFileRevision：文件指纹

```ts
export function getFileRevision(path: string): string | undefined {
	try {
		const stats = statSync(path, { bigint: true });
		return `${stats.dev}:${stats.ino}:${stats.size}:${stats.mtimeNs}:${stats.ctimeNs}`;
	} catch {
		return undefined;
	}
}
```

由五个字段拼成：

| 字段 | 含义 |
|---|---|
| `dev` | 设备号 |
| `ino` | inode 号 |
| `size` | 文件大小 |
| `mtimeNs` | 内容修改时间（纳秒） |
| `ctimeNs` | 元数据变化时间（纳秒） |

用途是快速判断“文件可能变了没有”，比读整个文件算哈希便宜。

两个注意点：

- 它不是内容哈希，理论上内容变了但大小和时间都没变的极端情况检测不到；
- `ctime` 在 Unix 上是**元数据变化时间**，不是创建时间。

读取失败（文件不存在、没权限）返回 `undefined`。

## 3. markPathIgnoredByCloudSync：让云盘别同步

```ts
export function markPathIgnoredByCloudSync(path: string): void {
	const attrs =
		process.platform === "darwin"
			? ["com.dropbox.ignored", "com.apple.fileprovider.ignore#P"]
			: process.platform === "linux"
				? ["user.com.dropbox.ignored"]
				: [];

	for (const attr of attrs) {
		if (process.platform === "darwin") {
			spawnProcessSync("xattr", ["-w", attr, "1", path], { encoding: "utf-8", stdio: "ignore" });
		} else {
			spawnProcessSync("setfattr", ["-n", attr, "-v", "1", path], { encoding: "utf-8", stdio: "ignore" });
		}
	}
}
```

- macOS：调用 `xattr` 写扩展属性；
- Linux：调用 `setfattr`；
- 其他平台：什么都不做。

这些属性名是 Dropbox 和 Apple File Provider 认的“忽略同步”标记。作用大概是：不要让网盘同步某些目录（比如 `node_modules` 这种巨大且可重建的内容）。

它是“尽力而为”：没有检查命令返回值，失败也不会抛错、不会影响主流程。

**本次 `setupCli()` 不会调用它。** 只有在包管理器相关流程里才可能用到。

## 动手跑：三个小工具一起看

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a29

cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a29/misc.mts <<'EOF'
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	getFileRevision,
	isLocalPath,
	markPathIgnoredByCloudSync,
} from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/utils/paths.ts";

// ① 判断是不是本地路径
console.log("① isLocalPath:");
const values = [
	"./tool.ts",
	"tool",
	"file:///tmp/tool.ts",
	"npm:pkg",
	"git:github.com/x/y",
	"https://example.com",
	"builtin:memory",
];
for (const value of values) {
	console.log("  ", value.padEnd(28), "=>", isLocalPath(value));
}

// ② 文件指纹：内容或元数据变化都会变
const dir = mkdtempSync(join(tmpdir(), "pi-rev-"));
const file = join(dir, "a.txt");
writeFileSync(file, "hello");
const rev1 = getFileRevision(file);
writeFileSync(file, "hello world");
const rev2 = getFileRevision(file);

console.log("\n② getFileRevision:");
console.log("  第一次是字符串:", typeof rev1 === "string");
console.log("  字段数:", rev1?.split(":").length);
console.log("  内容变了，指纹也变:", rev1 !== rev2);
console.log("  文件不存在:", getFileRevision(join(dir, "nope.txt")));

// ③ 给临时文件打云同步忽略标记（只在本机临时目录尝试）
const ignored = join(dir, "ignored.txt");
writeFileSync(ignored, "x");
markPathIgnoredByCloudSync(ignored);
console.log("\n③ markPathIgnoredByCloudSync 已调用（尽力而为，不检查结果）");

rmSync(dir, { recursive: true, force: true });
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a29/misc.mts
```

**预期输出**：

```text
① isLocalPath:
   ./tool.ts                    => true
   tool                         => true
   file:///tmp/tool.ts          => true
   npm:pkg                      => false
   git:github.com/x/y           => false
   https://example.com          => false
   builtin:memory               => false

② getFileRevision:
  第一次是字符串: true
  字段数: 5
  内容变了，指纹也变: true
  文件不存在: undefined

③ markPathIgnoredByCloudSync 已调用（尽力而为，不检查结果）
```

## 观察点

1. `file://` 被算作本地路径，`npm:` / `git:` / `https:` 不是；
2. 指纹有 5 个字段，内容一改就变；
3. 文件不存在时返回 `undefined`，不抛错；
4. 云同步标记只是“尝试”，不会告诉你成功还是失败。

## 小结

- `isLocalPath()` 根据已知前缀排除非本地来源；
- `getFileRevision()` 用 5 个元数据字段做轻量指纹；
- `markPathIgnoredByCloudSync()` 在 macOS/Linux 写扩展属性，尽力而为；
- 三个函数都不在 `setupCli()` 的启动路径里。

## 下一讲预告

最后一个工具文件 `text.ts`：只有 9 行，专门处理开头的 BOM。

---

## 自测

1. `file://` 算本地路径吗？
2. 文件指纹包含哪五个字段？
3. `ctime` 是创建时间吗？
4. `markPathIgnoredByCloudSync()` 失败会抛错吗？
