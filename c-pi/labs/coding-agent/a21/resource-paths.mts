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
