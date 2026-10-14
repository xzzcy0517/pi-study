const args = process.argv.slice(2);
console.log("pi 收到了", args.length, "个参数：");
for (const a of args) console.log("  →", a);
