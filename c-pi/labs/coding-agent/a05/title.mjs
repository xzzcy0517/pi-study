console.log("改之前:", process.title);

process.title = "my-little-pi";

console.log("改之后:", process.title);

// 让程序停一会儿，方便你在另一个终端用 ps 查看
setTimeout(() => {
	console.log("3 秒后进程标题还是:", process.title);
}, 3000);
