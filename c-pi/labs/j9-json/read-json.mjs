// 把 data.json 从「文字」读成「数据」
import { readFileSync } from "node:fs";

const text = readFileSync(
	"/Users/admin/Desktop/pi-study/c-pi/labs/j9-json/data.json",
	"utf8",
);
console.log("① 读出来的原样是一大段文字，前 20 个字符:");
console.log("  ", JSON.stringify(text.slice(0, 20)));

const data = JSON.parse(text);
console.log("② JSON.parse 之后可以按格子取:");
console.log("   name =", data.name);
console.log("   stable =", data.stable);
console.log("   entries 有几个 =", data.entries.length);
console.log("   嵌套格子 address.dir =", data.address.dir);
