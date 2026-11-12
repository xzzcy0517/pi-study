// 这个文件专门验证：导入先执行，函数调用后执行

console.log("① 开始执行 a.js 的顶层代码");

import { foo } from "./b.mjs";

console.log("④ 回到 a.js，准备调用 foo()");
foo();
console.log("⑥ a.js 结束");
