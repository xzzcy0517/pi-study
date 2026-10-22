const r = Object.groupBy([1, 2, 3, 4], (n: number) => (n % 2 === 0 ? "偶" : "奇"));
console.log(r);
