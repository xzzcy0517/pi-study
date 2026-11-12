# 第 28 讲 · 路径规范化与解析

> **对应源码**：`pi/packages/coding-agent/src/utils/paths.ts:111-167`

---

## 一句话

`normalizePath()` 负责“清理写法”（去空白、展开 `~`、转 `file://`），`resolvePath()` 在它基础上再“补成绝对路径”。两个函数分工不同。

## 处理顺序很重要

`normalizePath()` 按固定顺序做事：

```text
可选 trim（去首尾空白）
  → 可选 Unicode 空格归一化
  → 可选去掉一个前导 @
  → Windows 上转换 shell 盘符路径
  → 默认展开开头的 ~
  → file:// URL 转本地路径
  → 返回
```

顺序错了会出问题。比如先去掉 `@` 再 trim，`"  @~/file  "` 就处理不干净。

## normalizePath 源码

```ts
export function normalizePath(input: string, options: PathInputOptions = {}): string {
	let normalized = options.trim ? input.trim() : input;
	if (options.normalizeUnicodeSpaces) {
		normalized = normalized.replace(UNICODE_SPACES, " ");
	}
	if (options.stripAtPrefix && normalized.startsWith("@")) {
		normalized = normalized.slice(1);
	}
	if (process.platform === "win32") {
		normalized = normalizeWindowsShellPath(normalized);
	}

	if (options.expandTilde ?? true) {
		const home = options.homeDir ?? homedir();
		if (normalized === "~") return home;
		if (normalized.startsWith("~/") || (process.platform === "win32" && normalized.startsWith("~\\"))) {
			return join(home, normalized.slice(2));
		}
	}

	if (/^file:\/\//.test(normalized)) {
		return fileURLToPath(normalized);
	}

	return normalized;
}
```

### 哪些是默认行为

| 选项 | 默认 |
|---|---|
| `trim` | 关 |
| `normalizeUnicodeSpaces` | 关 |
| `stripAtPrefix` | 关 |
| `expandTilde` | **开** |

只有展开 `~` 是默认开启的，其他都需要显式传 `true`。

### 只认两种 `~` 写法

```ts
if (normalized === "~") return home;
if (normalized.startsWith("~/") || ...) return join(home, normalized.slice(2));
```

`~` 和 `~/...` 会展开，`~otheruser/...` **不会**——那是“其他用户的主目录”写法，Pi 不处理。

### file:// 才走 URL 解析

```ts
if (/^file:\/\//.test(normalized)) {
	return fileURLToPath(normalized);
}
```

- `file:///tmp/a%20b.txt` → `/tmp/a b.txt`；
- 普通文件名里的 `%20` 不会被解码；
- 非法 file URL 会抛错。

## normalizeWindowsShellPath

```ts
export function normalizeWindowsShellPath(filePath: string): string {
	if (!filePath.startsWith("/") || filePath.startsWith("//") || filePath.includes("\\")) return filePath;
	const match = filePath.match(/^\/(?:mnt\/|cygdrive\/)?([a-z])(?:\/(.*))?$/i);
	if (!match) return filePath;
	const suffix = match[2]?.replaceAll("/", "\\");
	return `${match[1].toUpperCase()}:\\${suffix ?? ""}`;
}
```

把 Git Bash / MSYS / Cygwin / WSL 风格转成 Windows 盘符：

```text
/c/Users/me       → C:\Users\me
/cygdrive/d/work  → D:\work
/mnt/e/source     → E:\source
```

不符合规则的（UNC 路径 `//server/share`、已含反斜杠、`/tmp/file`）原样返回。

## resolvePath：再补成绝对路径

```ts
export function resolvePath(input: string, baseDir: string = process.cwd(), options: PathInputOptions = {}): string {
	const normalized = normalizePath(input, options);
	const normalizedBaseDir = normalizePath(baseDir);
	return isAbsolute(normalized) ? nodeResolvePath(normalized) : nodeResolvePath(normalizedBaseDir, normalized);
}
```

区别可以记成：

```text
normalizePath：清理写法，但可能还是相对路径
resolvePath：清理写法 + 以 baseDir 为基准变成绝对路径
```

```ts
resolvePath("demo/../a.txt", "/work/project"); // /work/project/a.txt
```

## 相对 cwd 的显示

```ts
export function getCwdRelativePath(filePath: string, cwd: string): string | undefined {
	const resolvedCwd = resolvePath(cwd);
	const resolvedPath = resolvePath(filePath, resolvedCwd);
	const relativePath = relative(resolvedCwd, resolvedPath);
	const isInsideCwd =
		relativePath === "" ||
		(relativePath !== ".." && !relativePath.startsWith(`..${sep}`) && !isAbsolute(relativePath));

	return isInsideCwd ? relativePath || "." : undefined;
}
```

| 情况 | 返回 |
|---|---|
| 在 cwd 内部 | 相对路径，如 `src/a.ts` |
| 就是 cwd 本身 | `"."` |
| 在 cwd 外 | `undefined` |

注意 `..config` 是合法的目录名，不会被当成越界；只有真正的 `..` 父级跳转才算外部。

```ts
export function formatPathRelativeToCwdOrAbsolute(filePath: string, cwd: string): string {
	const absolutePath = resolvePath(filePath, cwd);
	return (getCwdRelativePath(absolutePath, cwd) ?? absolutePath).split(sep).join("/");
}
```

它优先显示相对路径，外部路径保留绝对路径，并把分隔符统一成 `/`（仅用于显示）。

## 动手跑：一次看全所有转换

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a28

cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a28/normalize.mts <<'EOF'
import {
	getCwdRelativePath,
	normalizePath,
	normalizeWindowsShellPath,
	resolvePath,
	formatPathRelativeToCwdOrAbsolute,
} from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/utils/paths.ts";

// ① 只展开 ~ 和 ~/ 开头
console.log("① tilde:");
console.log("  ~/demo.txt =>", normalizePath("~/demo.txt", { homeDir: "/home/me" }));
console.log("  ~me/demo.txt =>", normalizePath("~me/demo.txt", { homeDir: "/home/me" }));

// ② 可选项组合：去空白、去 @、Unicode 空格归一化、展开 ~
const messy = "  @~/a\u00A0b.txt  ";
console.log("\n② 选项组合:");
console.log("  原始:", JSON.stringify(messy));
console.log("  处理后:", normalizePath(messy, {
	trim: true,
	stripAtPrefix: true,
	normalizeUnicodeSpaces: true,
	homeDir: "/home/me",
}));

// ③ file:// URL 转本地路径
console.log("\n③ file URL:", normalizePath("file:///tmp/a%20b.txt"));

// ④ Windows shell 路径转换
console.log("\n④ Windows shell:");
console.log("  /mnt/c/Users/me =>", normalizeWindowsShellPath("/mnt/c/Users/me"));
console.log("  //server/share =>", normalizeWindowsShellPath("//server/share"));

// ⑤ resolvePath：补成绝对路径并折叠 ..
console.log("\n⑤ resolvePath:", resolvePath("demo/../a.txt", "/work/project"));

// ⑥ cwd 相对路径
console.log("\n⑥ getCwdRelativePath:");
console.log("  内部:", getCwdRelativePath("/work/project/src/a.ts", "/work/project"));
console.log("  就是 cwd:", getCwdRelativePath("/work/project", "/work/project"));
console.log("  外部:", getCwdRelativePath("/work/other/a.ts", "/work/project"));
console.log("  ..config 是正常名字:", getCwdRelativePath("/work/project/..config/AGENTS.md", "/work/project"));

// ⑦ 显示用路径
console.log("\n⑦ formatPathRelativeToCwdOrAbsolute:");
console.log("  内部:", formatPathRelativeToCwdOrAbsolute("/work/project/src/a.ts", "/work/project"));
console.log("  外部:", formatPathRelativeToCwdOrAbsolute("/work/other/a.ts", "/work/project"));
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a28/normalize.mts
```

**预期输出**（`②` 的原始字符串里有一个不换行空格 U+00A0，看起来像普通空格）：

```text
① tilde:
  ~/demo.txt => /home/me/demo.txt
  ~me/demo.txt => ~me/demo.txt

② 选项组合:
  原始: "  @~/a b.txt  "
  处理后: /home/me/a b.txt

③ file URL: /tmp/a b.txt

④ Windows shell:
  /mnt/c/Users/me => C:\Users\me
  //server/share => //server/share

⑤ resolvePath: /work/project/a.txt

⑥ getCwdRelativePath:
  内部: src/a.ts
  就是 cwd: .
  外部: undefined
  ..config 是正常名字: ..config/AGENTS.md

⑦ formatPathRelativeToCwdOrAbsolute:
  内部: src/a.ts
  外部: /work/other/a.ts
```

## 观察点

1. `~me/demo.txt` 没有被展开——只认 `~` 和 `~/`；
2. 组合选项按“trim → 去 @ → 归一化空格 → 展开 ~”的顺序，最后得到干净路径；
3. `/mnt/c/...` 转成 `C:\...`，UNC 路径保持原样；
4. `resolvePath` 折叠了 `demo/..`；
5. `..config` 是正常目录名，而真正的 `..` 父级跳转被判定为外部。

## 小结

- `normalizePath()` 清理写法，默认只展开 `~`；
- 其他选项（trim、去 `@`、Unicode 空格）需要显式开启；
- `normalizeWindowsShellPath()` 处理 Git Bash/WSL 风格路径；
- `resolvePath()` 在清理后补成绝对路径；
- `getCwdRelativePath()` 判断是否在 cwd 内，`formatPathRelativeToCwdOrAbsolute()` 只管显示。

## 下一讲预告

还剩三个小工具：判断本地路径、文件指纹、云同步忽略标记。

---

## 自测

1. `normalizePath()` 默认会展开 `~otheruser` 吗？
2. `normalizePath()` 会把相对路径变绝对路径吗？
3. `../config` 和 `..config` 在 `getCwdRelativePath()` 里有什么区别？
4. `/cygdrive/d/work` 会被转成什么？
