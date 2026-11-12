// 一个迷你版 cli.ts，用来演示结构

function setupCli() {
	console.log("[setupCli] 做环境准备");
}

function main(args) {
	console.log("[main] 收到参数:", args);
}

setupCli();
main(process.argv.slice(2));
