// 直接读取不存在的变量会报错
try {
	console.log(MY_UNDEFINED_VAR);
} catch (err) {
	console.log("直接读取报错:", err.message);
}

// 用 typeof 探测不会报错
console.log("typeof 探测:", typeof MY_UNDEFINED_VAR);
