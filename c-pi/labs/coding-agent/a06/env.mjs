console.log("改之前:");
console.log("  PI_CODING_AGENT:", process.env.PI_CODING_AGENT);
console.log("  AI_AGENT:", process.env.AI_AGENT);

process.env.PI_CODING_AGENT = "true";
process.env.AI_AGENT = "pi";

console.log("改之后:");
console.log("  PI_CODING_AGENT:", process.env.PI_CODING_AGENT);
console.log("  AI_AGENT:", process.env.AI_AGENT);
console.log("  类型:", typeof process.env.PI_CODING_AGENT);

if (process.env.AI_AGENT === "pi") {
	console.log("✅ 确认：当前是 Pi agent 环境");
}
