// 把 tsconfig.json 的「花名册」加工成「翻译卡片」——和翻译官第 29–43 行同款逻辑
import { readFileSync } from "node:fs";

const tsconfig = JSON.parse(
	readFileSync("/Users/admin/Desktop/pi-study/pi/tsconfig.json", "utf8"),
);
const paths = tsconfig.compilerOptions.paths;

const cards = Object.entries(paths)
	.filter(([pattern]) => pattern.startsWith("@earendil-works/"))
	.map(([pattern, replacements]) => {
		const wildcard = pattern.indexOf("*");
		return {
			pattern,
			prefix: wildcard === -1 ? pattern : pattern.slice(0, wildcard),
			suffix: wildcard === -1 ? "" : pattern.slice(wildcard + 1),
			replacements,
		};
	})
	.sort((a, b) => b.pattern.length - a.pattern.length);

console.log("翻译卡片总数:", cards.length);

console.log("\n排最前面的 3 张（最长 = 最具体，优先试）:");
for (const c of cards.slice(0, 3)) {
	console.log(`  ${c.pattern}  （长度 ${c.pattern.length}）`);
}

console.log("\n带 * 的卡会被拆成「前缀 + 后缀」，以 @earendil-works/pi-ai/* 为例:");
const star = cards.find((c) => c.pattern === "@earendil-works/pi-ai/*");
console.log("  前缀 prefix:", JSON.stringify(star.prefix));
console.log("  后缀 suffix:", JSON.stringify(star.suffix));
console.log("  替换地址 replacements:", JSON.stringify(star.replacements));

console.log("\n不带 * 的卡（精确暗号），以 @earendil-works/pi-ai 为例:");
const exact = cards.find((c) => c.pattern === "@earendil-works/pi-ai");
console.log("  前缀 = 整张卡:", JSON.stringify(exact.prefix));
console.log("  后缀:", JSON.stringify(exact.suffix), "（空字符串）");
