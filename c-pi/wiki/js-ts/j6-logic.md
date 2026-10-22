# 第 6 讲 · 判断与逻辑符号：`if`、`===`、`!`、`&&`、`||`、三元

📍 **出现位置**：`source-resolver.ts` 第 27 行（`if (!paths)`）、33–34 行（`!==`、`&&`）、38–39 行（三元）、50 行（`=== undefined`）、57 行（`if (matchedPattern)`）、65 行（`includes` + 三元）、66 行（`||`）、72、75–81 行（连环三元）

---

## 🤔 它们是干什么的？

程序的智能全在「分情况办事」。这一讲把翻译官用到的判断符号一次收齐。

### `if`：条件成立才执行

```ts
if (!paths) throw new Error(`…`);
```

读法：**如果 `!paths` 成立，就执行后面那句**。条件外面包圆括号。只有一句要执行时，`{ }` 可以省略（第 27、50 行都这么写）。

### 比较与取反

| 符号 | 读法 |
|---|---|
| `===` | 全等（一模一样才算） |
| `!==` | 不全等 |
| `!` | 取反（「不是」） |

> 💡 为什么不用 `==`？JS 里 `==` 会「自作主张地换算类型」再比（`"1" == 1` 居然成立），经常坑人。社区共识：**永远用 `===`**。翻译官里你找不到一个 `==`。

### 「空不空」判断（truthy / falsy）

`if (matchedPattern)`、`if (!paths)` 里的条件不是比较，是一个值直接当条件用。JS 的规矩：这几个值算「没有」（falsy）——`undefined`、空字符串 `""`、`0`、`null`、`false`；其余都算「有」（truthy）。所以：

- `if (!paths)` = 「如果花名册这一章**不存在**」；
- `if (resolved)` = 「如果真文件**找到了**」。

### `&&` 与 `||`：并且 / 或者

```ts
if (wildcard !== -1 && pattern.indexOf("*", wildcard + 1) !== -1)  // 有 * 并且还有第二个 *
if (!specifier.startsWith(alias.prefix) || !specifier.endsWith(alias.suffix))  // 前缀不对 或者 后缀不对
```

### 三元 `? :`：一行版的 if/else

```ts
prefix = 条件 ? 成立时的值 : 不成立时的值
```

第 38 行：`wildcard === -1 ? pattern : pattern.slice(0, wildcard)`——没有 `*` 就用整个暗号，有 `*` 就切出前缀。

翻译官第 75–81 行还有**连环三元**，像一层层分拣：

```ts
extension === ".js" ? ".ts" :      // 是 .js？→ .ts
extension === ".mjs" ? ".mts" :    // 不然，是 .mjs？→ .mts
extension === ".cjs" ? ".cts" :    // 不然，是 .cjs？→ .cts
undefined                           // 都不是 → undefined
```

读的时候从上往下逐个问，第一个答「是」的说了算。它和一长串 `if / else if / else` 完全等价，只是排得更整齐。

### `undefined` 和 `""` 是两回事

第 12 讲对暗号时强调过：`""`（空字符串）是「对上了但没捕到东西」，`undefined` 是「根本没对上」。实验里能看到 `undefined === ""` 是 `false`——**完全不同的两种「空」**，别混。

---

## 🧪 动手跑

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/j6-logic

cat > /Users/admin/Desktop/pi-study/c-pi/labs/j6-logic/logic.mjs <<'EOF'
// 判断与逻辑符号演练
// ① 比较：=== 全等 / !== 不全等
console.log("① 1 + 1 === 2 →", 1 + 1 === 2);
console.log("  'a' !== 'b' →", "a" !== "b");

// ② ! 取反 + 「空不空」判断（truthy/falsy）
console.log("② !'' →", !"", "（空字符串算「没有」）");
console.log("  !'有内容' →", !"有内容");
console.log("  !undefined →", !undefined);

// ③ && 并且 / || 或者
const spec = "@earendil-works/pi-ai/providers/all";
console.log(
	"③ 前缀对 && 后缀对 →",
	spec.startsWith("@earendil-works/pi-ai/") && spec.endsWith("/all"),
);
console.log("  是 a 或 b 或很长 →", spec === "a" || spec === "b" || spec.length > 10);

// ④ 三元 ? : 与连环三元（翻译官第 76 行同款）
const ext = ".mjs";
const tsExt =
	ext === ".js" ? ".ts" : ext === ".mjs" ? ".mts" : ext === ".cjs" ? ".cts" : undefined;
console.log("④ 连环三元: .mjs 对应 →", tsExt);

// ⑤ undefined 和 "" 是两回事（对暗号的关键）
console.log("⑤ undefined === '' →", undefined === "");
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/j6-logic/logic.mjs
```

**预期输出**：

```text
① 1 + 1 === 2 → true
  'a' !== 'b' → true
② !'' → true （空字符串算「没有」）
  !'有内容' → false
  !undefined → true
③ 前缀对 && 后缀对 → true
  是 a 或 b 或很长 → true
④ 连环三元: .mjs 对应 → .mts
⑤ undefined === '' → false
```

`true` / `false`（真 / 假）这两个值叫**布尔值**——所有判断的最终答案都是它俩之一。

---

## ✅ 小结

`if (条件) 语句` 分情况办事；比较用 `===` / `!==`（别用 `==`）；`!` 取反；`&&` 都要对、`||` 一个对就行；`条件 ? 甲 : 乙` 是一行版 if/else，可以连环；`undefined`、`""`、`0`、`null`、`false` 都算「没有」，可以直接放进 `if` 里判空。记住 `undefined` 和 `""` 是两种不同的「空」。

---

[← 上一讲](/j5-functions) · [下一讲 · 循环与出错处理 →](/j7-loops-errors)
