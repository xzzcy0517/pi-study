// ?. 与 ??= 演练（这两个是普通 JS 也能用的「运行时」语法）
// ① ?. 一层层试探，任何一层没有就停下回 undefined
const cfg = {};
console.log("① cfg.compilerOptions?.paths →", cfg.compilerOptions?.paths);

// ② ??= 「只在还空着的时候才赋值」
let matched;
matched ??= "第一张对上的卡";
matched ??= "第二张（不会覆盖）";
console.log("② matched =", matched);
