// 石破天惊：类型写「错」了，node 照样跑！
const x: string = 123;
console.log("x =", x, "（node 只把类型撕掉，不检查对错）");
