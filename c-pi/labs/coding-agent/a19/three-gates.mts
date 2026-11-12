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
