import { detectInstallMethod } from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/config.ts";

const originalExecPath = Object.getOwnPropertyDescriptor(process, "execPath");

// 临时替换 process.execPath，观察不同路径会被识别成什么
function withExecPath(value: string, fn: () => void) {
	Object.defineProperty(process, "execPath", { value, configurable: true });
	try {
		fn();
	} finally {
		if (originalExecPath) Object.defineProperty(process, "execPath", originalExecPath);
	}
}

console.log("当前真实环境:", detectInstallMethod());

const cases = [
	["pnpm", "/home/me/.local/share/pnpm/global/5/.pnpm/pkg/node_modules/pkg/dist/cli.js"],
	["yarn", "/home/me/.config/yarn/global/node_modules/pkg/dist/cli.js"],
	["bun", "/home/me/.bun/install/global/node_modules/pkg/dist/cli.js"],
	["npm", "/usr/local/lib/node_modules/pkg/dist/cli.js"],
	["unknown", "/usr/local/bin/node"],
] as const;

for (const [label, execPath] of cases) {
	withExecPath(execPath, () => {
		console.log(label.padEnd(8), "=>", detectInstallMethod());
	});
}
