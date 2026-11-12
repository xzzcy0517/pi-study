# 第 27 讲 · 路径比较

> **对应源码**：`pi/packages/coding-agent/src/utils/paths.ts:22-78`

---

## 一句话

两个路径字符串看起来不同，可能指向同一个地方；看起来很像，也可能不是同一个地方。`paths.ts` 提供了一套比较规则：先转绝对路径、Windows 统一小写、按完整路径段判断包含关系，需要时再解析符号链接。

## 为什么不能直接比较字符串

三种常见坑：

```text
/a/b/../c  和  /a/c            → 其实是同一个位置
c:\Users\Me 和 C:\users\me     → Windows 上同一个目录
/home/me/app 和 /home/me/app2  → 前者不是后者的父目录！
```

第三条最容易出错：如果只用 `child.startsWith(parent)`，`/home/me/app2` 会被误判成在 `/home/me/app` 里面。

## 1. 需要真实路径时：canonicalizePath

```ts
export function canonicalizePath(path: string): string {
	try {
		return realpathSync(path);
	} catch {
		return path;
	}
}
```

- 文件存在：返回解析符号链接后的真实路径；
- 文件不存在、悬空链接等：原样返回，不抛错。

适合“尽量拿到真实位置”的场景，但不能用来证明文件存在。

## 2. 比较用的 key：getPathComparisonKey

```ts
export function getPathComparisonKey(path: string): string {
	const pathApi = getPlatformPathApi();
	const resolvedPath = pathApi.resolve(path);
	return pathApi === win32 ? resolvedPath.toLowerCase() : resolvedPath;
}
```

做两件事：

1. 转成绝对路径（`resolve` 会折叠 `..`）；
2. Windows 上统一小写。

它**不访问文件系统，也不解析符号链接**。需要把链接和目标视为同一位置时，先调用 `canonicalizePath()`。

## 3. 判断相等：pathsEqual

```ts
export function pathsEqual(left: string, right: string): boolean {
	return getPathComparisonKey(left) === getPathComparisonKey(right);
}
```

```ts
pathsEqual("/work/project/../project/a", "/work/project/a"); // true
```

## 4. 判断包含：isPathWithin

```ts
export function isPathWithin(parent: string, child: string): boolean {
	const parentKey = getPathComparisonKey(parent);
	const childKey = getPathComparisonKey(child);
	if (childKey === parentKey) return true;
	const pathSep = getPlatformPathApi().sep;
	return childKey.startsWith(parentKey.endsWith(pathSep) ? parentKey : `${parentKey}${pathSep}`);
}
```

三条规则：

1. 两者相同 → 算“在里面”；
2. 父路径结尾补上分隔符；
3. 子路径必须以“父路径 + 分隔符”开头。

这样 `/home/me2/project` 就不会被 `/home/me` 误判包含。

文件系统根 `/` 本身以分隔符结尾，所以不会再补一个。

## 5. 显示用：shortenHomePath

```ts
export function shortenHomePath(path: string, homeDir: string = homedir()): string {
	const pathApi = getPlatformPathApi();
	if (!homeDir || !pathApi.isAbsolute(path) || !isPathWithin(homeDir, path)) return path;
	const relativePath = pathApi.relative(homeDir, path);
	return relativePath ? `~${pathApi.sep}${relativePath}` : "~";
}
```

只做显示替换：

```text
/Users/admin/project  →  ~/project
/Users/admin          →  ~
相对路径              →  原样返回
```

不会改写磁盘上的任何路径。

## 动手跑：比较、包含、符号链接、Windows

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a27

cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a27/compare.mts <<'EOF'
import { mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	canonicalizePath,
	getPathComparisonKey,
	pathsEqual,
	isPathWithin,
	shortenHomePath,
} from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/utils/paths.ts";

// ① 比较用的 key：会转绝对路径、折叠 ..
console.log("① comparison key:", getPathComparisonKey("/a/b/../c"));
console.log("   pathsEqual:", pathsEqual("/work/project/../project/a", "/work/project/a"));

// ② 包含关系：按完整路径段判断
console.log("\n② isPathWithin:");
const pairs: [string, string][] = [
	["/home/me", "/home/me"],
	["/home/me", "/home/me/project"],
	["/home/me", "/home/me2/project"],
	["/", "/etc"],
];
for (const [parent, child] of pairs) {
	console.log("  ", JSON.stringify(parent), "→", JSON.stringify(child), "=", isPathWithin(parent, child));
}

// ③ 主目录缩短用于显示
console.log("\n③ shortenHomePath:");
console.log("  ", shortenHomePath("/home/me/project", "/home/me"));
console.log("  ", shortenHomePath("/home/me", "/home/me"));
console.log("  ", shortenHomePath("/home/me2/project", "/home/me"));

// ④ 符号链接：canonicalizePath 会解析到真实目标
const dir = mkdtempSync(join(tmpdir(), "pi-path-"));
const target = join(dir, "target.txt");
const link = join(dir, "link.txt");
writeFileSync(target, "hi");
symlinkSync(target, link);
console.log("\n④ canonicalizePath:");
console.log("  链接:", canonicalizePath(link));
console.log("  目标:", canonicalizePath(target));
console.log("  不存在时原样返回:", canonicalizePath(join(dir, "nope.txt")) === join(dir, "nope.txt"));

// ⑤ 模拟 Windows：大小写不敏感
const originalPlatform = Object.getOwnPropertyDescriptor(process, "platform");
Object.defineProperty(process, "platform", { value: "win32" });
console.log("\n⑤ 模拟 Windows:");
console.log("  pathsEqual 大小写:", pathsEqual("C:\\Users\\Me", "c:\\users\\me"));
console.log("  兄弟目录前缀:", isPathWithin("C:\\Users\\Me", "C:\\Users\\Me2"));
if (originalPlatform) Object.defineProperty(process, "platform", originalPlatform);

rmSync(dir, { recursive: true, force: true });
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a27/compare.mts
```

**预期输出**（临时目录名和路径会变化；macOS 上 `/var` 会被解析成 `/private/var`）：

```text
① comparison key: /a/c
   pathsEqual: true

② isPathWithin:
   "/home/me" → "/home/me" = true
   "/home/me" → "/home/me/project" = true
   "/home/me" → "/home/me2/project" = false
   "/" → "/etc" = true

③ shortenHomePath:
   ~/project
   ~
   /home/me2/project

④ canonicalizePath:
  链接: /private/var/folders/.../target.txt
  目标: /private/var/folders/.../target.txt
  不存在时原样返回: true

⑤ 模拟 Windows:
  pathsEqual 大小写: true
  兄弟目录前缀: false
```

## 观察点

1. `/a/b/../c` 被折叠成 `/a/c`；
2. `/home/me2/project` 不在 `/home/me` 里——完整路径段比较起了作用；
3. `/` 包含 `/etc`，根目录是特殊情况；
4. 链接和目标解析到同一个真实路径；
5. 模拟 Windows 后大小写不同也算相等，`Me2` 仍不算 `Me` 的子目录。

## 小结

- `canonicalizePath()` 解析符号链接，失败时原样返回；
- `getPathComparisonKey()` 转绝对路径，Windows 下统一小写；
- `pathsEqual()` 比较两个 key；
- `isPathWithin()` 按完整路径段判断，避免前缀误判；
- `shortenHomePath()` 只用于显示。

## 下一讲预告

路径字符串本身怎么清理：展开 `~`、转换 `file://`、处理 Windows shell 路径。

---

## 自测

1. `getPathComparisonKey()` 会访问文件系统吗？
2. 为什么要给父路径补上结尾分隔符？
3. `/home/me` 包含 `/home/me2/project` 吗？为什么？
4. 什么时候应该先用 `canonicalizePath()`？
