import {
	splitBom,
	stripBom,
} from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/utils/text.ts";

// ① 带 BOM：拆成 bom 和正文
const withBom = splitBom("\uFEFFhello");
console.log("① 带 BOM:");
console.log("  bom 的码点:", withBom.bom.codePointAt(0)?.toString(16));
console.log("  text:", JSON.stringify(withBom.text), "长度:", withBom.text.length);

// ② 不带 BOM：bom 是空字符串
const withoutBom = splitBom("hello");
console.log("\n② 无 BOM:");
console.log("  bom:", JSON.stringify(withoutBom.bom), "text:", JSON.stringify(withoutBom.text));

// ③ stripBom 只取正文
console.log("\n③ stripBom:", JSON.stringify(stripBom("\uFEFF{\"a\":1}")));

// ④ 连续两个 BOM：只去掉第一个
const twice = splitBom("\uFEFF\uFEFFhello");
console.log("\n④ 两个 BOM:");
console.log("  text 开头仍是 BOM:", twice.text.startsWith("\uFEFF"));
console.log("  text 长度:", twice.text.length);

// ⑤ 直接 JSON.parse 带 BOM 的文本会失败
try {
	JSON.parse("\uFEFF{\"a\":1}");
} catch (error) {
	console.log("\n⑤ 直接 parse 报错:", error.message);
}
