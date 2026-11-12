// 用 Pi 源码的同款写法
process.emitWarning = (() => {}) as typeof process.emitWarning;

process.emitWarning("这条应该被吞掉");
console.log("程序继续执行，没有看到警告");
