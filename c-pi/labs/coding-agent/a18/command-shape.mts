// 演练场：照抄 config.ts 内部的两个函数，只为观察“命令长什么样”。
// 这两个函数没有 export，正常代码不能直接 import，所以这里复制一份。

interface Step {
	command: string;
	args: string[];
	display: string;
}

interface Command extends Step {
	steps?: Step[];
}

function makeStep(command: string, args: string[]): Step {
	return {
		command,
		args,
		display: [command, ...args].map((arg) => (/\s/.test(arg) ? `"${arg}"` : arg)).join(" "),
	};
}

function makeCommand(installStep: Step, uninstallStep?: Step): Command {
	if (!uninstallStep) return installStep;
	return {
		...installStep,
		display: `${uninstallStep.display} && ${installStep.display}`,
		steps: [uninstallStep, installStep],
	};
}

// ① 普通安装：只有一步
console.log("① 普通安装:");
console.log(makeStep("npm", ["install", "-g", "@earendil-works/pi-coding-agent"]));

// ② 参数里带空格：display 会自动加引号
console.log("\n② 路径带空格:");
console.log(makeStep("npm", ["--prefix", "/tmp/pi prefix", "install", "-g"]));

// ③ 换包名：先卸载再安装，两步
console.log("\n③ 改名安装:");
const uninstall = makeStep("npm", ["uninstall", "-g", "@old-scope/pi"]);
const install = makeStep("npm", ["install", "-g", "@new-scope/pi"]);
const rename = makeCommand(install, uninstall);
console.log("display:", rename.display);
console.log("steps:", rename.steps?.map((step) => step.display));
