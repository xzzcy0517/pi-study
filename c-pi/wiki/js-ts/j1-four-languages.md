# 第 1 讲 · 先认识四种「语言」：JS、TS、Node、JSON

📍 **对应文件**：`source-resolver.ts` 全文（尤其第 1–4 行 `import`）、`tsconfig.json` 全文

> 🧭 **这个站是干什么的**：读 shell 站第二季（source-resolver.ts 陪读）时，如果某个符号、某句写法看不懂，来这个站查。这里把**那两个文件用到的每一个语法点**都讲一遍，例子全部取自这两个文件本身。

---

## 🤔 它们是干什么的？

两个文件里其实混着**四种不同的东西**，零基础最容易在这里犯迷糊，先花五分钟分清角色：

| 角色 | 是什么 | 打个比方 | 在哪出现 |
|---|---|---|---|
| **JavaScript（JS）** | 编程语言本体——下指令的「普通话」 | 菜的做法（先放油、再下菜） | `source-resolver.ts` 的主体 |
| **TypeScript（TS）** | JS 外面加了一层「类型批注」 | 菜谱上用铅笔做的备注，炒菜前会擦掉 | 同上的 `: string`、`interface` 等 |
| **Node.js（node）** | 让 JS/TS 跑起来的「发动机」 | 灶台 | 你在终端敲的每一个 `node …` |
| **JSON** | 一种**写数据的格式**，不是编程语言 | 标准格式的登记表 | `tsconfig.json` 整个文件 |

一句话串起来：**用 TS 给 JS 加批注写程序，靠 node 来跑；配置数据则写成 JSON 文件**。

### 文件后缀就是「身份证」

| 后缀 | 含义 |
|---|---|
| `.js` / `.mjs` / `.cjs` | 纯 JavaScript（三种模块规格，本站只用 `.mjs`） |
| `.ts` / `.mts` / `.cts` | 带类型批注的 TypeScript（对应上面三种） |
| `.json` | 纯数据（tsconfig.json 就是这种） |

关键事实：**新版 node 能直接跑 `.ts`/`.mts`——它会把类型批注「撕掉」再执行**（这就是 shell 站第 6 讲说的「node 天生看得懂 TypeScript」）；但它**不替纯 JS 文件撕批注**——把 TS 写法塞进 `.mjs`，node 会直接翻脸。

### 第 1–4 行的 `import`：文件之间怎么「搬东西」

```ts
import { existsSync, readFileSync, statSync } from "node:fs";
```

读法：**从 `node:fs` 这个工具间里，搬出 `existsSync`、`readFileSync`、`statSync` 三件工具**。

- `import { … } from "…"` = 从别处搬工具进来；反过来，一个文件想把自己的东西借给别人用，就写 `export`（本站实验里会看到）。
- `"node:fs"` 里的 **`node:` 前缀 = 「这是 node 自家工具间，不用安装」**。没有 `node:` 的（比如 `@earendil-works/pi-ai`）就是需要按名字去找的「外面的包裹」——那正是翻译官要管的事（shell 站第 8–13 讲）。

---

## 🧪 动手跑

亲手验证「后缀决定 node 的脾气」：

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/j1-languages

# ① 纯 JS，没有任何批注
cat > /Users/admin/Desktop/pi-study/c-pi/labs/j1-languages/hello.mjs <<'EOF'
console.log("你好，我是 JavaScript");
EOF
node /Users/admin/Desktop/pi-study/c-pi/labs/j1-languages/hello.mjs

# ② 同一个写法，但混入了 TS 的类型批注（: number），后缀却是 .mjs
cat > /Users/admin/Desktop/pi-study/c-pi/labs/j1-languages/typed-bad.mjs <<'EOF'
const x: number = 42;
console.log("x =", x);
EOF
node /Users/admin/Desktop/pi-study/c-pi/labs/j1-languages/typed-bad.mjs

# ③ 把后缀改成 .mts，再加一张 interface 说明书，node 立刻笑纳
cat > /Users/admin/Desktop/pi-study/c-pi/labs/j1-languages/typed.mts <<'EOF'
interface Friend {
	name: string;
}
const x: number = 42;
const me: Friend = { name: "翻译官" };
console.log("x =", x, "，我是", me.name);
EOF
node /Users/admin/Desktop/pi-study/c-pi/labs/j1-languages/typed.mts
```

**预期输出**：

```text
你好，我是 JavaScript
（第 ② 个文件报错：）
const x: number = 42;
      ^
SyntaxError: Missing initializer in const declaration
（第 ③ 个文件正常：）
x = 42 ，我是 翻译官
```

- ① 纯 JS，顺风顺水。
- ② node 把这份 `.mjs` 当纯 JS 读，`const x:` 后面的 `: number` 它完全不认识，直接 `SyntaxError`（语法错误）——**报错信息里的 `^` 小箭头，指的就是它「读不懂的位置」**。
- ③ 一模一样的批注，换成 `.mts` 后缀，node 先把批注撕掉再跑，风平浪静。

---

## ✅ 小结

JS 是下指令的语言，TS 是给 JS 加「类型批注」的增强版，node 是跑它们的发动机，JSON 是写配置数据的格式。文件后缀（`.mjs` vs `.mts`）决定 node 用哪套规矩读文件；`import { … } from "…"` 用来从别的文件（或 node 自家工具间）搬工具进来。后面每一讲，我们都会把 `source-resolver.ts` 里的写法拆归到这几位角色名下。

---

[下一讲 · 变量与常量 →](/j2-variables)
