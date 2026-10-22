// 不用 ?. 的下场：第一层就没有，硬往里钻会炸
const cfg = {};
console.log(cfg.compilerOptions.paths);
