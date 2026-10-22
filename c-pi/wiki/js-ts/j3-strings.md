# 第 3 讲 · 字符串与模板字符串：文字的操作

📍 **出现位置**：`source-resolver.ts` 第 27、34、58 行（模板字符串）、30 行（`startsWith`）、32–33 行（`indexOf`）、38–39、67 行（`slice`）、53 行（`replace`）、43 行（`length`）、65 行（`includes`）、66 行（`endsWith`）、72 行（`` `${repositoryRoot}${sep}` ``）

---

## 🤔 它们是干什么的？

**字符串**就是「一段文字」，用引号包起来：`"@earendil-works/pi-ai"`。翻译官的工作本质是**文字处理**——比对花名、拆分暗号、拼接地址——所以它浑身都是字符串操作。

### 三种引号

| 写法 | 名字 | 特长 |
|---|---|---|
| `"…"` 或 `'…'` | 普通字符串 | 原样装文字，两种引号完全等价 |
| `` `…` `` | **模板字符串**（反引号，键盘左上角） | 里面可以塞 `${表达式}`，运行时现场把值填进去 |

模板字符串的例子就在报错信息里（第 27 行）：

```ts
throw new Error(`Source runtime requires compilerOptions.paths in ${tsconfigPath}`);
```

`${tsconfigPath}` 会被替换成那个变量的真实内容——一句话里嵌一个活值。

### 字符串自带的「小工具」

字符串不用 import，天生自带一堆小工具，用**点号**叫出来：`字符串.工具名(...)`。翻译官用到的全家福：

| 写法 | 干什么 | 在翻译官里的活 |
|---|---|---|
| `s.length` | 长度有几个字符 | 给卡片按长度排队（第 43 行） |
| `s.startsWith(x)` | 是以 x 开头的吗 | 筛选自家花名（第 30 行）、对前缀暗号（第 66 行）、安检（第 73 行） |
| `s.endsWith(x)` | 是以 x 结尾的吗 | 对后缀暗号（第 66 行）、判断根目录带不带斜杠（第 72 行） |
| `s.includes(x)` | 里面含有 x 吗 | 看暗号里有没有 `*`（第 65 行） |
| `s.indexOf(x)` | x 第一次出现在第几位（从 0 数）；没有就回 `-1` | 找 `*` 的位置（第 32–33 行） |
| `s.slice(从, 到)` | 切出一段（含头不含尾） | 把暗号劈成前缀/后缀（第 38–39 行） |
| `s.replace(x, y)` | 把第一个 x 换成 y | 把替换地址里的 `*` 填成捕到的内容（第 53 行） |

三个最容易晕的点：

1. **位置从 0 开始数**：`"@earendil-works/pi-ai/*"` 的第 0 位是 `@`，`*` 在第 22 位，不是 23。
2. **`slice` 的终点「含头不含尾」**：`slice(0, 22)` 切到第 21 位为止。
3. **`slice` 收负数**：`slice(0, -2)` 表示「切到**倒数**第 2 位为止」——翻译官第 78 行用它把 `.js` 后缀切掉。

---

## 🧪 动手跑

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/j3-strings

cat > /Users/admin/Desktop/pi-study/c-pi/labs/j3-strings/strings.mjs <<'EOF'
// 字符串工具演练：全部用翻译官里的真实例子
const pattern = "@earendil-works/pi-ai/*";

console.log("① 长度 length:", pattern.length);
console.log("② * 在第几位 indexOf:", pattern.indexOf("*"));
console.log("③ 以 @earendil 开头吗 startsWith:", pattern.startsWith("@earendil"));
console.log("④ 以 /* 结尾吗 endsWith:", pattern.endsWith("/*"));
console.log("⑤ 包含 ai 吗 includes:", pattern.includes("ai"));

const star = pattern.indexOf("*");
console.log("⑥ 劈成前缀 slice(0, star):", JSON.stringify(pattern.slice(0, star)));
console.log("⑦ 劈出后缀 slice(star+1):", JSON.stringify(pattern.slice(star + 1)));

console.log("⑧ 负数下标 slice(0, -2)（从尾巴倒数）:", JSON.stringify("abcdef".slice(0, -2)));

console.log("⑨ 替换 replace:", pattern.replace("*", "providers/all"));

// 模板字符串：反引号 + ${}
const file = "index.ts";
console.log(`⑩ 模板字符串: packages/ai/src/${file}`);
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/j3-strings/strings.mjs
```

**预期输出**：

```text
① 长度 length: 23
② * 在第几位 indexOf: 22
③ 以 @earendil 开头吗 startsWith: true
④ 以 /* 结尾吗 endsWith: true
⑤ 包含 ai 吗 includes: true
⑥ 劈成前缀 slice(0, star): "@earendil-works/pi-ai/"
⑦ 劈出后缀 slice(star+1): "" 
⑧ 负数下标 slice(0, -2)（从尾巴倒数）: "abcd"
⑨ 替换 replace: @earendil-works/pi-ai/providers/all
⑩ 模板字符串: packages/ai/src/index.ts
```

对照着看：`*` 果然在第 22 位（长度 23，它是最后一个字符）；⑥⑦ 正是第 10 讲「把暗号劈成前缀+后缀」的实况；⑨ 正是前台第 53 行「把 `*` 填成捕到的内容」。

> 💡 ⑥⑦⑧ 外面包的 `JSON.stringify(...)` 只是为了**让空字符串现形**——不加它，`""` 打印出来就是一片空白，你分不清是「空了」还是「没打印」。加上它，空串会显示成 `""`，所见即所得。

---

## ✅ 小结

字符串用引号包起来；反引号模板字符串能用 `${…}` 嵌入活值。字符串自带小工具用点号调用：`length` 数长度、`startsWith/endsWith/includes` 三兄弟做判断、`indexOf` 找位置（没有回 `-1`）、`slice` 切段（含头不含尾、收负数）、`replace` 做替换。记住「位置从 0 数」，翻译官里一半的行数就靠这几个工具吃饭。

---

[← 上一讲](/j2-variables) · [下一讲 · 对象与数组 →](/j4-objects-arrays)
