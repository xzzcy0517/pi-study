import { writeFileSync, readFileSync, rmSync } from "node:fs";

const path = "/tmp/bom-test.json";

// 写一个带 BOM 的 JSON 文件
writeFileSync(path, "\uFEFF{\"name\":\"pi\"}");

// 直接读原始内容
const raw = readFileSync(path, "utf-8");
console.log("原始内容开头:", JSON.stringify(raw.slice(0, 5)));

// 直接 parse 会报错
try {
	JSON.parse(raw);
} catch (err) {
	console.log("直接 parse 报错:", err.message);
}

// 用 stripBom 后 parse
const { stripBom } = await import("/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/utils/text.ts");
const parsed = JSON.parse(stripBom(raw));
console.log("去 BOM 后:", parsed);

rmSync(path);
