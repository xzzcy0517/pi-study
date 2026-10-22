# 第 7 讲 · 循环与出错处理：`for...of`、`continue`、`throw`

📍 **出现位置**：`source-resolver.ts` 第 48–56 行（双层 `for...of`）、50 行（`continue`）、82–84 行（逐个摸文件）、27、34、58 行（`throw new Error`）

---

## 🤔 它们是干什么的？

### `for...of`：把清单里的东西一个个拿出来办

```ts
for (const alias of aliases) { … }
```

读法：**对 `aliases` 这叠卡片，一张一张来——每拿一张，叫它 `alias`，把 `{ }` 里的事办一遍**。翻译官前台就是靠它把 31 张卡逐张试过去的；第 52 行里面还套了一层（对这张卡的每个替换地址再挨个试），这就是**双层循环**——「每个窗口 × 每种业务」。

### `continue`：这张跳过，下一张

```ts
if (wildcard === undefined) continue;
```

暗号没对上？**这张卡剩下的事不办了，直接换下一张**。注意它不是停下整个循环，只是「跳过这一张」。（它的兄弟 `break` 是「整个循环到此为止」，翻译官没用到，靠 `return` 直接下班了。）

### `throw new Error(...)`：掀桌子报错

```ts
if (!paths) throw new Error(`Source runtime requires compilerOptions.paths in ${tsconfigPath}`);
```

`throw`（抛）= **把错误举过头顶大声喊出来，程序当场停下**。`new Error("…")` 造一个带着留言的错误包裹。没人接这个包裹（本教程不涉及接包裹的 `try/catch`），程序就停止运行、退出码变成 1，留言打印在屏幕上。

为什么主动喊停反而是好事？这就是第 9 讲说过的 **fail fast**（快速失败）：花名册缺章、一张卡两个 `*`、花名对上了文件却不在——这三种情况说明**环境或配置已经不对劲**，继续跑只会错得更隐蔽、更难查。宁可当场掀桌子，把问题拍在你脸上。翻译官 87 行里掀了三次桌子，每次都是这个道理。

---

## 🧪 动手跑

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/j7-loops

# ①②③ 循环三件套
cat > /Users/admin/Desktop/pi-study/c-pi/labs/j7-loops/loops.mjs <<'EOF'
// 循环演练
// ① for...of：把清单里的东西一个个拿出来
const cards = ["pi-ai", "pi-tui", "chord"];
for (const c of cards) {
	console.log("① 处理:", c);
}

// ② continue：这个跳过，继续下一个
console.log("② 跳过 pi-tui：");
for (const c of cards) {
	if (c === "pi-tui") continue;
	console.log("   处理:", c);
}

// ③ 双层循环：每张卡 × 每个地址（翻译官前台的日常）
const deck = [
	{ pattern: "pi-ai", replacements: ["ai/index.ts"] },
	{ pattern: "pi-tui", replacements: ["tui/index.ts", "tui/fallback.ts"] },
];
console.log("③ 双层循环：");
for (const card of deck) {
	for (const r of card.replacements) {
		console.log(`   卡片 ${card.pattern} 试地址 ${r}`);
	}
}
EOF
node /Users/admin/Desktop/pi-study/c-pi/labs/j7-loops/loops.mjs

# ④ throw 的现场 + 退出码
cat > /Users/admin/Desktop/pi-study/c-pi/labs/j7-loops/throw-demo.mjs <<'EOF'
throw new Error("花名册里没有 paths，翻译官罢工了");
console.log("这行永远不会执行");
EOF
node /Users/admin/Desktop/pi-study/c-pi/labs/j7-loops/throw-demo.mjs
echo "退出码: $?"
```

**预期输出**：

```text
① 处理: pi-ai
① 处理: pi-tui
① 处理: chord
② 跳过 pi-tui：
   处理: pi-ai
   处理: chord
③ 双层循环：
   卡片 pi-ai 试地址 ai/index.ts
   卡片 pi-tui 试地址 tui/index.ts
   卡片 pi-tui 试地址 tui/fallback.ts
（第 ④ 个文件报错：）
throw new Error("花名册里没有 paths，翻译官罢工了");
      ^

Error: 花名册里没有 paths，翻译官罢工了
    at …（后面几行是「在哪炸的」线索，供排查用）
退出码: 1
```

四个观察：

1. ① 三张卡逐张办；
2. ② `pi-tui` 被 `continue` 跳过了，其余照办；
3. ③ 外层过卡、内层过地址，组合全部出现——翻译官前台第 48–56 行就是这个结构；
4. ④ `throw` 之后**程序立刻死给你看**：那句「这行永远不会执行」真的没执行；`$?` 打印的退出码是 `1`（shell 站第 1 讲讲过，`0` 才是顺利）。报错最后那几行 `at …` 叫**调用栈**，是「在哪炸的」的线索，以后看到报错别慌，先看第一行的留言。

---

## ✅ 小结

`for (const 一名 of 一叠)` 逐个取办；`continue` 跳过当前这个；双层循环 = 每个 × 每种。`throw new Error("留言")` 当场掀桌：程序停、退出码变 1、留言拍在屏幕上。翻译官三次主动 `throw`（缺花名册、双 `*`、对上却找不到文件）都是 fail fast——错了立刻喊，绝不带病上岗。

---

[← 上一讲](/j6-logic) · [下一讲 · TypeScript 加的那层料 →](/j8-typescript)
