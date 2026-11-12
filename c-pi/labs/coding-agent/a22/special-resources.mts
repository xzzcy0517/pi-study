import { existsSync } from "node:fs";
import {
	getQuickJSWasmPath,
	setEmbeddedQuickJSWasmPath,
	resolveCodemodeWorkerSpecifier,
	getCodemodeWorkerSpecifier,
} from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/config.ts";

// ① QuickJS Wasm：首次调用时解析并缓存
const wasm = getQuickJSWasmPath();
console.log("QuickJS wasm:", wasm);
console.log("文件存在:", existsSync(wasm));

// ② Bun 入口可以提前告诉配置中心内嵌文件的位置
setEmbeddedQuickJSWasmPath("/tmp/embedded-quickjs.wasm");
console.log("设置内嵌路径后:", getQuickJSWasmPath());

// ③ worker 入口按运行形态选择
console.log("\nworker 入口:");
for (const runtime of ["bun-binary", "bundled-node", "unbundled"] as const) {
	const spec = resolveCodemodeWorkerSpecifier(runtime, "file:///release/config.js");
	console.log(" ", runtime.padEnd(12), "=>", spec instanceof URL ? spec.href : spec);
}

console.log("\n当前运行时 =>", getCodemodeWorkerSpecifier());

// ④ data URL 是什么
const source = 'console.log("hello from data url")';
const dataUrl = new URL(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
console.log("\ndata URL:", dataUrl.href.slice(0, 72) + "...");
