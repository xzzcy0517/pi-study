// 翻译官两个帮手函数的「演练场」——原样照搬，喂给它们各种输入看输出
import { existsSync, statSync } from "node:fs";
import { extname, resolve, sep } from "node:path";

const repositoryRoot = "/Users/admin/Desktop/pi-study/pi/";

// ── 帮手 1：对暗号（第 64–68 行同款）──
function matchAlias(alias, specifier) {
	if (!alias.pattern.includes("*"))
		return specifier === alias.pattern ? "" : undefined;
	if (!specifier.startsWith(alias.prefix) || !specifier.endsWith(alias.suffix))
		return undefined;
	return specifier.slice(
		alias.prefix.length,
		specifier.length - alias.suffix.length,
	);
}

// ── 帮手 2：找真文件（第 70–86 行同款）──
function resolveSourcePath(replacement) {
	const basePath = resolve(repositoryRoot, replacement);
	const rootPrefix = repositoryRoot.endsWith(sep)
		? repositoryRoot
		: `${repositoryRoot}${sep}`;
	if (!basePath.startsWith(rootPrefix)) return undefined;
	const extension = extname(basePath);
	const sourceExtension =
		extension === ".js"
			? ".ts"
			: extension === ".mjs"
				? ".mts"
				: extension === ".cjs"
					? ".cts"
					: undefined;
	const candidates = sourceExtension
		? [basePath, `${basePath.slice(0, -extension.length)}${sourceExtension}`]
		: extension === ".ts" ||
				extension === ".mts" ||
				extension === ".cts" ||
				extension === ".json"
			? [basePath]
			: [basePath, `${basePath}.ts`, resolve(basePath, "index.ts")];
	for (const candidate of candidates) {
		if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
	}
	return undefined;
}

// ── 演练开始 ──
console.log("===== 帮手 1：对暗号 =====");
const exactCard = {
	pattern: "@earendil-works/pi-ai",
	prefix: "@earendil-works/pi-ai",
	suffix: "",
};
const starCard = {
	pattern: "@earendil-works/pi-ai/*",
	prefix: "@earendil-works/pi-ai/",
	suffix: "",
};
console.log(
	"精确卡 vs 全对上的暗号 →",
	JSON.stringify(matchAlias(exactCard, "@earendil-works/pi-ai")),
	"（空字符串 = 对上，* 没捕到东西）",
);
console.log(
	"精确卡 vs 多拖了尾巴的暗号 →",
	matchAlias(exactCard, "@earendil-works/pi-ai/oauth"),
	"（undefined = 没对上）",
);
console.log(
	"带 * 卡 vs 子路径暗号 →",
	JSON.stringify(matchAlias(starCard, "@earendil-works/pi-ai/providers/all")),
	"（* 捕到的部分）",
);
console.log(
	"带 * 卡 vs 别家暗号 →",
	matchAlias(starCard, "@earendil-works/pi-tui"),
	"（undefined = 前缀对不上）",
);

console.log("\n===== 帮手 2：找真文件 =====");
console.log(
	"① 明写 .ts 的地址 →",
	resolveSourcePath("./packages/ai/src/compat.ts"),
);
console.log(
	"② 写着 .js 的地址（自动换 .ts）→",
	resolveSourcePath("./packages/ai/src/models.js"),
);
console.log(
	"③ 不带后缀（依次试 裸名 / +.ts / 文件夹找 index.ts）→",
	resolveSourcePath("./packages/ai/src/providers/all"),
);
console.log(
	"④ 想逃出仓库的地址（拒绝服务）→",
	resolveSourcePath("../../../../etc/hostname"),
);
console.log(
	"⑤ 仓库里但根本不存在的文件 →",
	resolveSourcePath("./packages/ai/src/不存在的文件.ts"),
);
