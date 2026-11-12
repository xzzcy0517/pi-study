import {
	spawnProcess,
	waitForChildProcess,
} from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/utils/child-process.ts";

// ① 孙进程在父进程退出后继续写 stdout（每 50ms 一块，持续越过 100ms 宽限）
const lateParent = `
const { spawn } = require("node:child_process");
spawn(process.execPath, ["-e", "let i = 0; const t = setInterval(() => { process.stdout.write('chunk' + (++i)); if (i === 5) clearInterval(t); }, 50)"], {
	stdio: ["ignore", "inherit", "inherit"],
	detached: true,
}).unref();
process.exit(0);
`;

const late = spawnProcess(process.execPath, ["-e", lateParent], {
	stdio: ["ignore", "pipe", "pipe"],
});
let lateOutput = "";
late.stdout.on("data", (chunk) => {
	lateOutput += chunk;
});

const start1 = Date.now();
const code1 = await waitForChildProcess(late);
console.log(
	"① 退出码:",
	code1,
	"输出:",
	JSON.stringify(lateOutput),
	"耗时:",
	Date.now() - start1,
	"ms",
);

// ② 孙进程一直占着管道、但从不写
const quietParent = `
const { spawn } = require("node:child_process");
spawn(process.execPath, ["-e", "setTimeout(() => {}, 2000)"], {
	stdio: ["ignore", "inherit", "inherit"],
	detached: true,
}).unref();
process.exit(0);
`;

const quiet = spawnProcess(process.execPath, ["-e", quietParent], {
	stdio: ["ignore", "pipe", "pipe"],
});

const start2 = Date.now();
const code2 = await waitForChildProcess(quiet);
console.log(
	"② 退出码:",
	code2,
	"耗时:",
	Date.now() - start2,
	"ms（应约 100ms，而不是等 2 秒）",
);
