# 第 12 讲 · 毕业：符号速查表

这一讲不讲新东西——把 `source-resolver.ts` 和 `tsconfig.json` 里出现过的**每一个符号和写法**收进一张表。以后读源码撞到不认识的，先来这里查。

---

## 🔤 速查表

| 符号 / 写法 | 大白话 | 在哪学过 | 文件里的例子 |
|---|---|---|---|
| `import { a, b } from "…"` | 从别处搬工具 | 第 1 讲 | L1–4 |
| `node:` 前缀 | node 自家工具间 | 第 1 讲 | `"node:fs"` |
| `// …` | 注释，不执行 | 第 1 讲 | L6–8 |
| `.ts` / `.mts` / `.mjs` / `.json` | 文件身份证 | 第 1 讲 | 两个文件本身 |
| `const x = …` | 锁死的储物格 | 第 2 讲 | L23–26 |
| `let x` | 可换内容的储物格 | 第 2 讲 | L47 |
| `import.meta.url` | node 送的「我自己的网址」 | 第 2 讲 | L23 |
| `"…"` / `'…'` | 字符串（一段文字） | 第 3 讲 | 到处都是 |
| `` `…${…}…` `` | 模板字符串，现场填值 | 第 3 讲 | L27、72 |
| `s.length` / `startsWith` / `endsWith` / `includes` | 字符串小工具 | 第 3 讲 | L30、43、65–66 |
| `indexOf` / `slice` / `replace` | 找位置 / 切段 / 替换 | 第 3 讲 | L32、38、53 |
| `{ 键: 值 }` | 对象（格子柜） | 第 4 讲 | L36–41 |
| `{ pattern }` 速写 | = `{ pattern: pattern }` | 第 4 讲 | L36–41 |
| `[a, b]` / `arr[0]` / `arr.length` | 数组 / 按号取 / 数量 | 第 4 讲 | L77–81 |
| `Object.entries(对象)` | 摊平成「一对一对」 | 第 4 讲 | L29 |
| `const [a, b] = pair` | 解构：一次拆两兜 | 第 4 讲 | L30–31 |
| `f(x).g()` | 链式调用 | 第 4 讲 | L83 |
| `function f(a) { return … }` | 经典函数 | 第 5 讲 | L64、70 |
| `(a) => …` | 箭头函数 | 第 5 讲 | L30、43 |
| `filter` / `map` / `sort` | 筛 / 逐个加工 / 排队 | 第 5 讲 | L30–43 |
| `return` | 交差下班 | 第 5 讲 | L54、60 |
| `if (条件)` | 分情况办事 | 第 6 讲 | L27、50 |
| `===` / `!==` | 全等 / 不全等（别用 `==`） | 第 6 讲 | L33、50 |
| `!` | 取反 | 第 6 讲 | L27 |
| `&&` / `||` | 并且 / 或者 | 第 6 讲 | L33、66 |
| `条件 ? 甲 : 乙` | 一行版 if/else，可连环 | 第 6 讲 | L38、75–81 |
| `true` / `false` | 布尔值 | 第 6 讲 | L54 |
| `undefined` | 「查无此物」 | 第 6 讲 | L47、50 |
| `for (const x of 清单)` | 逐个取办 | 第 7 讲 | L48、52、82 |
| `continue` | 跳过这个，下一个 | 第 7 讲 | L50 |
| `throw new Error("…")` | 掀桌报错（fail fast） | 第 7 讲 | L27、34、58 |
| `: 类型` | 类型批注（会被撕掉） | 第 8 讲 | L29、64 |
| `interface` | 登记表模板 | 第 8 讲 | L10、16 |
| `readonly` / `格子名?` | 只许看 / 可有可无 | 第 8 讲 | L11–20 |
| `string[]` / `A \| B` | 数组 / 联合（或） | 第 8 讲 | L12、47 |
| `Record<…>` / `Readonly<…>` | 泛型配方 | 第 8 讲 | L12 |
| `as 类型` | 拍胸脯担保 | 第 8 讲 | L25 |
| `new X(...)` | 照图纸造一个 | 第 8 讲 | L23、27 |
| `?.` | 试探取值，没有就 undefined 不炸 | 第 8 讲 | L26 |
| `??=` | 空着才填 | 第 8 讲 | L51 |
| JSON 五样：字符串/数字/布尔/数组/对象 | 数据登记表格式 | 第 9 讲 | tsconfig.json 全文 |
| `readFileSync(地址, "utf8")` + `JSON.parse` | 文字 → 数据 | 第 9 讲 | L25 |
| `extends` / `include` / `exclude` | tsconfig 三件套：继承 / 圈进 / 剔除 | 第 9、11 讲 | tsconfig.json |
| `*` / `**` / `./` | 通配一层 / 任意多层 / 同层 | 第 9 讲 | tsconfig.json |
| `strict` / `erasableSyntaxOnly` / `verbatimModuleSyntax` | 严格族 / 只许可撕语法 / 类型 import 标 type | 第 10 讲 | tsconfig.base.json |
| `noEmit: true` | 只检查不产出（dist 不存在的根因） | 第 11 讲 | tsconfig.json |

---

## 🎓 毕业自测

不看速查表，说说下面这些行分别在干嘛（答案都能在前 9 讲找到）：

1. `const tsconfig = JSON.parse(readFileSync(tsconfigPath, "utf8")) as TsConfig;`
2. `const wildcard = matchAlias(alias, specifier);` 后面紧跟 `if (wildcard === undefined) continue;`
3. `matchedPattern ??= alias.pattern;`
4. `return { url: pathToFileURL(resolved).href, shortCircuit: true };`
5. `tsconfig.compilerOptions?.paths` 里的 `?.` 为什么不能省成 `.`？

---

## 学完去哪儿

- 回 **shell 站第二季**（`c-pi/wiki/shell/` 第 8–13 讲）重读翻译官——这次每个符号你都认识了；
- 主线文档《执行 ./pi-test.sh 之后，发生了什么》在 `c-pi/docs/02-run-to-ui.md`；
- 任何一行还有疑问，截图来问，我会把解释补回本讲。

🎉 语法扫盲毕业！

---

[← 上一讲](/j11-tsconfig-root)
