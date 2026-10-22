# 第 4 讲 · 对象与数组：数据的两种收纳

📍 **出现位置**：`source-resolver.ts` 第 29 行（`Object.entries`）、30–31 行（解构）、36–41 行（对象字面量 + 速写）、43 行（`.length`）、53–54 行（返回对象）、77–81 行（数组字面量）、83 行（`statSync(...).isFile()` 链式调用）

---

## 🤔 它们是干什么的？

程序里的数据主要有两种收纳方式：**对象**（带标签的格子柜）和**数组**（编了号的抽屉）。

### 对象 `{ }`：带标签的格子柜

```ts
{
  pattern: "@earendil-works/pi-ai/*",
  replacements: ["./packages/ai/src/*.ts", "./packages/ai/src/providers/*.ts"]
}
```

每个格子有名字（`pattern`）和内容。取东西用**点号**：`card.pattern`。翻译官第 36–41 行 `return { pattern, prefix, suffix, replacements }` 造的就是这样一个对象——翻译卡片本卡。

有个常见的**速写**容易看懵：

```ts
const pattern = "…";
const replacements = […];
return { pattern, replacements };
//      ↑ 这是 { pattern: pattern, replacements: replacements } 的速写
```

格子名和变量名一样时，只写一遍就行。

### 数组 `[ ]`：编了号的抽屉

```ts
["./packages/ai/src/*.ts", "./packages/ai/src/providers/*.ts"]
```

抽屉**从 0 编号**：`replacements[0]` 是第一个、`replacements[1]` 是第二个。`数组.length` 报数量。注意两种括号的职责：`[ ]` 在创建时是「打包一串」，在使用时是「按编号取」。

### 翻译官里的三个组合技

**① `Object.entries`（第 29 行）：把格子柜摊平成清单**

`paths` 花名册是个对象（花名 → 地址清单）。`Object.entries(paths)` 把它变成一个大数组，里面每行是 `[花名, 地址清单]` 一对——这样才能交给 `filter`/`map`/`sort` 逐条加工（第 10 讲的生产线）。

**② 解构（第 30–31 行）：一次掏出左右两兜**

```ts
.filter(([pattern]) => …)
.map(([pattern, replacements]) => …)
```

`[pattern, replacements]` 不是造数组，是**拆**数组：「这一对的左边叫 `pattern`、右边叫 `replacements`」，一步掏出来直接可用。它出现在箭头函数的括号里，所以是在「收货现场」就拆包。

**③ 链式调用（第 83 行）：对返回值直接再操作**

```ts
statSync(candidate).isFile()
```

`statSync(...)` 的返回值是一个「文件信息对象」，紧接着 `.isFile()` 问它「你是个正经文件吗」。点号可以一直接下去，像流水线。

---

## 🧪 动手跑

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/j4-objects-arrays

cat > /Users/admin/Desktop/pi-study/c-pi/labs/j4-objects-arrays/objects.mjs <<'EOF'
// 对象与数组演练
import { statSync } from "node:fs";

// ① 对象字面量 + 点号取值
const card = {
	pattern: "@earendil-works/pi-ai/*",
	replacements: ["./packages/ai/src/*.ts", "./packages/ai/src/providers/*.ts"],
};
console.log("① 点号取值 card.pattern:", card.pattern);

// ② 数组：下标从 0 数
console.log("② 数组第 2 个 replacements[1]:", card.replacements[1]);
console.log("   数组长度:", card.replacements.length);

// ③ 属性速写：{ pattern } 就是 { pattern: pattern }
const pattern = "@earendil-works/pi-tui";
const replacements = ["./packages/tui/src/index.ts"];
const card2 = { pattern, replacements };
console.log("③ 速写造出的卡片:", card2.pattern);

// ④ Object.entries：把对象「摊平」成一行一行的清单
const paths = {
	"@earendil-works/pi-ai": ["./packages/ai/src/index.ts"],
	"@earendil-works/pi-tui": ["./packages/tui/src/index.ts"],
};
console.log("④ Object.entries 摊平后:", Object.entries(paths));

// ⑤ 解构：把一对东西的「左兜」「右兜」一次掏出来
const pair = ["@earendil-works/pi-ai", ["./packages/ai/src/index.ts"]];
const [name, addr] = pair;
console.log("⑤ 解构: 左兜 =", name, "｜ 右兜 =", addr);

// ⑥ 链式调用：对「返回值」直接再操作
console.log(
	"⑥ statSync(...).isFile():",
	statSync("/Users/admin/Desktop/pi-study/pi/tsconfig.json").isFile(),
);
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/j4-objects-arrays/objects.mjs
```

**预期输出**：

```text
① 点号取值 card.pattern: @earendil-works/pi-ai/*
② 数组第 2 个 replacements[1]: ./packages/ai/src/providers/*.ts
   数组长度: 2
③ 速写造出的卡片: @earendil-works/pi-tui
④ Object.entries 摊平后: [
  [ '@earendil-works/pi-ai', [ './packages/ai/src/index.ts' ] ],
  [ '@earendil-works/pi-tui', [ './packages/tui/src/index.ts' ] ]
]
⑤ 解构: 左兜 = @earendil-works/pi-ai ｜ 右兜 = [ './packages/ai/src/index.ts' ]
⑥ statSync(...).isFile(): true
```

④ 是重点：原来竖着放的花名册，摊平后变成「每行 `[花名, 地址]`」的数组——翻译官第 29 行就是从这一步开始加工卡片的。⑥ 里 `true` 说明 `tsconfig.json` 确实是个正经文件（而不是文件夹）。

---

## ✅ 小结

对象 `{格子名: 内容}` 用点号取值（格子名与变量同名时 `return { pattern }` 可速写）；数组 `[a, b, c]` 从 0 编号、用 `[n]` 取、`.length` 报数量。三个组合技：`Object.entries` 把对象摊平成「一对一对」的数组；解构 `[左, 右] = pair` 一次拆包；`f(x).g()` 链式调用是对返回值接着操作。

---

[← 上一讲](/j3-strings) · [下一讲 · 函数与箭头函数 →](/j5-functions)
