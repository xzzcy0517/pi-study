import {
	getConfiguredSelfUpdateArgv,
	makeConfiguredSelfUpdateCommand,
} from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/config.ts";

const release = {
	packageName: "@earendil-works/pi-coding-agent",
	version: "1.2.3",
};

// ① 环境变量和设置都没有
delete process.env.PI_SELF_UPDATE_COMMAND;
console.log("① 都没有:", getConfiguredSelfUpdateArgv(undefined));

// ② 只有设置项
console.log("② 只有设置项:", getConfiguredSelfUpdateArgv(["mise", "upgrade", "{installSpec}"]));

// ③ 环境变量优先，并按空白拆分
process.env.PI_SELF_UPDATE_COMMAND = "  nub   upgrade {installSpec} ";
console.log("③ 环境变量:", getConfiguredSelfUpdateArgv(["mise", "upgrade"]));

// ④ 填占位符
const argv = getConfiguredSelfUpdateArgv(undefined);
console.log("④ 填好的命令:", makeConfiguredSelfUpdateCommand(argv, release));

// ⑤ 未知占位符原样保留
console.log("\n⑤ 未知占位符:");
console.log(makeConfiguredSelfUpdateCommand(["wrapper", "install", "{installSpec}", "{unknown}"], release));

// ⑥ 引号不支持：引号会被当成普通字符
process.env.PI_SELF_UPDATE_COMMAND = 'wrapper "install my-pkg"';
console.log("\n⑥ 带引号的环境变量:");
console.log(getConfiguredSelfUpdateArgv(undefined));
