// 判断与逻辑符号演练
// ① 比较：=== 全等 / !== 不全等
console.log("① 1 + 1 === 2 →", 1 + 1 === 2);
console.log("  'a' !== 'b' →", "a" !== "b");

// ② ! 取反 + 「空不空」判断（truthy/falsy）
console.log("② !'' →", !"", "（空字符串算「没有」）");
console.log("  !'有内容' →", !"有内容");
console.log("  !undefined →", !undefined);

// ③ && 并且 / || 或者
const spec = "@earendil-works/pi-ai/providers/all";
console.log(
	"③ 前缀对 && 后缀对 →",
	spec.startsWith("@earendil-works/pi-ai/") && spec.endsWith("/all"),
);
console.log("  是 a 或 b 或很长 →", spec === "a" || spec === "b" || spec.length > 10);

// ④ 三元 ? : 与连环三元（翻译官第 76 行同款）
const ext = ".mjs";
const tsExt =
	ext === ".js" ? ".ts" : ext === ".mjs" ? ".mts" : ext === ".cjs" ? ".cts" : undefined;
console.log("④ 连环三元: .mjs 对应 →", tsExt);

// ⑤ undefined 和 "" 是两回事（对暗号的关键）
console.log("⑤ undefined === '' →", undefined === "");
