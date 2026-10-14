console.log("argv 完整内容：");
process.argv.forEach((x, i) => console.log(`  [${i}] ${x}`));
console.log("slice(2) 之后（真正的参数）：", process.argv.slice(2));
