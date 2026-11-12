import * as undici from "/Users/admin/Desktop/pi-study/pi/node_modules/undici/index.js";
import { configureHttpDispatcher } from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/core/http-dispatcher.ts";

console.log("配置前 dispatcher:", undici.getGlobalDispatcher().constructor.name);

configureHttpDispatcher();

console.log("配置后 dispatcher:", undici.getGlobalDispatcher().constructor.name);

// 用完关闭，避免进程挂起
await undici.getGlobalDispatcher().close();
