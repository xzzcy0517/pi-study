import {
	spawnProcess,
	spawnProcessSync,
} from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/utils/child-process.ts";

// ① 同步执行：等命令跑完才继续
const sync = spawnProcessSync(process.execPath, ["-e", "console.log('sync hello')"], {
	encoding: "utf-8",
});
console.log("① 同步 status:", sync.status, "stdout:", JSON.stringify(sync.stdout));

// ② 非零退出码
const failed = spawnProcessSync(process.execPath, ["-e", "process.exit(3)"], {
	encoding: "utf-8",
});
console.log("② 非零 status:", failed.status);

// ③ 命令不存在
const missing = spawnProcessSync("definitely-not-a-real-command-xyz", [], {
	encoding: "utf-8",
});
console.log("③ 不存在 status:", missing.status, "error:", missing.error?.code);

// ④ 参数里的空格不会把参数拆开
const spaced = spawnProcessSync(
	process.execPath,
	["-e", "console.log(JSON.stringify(process.argv.slice(1)))", "a b", "c"],
	{ encoding: "utf-8" },
);
console.log("④ 参数:", spaced.stdout.trim());

// ⑤ 异步执行：先拿到子进程对象，再等它结束
const child = spawnProcess(process.execPath, ["-e", "setTimeout(() => console.log('async hello'), 100)"], {
	stdio: ["ignore", "pipe", "pipe"],
});
console.log("⑤ 异步 pid 类型:", typeof child.pid, "（数字表示已经启动）");

let output = "";
child.stdout.on("data", (chunk) => {
	output += chunk;
});

const code = await new Promise<number | null>((resolve) => {
	child.on("close", resolve);
});
console.log("⑤ 异步 code:", code, "stdout:", JSON.stringify(output));
