import assert from "node:assert";
import {
	APP_NAME,
	APP_TITLE,
	PACKAGE_NAME,
	VERSION,
} from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/config.ts";
import { setupCli } from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/cli/setup.ts";
import { parseHttpIdleTimeoutMs } from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/core/http-dispatcher.ts";
import {
	isPathWithin,
	normalizePath,
	pathsEqual,
} from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/utils/paths.ts";
import { splitBom } from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/utils/text.ts";

const checks: [string, () => void][] = [
	["包名是 @earendil-works/pi-coding-agent", () => assert.strictEqual(PACKAGE_NAME, "@earendil-works/pi-coding-agent")],
	["APP_NAME 是 pi", () => assert.strictEqual(APP_NAME, "pi")],
	["APP_TITLE 是 π", () => assert.strictEqual(APP_TITLE, "π")],
	["VERSION 非空", () => assert.ok(VERSION.length > 0)],
	["300000 毫秒合法", () => assert.strictEqual(parseHttpIdleTimeoutMs(300_000), 300_000)],
	["disabled 解析为 0", () => assert.strictEqual(parseHttpIdleTimeoutMs("disabled"), 0)],
	["空字符串解析为 undefined", () => assert.strictEqual(parseHttpIdleTimeoutMs(""), undefined)],
	["兄弟目录不算包含", () => assert.strictEqual(isPathWithin("/home/me", "/home/me2"), false)],
	[".. 会被折叠", () => assert.ok(pathsEqual("/a/b/../c", "/a/c"))],
	["~ 会展开", () => assert.strictEqual(normalizePath("~/x", { homeDir: "/home/me" }), "/home/me/x")],
	["BOM 码点是 feff", () => assert.strictEqual(splitBom("\uFEFFhi").bom.codePointAt(0), 0xfeff)],
];

setupCli();

checks.push(
	["setupCli 后进程名是 pi", () => assert.strictEqual(process.title, APP_NAME)],
	["PI_CODING_AGENT 是字符串 true", () => assert.strictEqual(process.env.PI_CODING_AGENT, "true")],
	["AI_AGENT 是 pi", () => assert.strictEqual(process.env.AI_AGENT, "pi")],
);

let passed = 0;
for (const [name, check] of checks) {
	try {
		check();
		console.log("✅", name);
		passed++;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.log("❌", name, "—", message);
	}
}

console.log(`\n${passed}/${checks.length} 项通过`);
process.exitCode = passed === checks.length ? 0 : 1;
