# 第 5 讲 · 函数与箭头函数：把一段活打包

📍 **出现位置**：`source-resolver.ts` 第 64、70 行（`function` 声明）、30–31、43 行（箭头函数）、46 行（对象里的方法速写 `resolve(...) { }`）、54、60、67、84–85 行（`return`）

---

## 🤔 它们是干什么的？

**函数 = 把一段活打包，起个名字，以后随叫随到**。三要素：进料口（参数）、加工过程（函数体）、出料口（返回值）。

### 两种打包方式

**经典款（第 64 行）：**

```ts
function matchAlias(alias, specifier) {
	// …加工…
	return 结果;
}
```

**箭头款（第 30 行）：**

```ts
([pattern]) => pattern.startsWith("@earendil-works/")
```

箭头函数两种体型：

| 体型 | 长相 | 规矩 |
|---|---|---|
| 单行版 | `(x) => x * 2` | 只有一句时，结果自动返回，不用写 `return` |
| 带身体版 | `(x) => { …; return 结果; }` | 包了 `{ }` 就必须自己写 `return` |

两种写法地位平等，看场合：随手用一下的小函数用箭头款（比如塞给 `filter` 的判别条件）；有名字、要反复调用的用 `function` 款（比如两个帮手）。

### 函数可以当「东西」递来递去

这是 JS 最要紧的脑筋转弯：**函数也是一种值**，可以塞进变量、递给别人。第 10 讲的生产线全靠这个：

```ts
paths.filter(([pattern]) => …)   // 把一个「判别小函数」递给 filter
     .map(([pattern, replacements]) => { … })  // 把一个「加工小函数」递给 map
     .sort((left, right) => right.pattern.length - left.pattern.length)
```

- `filter`：「你给的判别函数说留，才留」；
- `map`：「你给的加工函数，每条都过一遍」；
- `sort`：「你给的比较函数告诉我谁排前面——返回正数说明右边的该往前站」。第 43 行 `right.length - left.length` 正是「长卡排前」的秘诀。

第 45–62 行的 `registerHooks({ resolve(...) {…} })` 也是同理：把一个叫 `resolve` 的函数**包在对象里**递过去，node 以后就照着它办事。

### `return`：交差，顺便下班

`return` 一出，函数**立刻结束**——后面的行统统不执行。翻译官大量使用「提前交差」（early return）：

```ts
if (resolved) return { url: …, shortCircuit: true };  // 找到了？发证，收工
// ……
return nextResolve(specifier, context);               // 都不归我管？转诊，收工
```

不用 `else` 套 `else`，代码平铺直叙，好读。

---

## 🧪 动手跑

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/j5-functions

cat > /Users/admin/Desktop/pi-study/c-pi/labs/j5-functions/functions.mjs <<'EOF'
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
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/j5-functions/functions.mjs
```

**预期输出**：

```text
① add(2, 3) = 5
② double(4) = 8
③ describe: pi-ai 有 5 个字母
④ map（逐个加工）: [ 5, 6, 5 ]
   filter（留下符合条件的）: [ 'pi-ai', 'pi-tui' ]
   sort 短的在前: [ 24, 29, 40 ]
   sort 长的在前: [ 40, 29, 24 ]
⑤ 第一个大于 10 的: 20
```

④ 里注意 `sort` 的两个方向：`a - b` 小的在前，`b - a` 大的在前——翻译官用的正是后者。⑤ 里 30 根本没被检查到，`return` 一命中全剧终。

> 💡 `[...lens]` 外面的 `...` 是「摊开再装一份」——复制一个副本再排序，免得把原来的数组弄乱。这个符号叫展开（spread），混个脸熟即可。

---

## ✅ 小结

函数把一段活打包：经典写法 `function 名(料) { … return 货 }`，箭头写法 `(料) => 货`（单行免 `return`，带 `{ }` 必须自己写）。函数是值，能递给 `filter`/`map`/`sort` 当「判别器/加工器/比较器」。`return` 一旦执行函数立刻下班，「提前交差」风格让代码少套几层 `else`。

---

[← 上一讲](/j4-objects-arrays) · [下一讲 · 判断与逻辑符号 →](/j6-logic)
