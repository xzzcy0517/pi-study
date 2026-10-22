// 字符串工具演练：全部用翻译官里的真实例子
const pattern = "@earendil-works/pi-ai/*";

console.log("① 长度 length:", pattern.length);
console.log("② * 在第几位 indexOf:", pattern.indexOf("*"));
console.log("③ 以 @earendil 开头吗 startsWith:", pattern.startsWith("@earendil"));
console.log("④ 以 /* 结尾吗 endsWith:", pattern.endsWith("/*"));
console.log("⑤ 包含 ai 吗 includes:", pattern.includes("ai"));

const star = pattern.indexOf("*");
console.log("⑥ 劈成前缀 slice(0, star):", JSON.stringify(pattern.slice(0, star)));
console.log("⑦ 劈出后缀 slice(star+1):", JSON.stringify(pattern.slice(star + 1)));

console.log("⑧ 负数下标 slice(0, -2)（从尾巴倒数）:", JSON.stringify("abcdef".slice(0, -2)));

console.log("⑨ 替换 replace:", pattern.replace("*", "providers/all"));

// 模板字符串：反引号 + ${}
const file = "index.ts";
console.log(`⑩ 模板字符串: packages/ai/src/${file}`);
