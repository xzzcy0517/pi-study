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
