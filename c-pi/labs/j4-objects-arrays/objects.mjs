// 对象与数组演练
import { statSync } from "node:fs";

// ① 对象字面量 + 点号取值
const card = {
	pattern: "@earendil-works/pi-ai/*",
	replacements: ["./packages/ai/src/*.ts", "./packages/ai/src/providers/*.ts"],
};
console.log("① 点号取值 card.pattern:", card.pattern);

// ② 数组：下标从 0 数
console.log("② 数组第 2 个 replacements[1]:", card.replacements[1]);
console.log("   数组长度:", card.replacements.length);

// ③ 属性速写：{ pattern } 就是 { pattern: pattern }
const pattern = "@earendil-works/pi-tui";
const replacements = ["./packages/tui/src/index.ts"];
const card2 = { pattern, replacements };
console.log("③ 速写造出的卡片:", card2.pattern);

// ④ Object.entries：把对象「摊平」成一行一行的清单
const paths = {
	"@earendil-works/pi-ai": ["./packages/ai/src/index.ts"],
	"@earendil-works/pi-tui": ["./packages/tui/src/index.ts"],
};
console.log("④ Object.entries 摊平后:", Object.entries(paths));

// ⑤ 解构：把一对东西的「左兜」「右兜」一次掏出来
const pair = ["@earendil-works/pi-ai", ["./packages/ai/src/index.ts"]];
const [name, addr] = pair;
console.log("⑤ 解构: 左兜 =", name, "｜ 右兜 =", addr);

// ⑥ 链式调用：对「返回值」直接再操作
console.log(
	"⑥ statSync(...).isFile():",
	statSync("/Users/admin/Desktop/pi-study/pi/tsconfig.json").isFile(),
);
