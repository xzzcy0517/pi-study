console.log("=== 替换前 ===");
process.emitWarning("这条会显示");

console.log("=== 替换后 ===");
process.emitWarning = () => {};
process.emitWarning("这条不会显示");

console.log("=== 结束 ===");
