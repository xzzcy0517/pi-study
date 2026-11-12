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
