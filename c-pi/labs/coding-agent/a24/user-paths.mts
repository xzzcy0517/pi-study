import {
	getAgentDir,
	getCustomThemesDir,
	getModelsPath,
	getAuthPath,
	getSettingsPath,
	getToolsDir,
	getBinDir,
	getPromptsDir,
	getSessionsDir,
	getDebugLogPath,
	expandTildePath,
	getShareViewerUrl,
} from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/config.ts";

console.log("默认配置目录:", getAgentDir());

const items: [string, string][] = [
	["自定义主题", getCustomThemesDir()],
	["models.json", getModelsPath()],
	["auth.json", getAuthPath()],
	["settings.json", getSettingsPath()],
	["tools 目录", getToolsDir()],
	["bin 目录", getBinDir()],
	["prompts 目录", getPromptsDir()],
	["sessions 目录", getSessionsDir()],
	["调试日志", getDebugLogPath()],
];

for (const [name, path] of items) {
	console.log(" ", name.padEnd(14), path);
}

// ① 用环境变量覆盖，并支持 ~
process.env.PI_CODING_AGENT_DIR = "~/my-pi-agent";
console.log("\n① 设置 PI_CODING_AGENT_DIR=~/my-pi-agent:");
console.log("  getAgentDir():", getAgentDir());
console.log("  expandTildePath('~/x'):", expandTildePath("~/x"));

// ② 用绝对路径覆盖
process.env.PI_CODING_AGENT_DIR = "/tmp/pi-agent";
console.log("\n② 设置绝对路径 /tmp/pi-agent:");
console.log("  getAgentDir():", getAgentDir());
console.log("  settings:", getSettingsPath());

delete process.env.PI_CODING_AGENT_DIR;

// ③ 分享地址
console.log("\n③ 分享地址:");
console.log("  默认:", getShareViewerUrl("gist-123"));
process.env.PI_SHARE_VIEWER_URL = "https://example.com/session/";
console.log("  自定义:", getShareViewerUrl("gist-123"));
delete process.env.PI_SHARE_VIEWER_URL;
