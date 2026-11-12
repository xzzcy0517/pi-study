import {
	isBunBinary,
	isBunRuntime,
	isBundledNode,
} from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/config.ts";

console.log("isBunBinary:", isBunBinary);
console.log("isBunRuntime:", isBunRuntime);
console.log("isBundledNode:", isBundledNode);

if (!isBunBinary && !isBunRuntime && !isBundledNode) {
	console.log("当前是普通 Node 源码运行");
}
