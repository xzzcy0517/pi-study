// 函数演练
// ① function 经典写法
function add(a, b) {
	return a + b;
}

// ② 箭头函数：单行体型（不用写 return）
const double = (x) => x * 2;

// ③ 箭头函数：带身体的体型（要写 return）
const describe = (name, n) => {
	const sentence = `${name} 有 ${n} 个字母`;
	return sentence;
};

console.log("① add(2, 3) =", add(2, 3));
console.log("② double(4) =", double(4));
console.log("③ describe:", describe("pi-ai", 5));

// ④ 函数可以当「东西」递给别人：filter / map / sort
const names = ["pi-ai", "pi-tui", "chord"];
console.log("④ map（逐个加工）:", names.map((n) => n.length));
console.log("   filter（留下符合条件的）:", names.filter((n) => n.startsWith("pi-")));

const lens = [24, 40, 29];
console.log("   sort 短的在前:", [...lens].sort((a, b) => a - b));
console.log("   sort 长的在前:", [...lens].sort((a, b) => b - a));

// ⑤ return 提前下班：找到第一个就走人
function findFirstBig(nums) {
	for (const n of nums) {
		if (n > 10) return n; // 20 命中，后面的 30 根本不看
	}
	return undefined;
}
console.log("⑤ 第一个大于 10 的:", findFirstBig([3, 7, 20, 30]));
