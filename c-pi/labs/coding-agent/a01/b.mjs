console.log("② b.mjs 被加载，顶层代码开始执行");

export function foo() {
	console.log("⑤ foo() 被调用了");
}

console.log("③ b.mjs 顶层代码执行完毕");
