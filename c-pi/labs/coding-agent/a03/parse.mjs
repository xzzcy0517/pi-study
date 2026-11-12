const args = process.argv.slice(2);

console.log("用户参数:", args);
console.log("参数个数:", args.length);

// 找 --model 后面的值
const modelIndex = args.indexOf("--model");
if (modelIndex !== -1 && args[modelIndex + 1]) {
	console.log("模型是:", args[modelIndex + 1]);
} else {
	console.log("没有指定 --model");
}
