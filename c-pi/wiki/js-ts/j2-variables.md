# 第 2 讲 · 变量与常量：`const` 和 `let`

📍 **出现位置**：`source-resolver.ts` 第 23–26、29 行（`const`）、第 47 行（`let`）

```ts
const repositoryRoot = fileURLToPath(new URL("../../../..", import.meta.url));
const tsconfigPath = resolve(repositoryRoot, "tsconfig.json");
// ……
let matchedPattern: string | undefined;
```

---

## 🤔 它们是干什么的？

程序要干活，就得有地方**存东西**。变量就是贴了名字的储物格。

### `const`：一次性锁定的格子

```ts
const tsconfigPath = resolve(repositoryRoot, "tsconfig.json");
```

读法：**造一个名叫 `tsconfigPath` 的格子，把右边算出来的东西放进去，锁死**。`const`（constant，常量）的意思是：这个格子里装的**是哪一份**，以后不许换——再想往里塞别的，直接报错。

翻译官里绝大多数格子都是 `const`：仓库根目录、花名册、卡片堆……算出来就不该变。这是好习惯：**能锁死就锁死，少一分被改坏的可能**。

### `let`：可以换内容的格子

```ts
let matchedPattern: string | undefined;
```

`let` 造的格子**允许换人**。前台为什么需要它？因为要「记住第一张对上的卡」——一开始格子是空的，对上了就换一张进去（`matchedPattern ??= …`，第 8 讲讲 `??=`）。会变的，才用 `let`。

### 起名规矩

`repositoryRoot`、`tsconfigPath` 这种「几个词粘一起、后面每个词首字母大写」的写法叫**驼峰命名**（camelCase）——JS 世界的通用习惯。名字随便起，但好名字让代码自己会说话。

### 一个特例：`import.meta.url` 是「送的」

第 23 行里的 `import.meta.url` 不是你造的格子——它是 **node 送给每个文件的现成变量**，内容固定是「这个文件自己的网址」。别人送的，拿来就用，不用声明。（shell 站第 9 讲就是靠它算出仓库根目录的。）

---

## 🧪 动手跑

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/j2-variables

# ① const 与 let 的日常
cat > /Users/admin/Desktop/pi-study/c-pi/labs/j2-variables/variables.mjs <<'EOF'
const name = "翻译官";
let count = 1;
count = 2; // let 的东西可以换人
console.log(name, "第", count, "次值班");

// const 锁住的是「指向」，屋子里的家具可以换
const card = { pattern: "@earendil-works/pi-ai" };
card.pattern = "@earendil-works/pi-tui";
console.log("卡片内容被改成了:", card.pattern);
EOF
node /Users/admin/Desktop/pi-study/c-pi/labs/j2-variables/variables.mjs

# ② 给 const 换人 → 当场炸
cat > /Users/admin/Desktop/pi-study/c-pi/labs/j2-variables/const-crash.mjs <<'EOF'
const name = "翻译官";
name = "前台"; // const 不许换人，这一行会炸
console.log(name);
EOF
node /Users/admin/Desktop/pi-study/c-pi/labs/j2-variables/const-crash.mjs

# ③ node 送的现成变量
cat > /Users/admin/Desktop/pi-study/c-pi/labs/j2-variables/show-me.mjs <<'EOF'
console.log("node 送给我的现成变量——我自己的网址：");
console.log(import.meta.url);
EOF
node /Users/admin/Desktop/pi-study/c-pi/labs/j2-variables/show-me.mjs
```

**预期输出**：

```text
翻译官 第 2 次值班
卡片内容被改成了: @earendil-works/pi-tui
（第 ② 个文件报错：）
TypeError: Assignment to constant variable.
（第 ③ 个文件：）
node 送给我的现成变量——我自己的网址：
file:///Users/admin/Desktop/pi-study/c-pi/labs/j2-variables/show-me.mjs
```

三个要点各自现形：

1. `let` 的 `count` 从 1 换成 2，正常；`const` 的 `name` 纹丝不动。
2. 给 `const` 换人 → `TypeError`（类型错误：不许给常量赋值）。但注意第 ① 个文件里：**`const` 的对象，改它身上的格子是允许的**——锁死的是「这张卡片本身」，不是卡片上的字。所以 `card.pattern = …` 不报错。
3. `import.meta.url` 打印出来正是这个文件自己的网址——跟 shell 站第 9 讲用的是同一个变量。

---

## ✅ 小结

`const 名字 = 东西` 造一个锁死的格子（首选），`let 名字 = 东西` 造一个可换内容的格子（确实要变才用）。`const` 锁的是「指向哪一份」，不锁那份东西肚子里的内容。`import.meta.url` 是 node 白送的现成变量，内容是文件自己的网址。

---

[← 上一讲](/j1-four-languages) · [下一讲 · 字符串与模板字符串 →](/j3-strings)
