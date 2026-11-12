import * as undici from "/Users/admin/Desktop/pi-study/pi/node_modules/undici/index.js";
import { configureHttpDispatcher } from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/core/http-dispatcher.ts";

try {
	configureHttpDispatcher("不是数字");
} catch (err) {
	console.log("捕获到错误:", (err as Error).message);
}

// 确认全局 dispatcher 没变
console.log("dispatcher 仍是:", undici.getGlobalDispatcher().constructor.name);
