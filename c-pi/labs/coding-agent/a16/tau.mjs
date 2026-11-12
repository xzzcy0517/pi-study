// 用一个临时 package.json 模拟改名
import { writeFileSync, rmSync } from "node:fs";

const tmpPkg = "/tmp/pi-tau-package.json";
writeFileSync(tmpPkg, JSON.stringify({
	name: "@earendil-works/tau-coding-agent",
	version: "9.9.9",
	piConfig: { name: "tau", configDir: ".tau" },
}));

// 手动推导（模拟 config.ts 的逻辑）
const fs = await import("node:fs");
const pkg = JSON.parse(await fs.promises.readFile(tmpPkg, "utf-8"));
const piConfigName = pkg.piConfig?.name;
const appName = piConfigName || "pi";
const envAgentDir = `${appName.toUpperCase()}_CODING_AGENT_DIR`;

console.log("如果 piConfig.name = 'tau':");
console.log("  APP_NAME:", appName);
console.log("  APP_TITLE:", piConfigName ? appName : "π");
console.log("  ENV_AGENT_DIR:", envAgentDir);

rmSync(tmpPkg);
