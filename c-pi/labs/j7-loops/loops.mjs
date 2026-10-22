// 循环演练
// ① for...of：把清单里的东西一个个拿出来
const cards = ["pi-ai", "pi-tui", "chord"];
for (const c of cards) {
	console.log("① 处理:", c);
}

// ② continue：这个跳过，继续下一个
console.log("② 跳过 pi-tui：");
for (const c of cards) {
	if (c === "pi-tui") continue;
	console.log("   处理:", c);
}

// ③ 双层循环：每张卡 × 每个地址（翻译官前台的日常）
const deck = [
	{ pattern: "pi-ai", replacements: ["ai/index.ts"] },
	{ pattern: "pi-tui", replacements: ["tui/index.ts", "tui/fallback.ts"] },
];
console.log("③ 双层循环：");
for (const card of deck) {
	for (const r of card.replacements) {
		console.log(`   卡片 ${card.pattern} 试地址 ${r}`);
	}
}
