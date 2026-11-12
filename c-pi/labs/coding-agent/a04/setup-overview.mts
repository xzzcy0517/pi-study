import { setupCli } from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/cli/setup.ts";

console.log("调用前 process.title:", process.title);
console.log("调用前 env.PI_CODING_AGENT:", process.env.PI_CODING_AGENT);
console.log("调用前 env.AI_AGENT:", process.env.AI_AGENT);

setupCli();

console.log("调用后 process.title:", process.title);
console.log("调用后 env.PI_CODING_AGENT:", process.env.PI_CODING_AGENT);
console.log("调用后 env.AI_AGENT:", process.env.AI_AGENT);

// 触发一次警告，看看会不会显示
process.emitWarning("这条警告用于验证空函数替换，不应显示");
console.log("如果没看到上一句警告，说明屏蔽生效");
