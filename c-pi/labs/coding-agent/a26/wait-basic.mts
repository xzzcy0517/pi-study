import {
	spawnProcess,
	waitForChildProcess,
} from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/utils/child-process.ts";

// ① 正常结束：观察 exit 和 close 的先后
const child = spawnProcess(process.execPath, ["-e", "console.log('done')"], {
	stdio: ["ignore", "pipe", "pipe"],
});
child.on("exit", (code) => console.log("事件 exit:", code));
child.on("close", (code) => console.log("事件 close:", code));

let output = "";
child.stdout.on("data", (chunk) => {
	output += chunk;
});

const code = await waitForChildProcess(child);
console.log("wait 结果:", code, "输出:", JSON.stringify(output));

// ② 非零退出码
const bad = spawnProcess(process.execPath, ["-e", "process.exit(7)"], {
	stdio: ["ignore", "pipe", "pipe"],
});
console.log("② 非零退出:", await waitForChildProcess(bad));

// ③ 命令不存在：Promise 会 reject
try {
	const missing = spawnProcess("definitely-not-a-real-command-xyz", [], {
		stdio: ["ignore", "pipe", "pipe"],
	});
	await waitForChildProcess(missing);
} catch (error) {
	console.log("③ 错误被 reject:", error.code);
}
