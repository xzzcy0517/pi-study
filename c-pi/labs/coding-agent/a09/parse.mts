import { parseHttpIdleTimeoutMs } from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/core/http-dispatcher.ts";

const inputs = [
	undefined,
	"",
	" disabled ",
	"1500.9",
	"nope",
	1500.9,
	0,
	-1,
	Infinity,
	null,
];

// 用 String() 而不是 JSON.stringify()：后者会把 Infinity 显示成 null
for (const value of inputs) {
	const label = typeof value === "string" ? JSON.stringify(value) : String(value);
	console.log(label, "=>", parseHttpIdleTimeoutMs(value));
}
