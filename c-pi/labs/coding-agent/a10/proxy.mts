import { applyHttpProxySettings } from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/core/http-dispatcher.ts";

// 先把环境变量清空（仅用于实验）
delete process.env.HTTP_PROXY;
delete process.env.HTTPS_PROXY;

console.log("初始状态:");
console.log("  HTTP_PROXY:", process.env.HTTP_PROXY);
console.log("  HTTPS_PROXY:", process.env.HTTPS_PROXY);

applyHttpProxySettings("  http://127.0.0.1:7890  ");

console.log("\n设置后:");
console.log("  HTTP_PROXY:", process.env.HTTP_PROXY);
console.log("  HTTPS_PROXY:", process.env.HTTPS_PROXY);

// 模拟环境变量已存在的情况
process.env.HTTP_PROXY = "http://already-set:8080";
applyHttpProxySettings("http://new-proxy:9999");

console.log("\nHTTP_PROXY 已存在时再次设置:");
console.log("  HTTP_PROXY:", process.env.HTTP_PROXY, "（应保留旧值）");

// 模拟空值或纯空白
applyHttpProxySettings("   ");
console.log("\n传入空白后:");
console.log("  HTTP_PROXY:", process.env.HTTP_PROXY, "（应不变）");
