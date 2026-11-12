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
