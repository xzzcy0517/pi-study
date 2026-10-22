# 第 8 讲 · TypeScript 加的那层料：类型、`interface`、`?.`、`??=`

📍 **出现位置**：`source-resolver.ts` 第 10–21 行（`interface`、`readonly`、`?`、泛型）、23 行（`new`）、25 行（`as`）、26 行（`?.`）、29 行（`: SourceAlias[]`）、47 行（`string | undefined`）、51 行（`??=`）、64、70 行（参数与返回值类型）

---

## 🤔 它们是干什么的？

第 1 讲说过：TS = JS + 类型批注，跑起来之前批注会被**撕掉**。这一讲认识翻译官用到的所有「批注写法」，外加两个虽是 JS 但长得很像批注的运算符（`?.`、`??=`）。

### 类型批注 `: 类型`

```ts
const aliases: SourceAlias[] = …          // 这个格子里装「翻译卡片数组」
function matchAlias(alias: SourceAlias, specifier: string): string | undefined
```

函数那行从头到尾读：进料 `alias` 是卡片、`specifier` 是字符串；冒号跑到括号**后面**的那个（`: string | undefined`）说的是**出料**的类型——「要么字符串，要么 undefined」。

`|` 叫**联合类型**：「要么是这个，要么是那个」。

### `interface`：登记表模板

```ts
interface SourceAlias {
	readonly pattern: string;
	readonly prefix: string;
	// …
}
```

一张登记表模板：一张合格的翻译卡片必须有 `pattern`（只许看的字符串）、`prefix`……各格子。

| 批注符号 | 意思 |
|---|---|
| `readonly` | 这个格子只许看、不许改 |
| `格子名?` | 这个格子可以没有（如 `compilerOptions?`、`note?`） |
| `string[]` | 字符串**数组** |
| `Record<string, string[]>` | 泛型（模板配方）：「键是字符串、值是字符串数组」的对象 |
| `Readonly<…>` | 泛型：「整个只许看」的那款 |

泛型 `<…>` 你就当它是**配方的参数**：`Readonly<Record<string, string[]>>` = 来一份「只许看版的（字符串→字符串数组）对照表」。第 12 行的 `readonly compilerOptions?: …` 同时叠了 readonly 和 `?` 两层。

### `as`：我担保，就按这个类型算

```ts
JSON.parse(readFileSync(tsconfigPath, "utf8")) as TsConfig
```

`JSON.parse` 返回的东西 node 只知道是「随便什么数据」，`as TsConfig` 是程序员拍胸脯：**「我保证它符合 TsConfig 那张登记表，你就当它是」**。担保错了 node 也不管——它只撕批注，不查真伪（下面的实验会证明）。

### `new`：照图纸造一个

```ts
new URL("../../../..", import.meta.url)
new Error(`…`)
```

`new X(...)` = 照 X 的图纸**造一个真家伙出来**（URL 对象、错误包裹）。造出来之前它只是图纸。

### `?.` 与 `??=`：JS 的运算符（不是批注！）

这俩是**普通 JS 也能跑**的真运算符，只是长相像标点批注，放这里一起认：

- `tsconfig.compilerOptions?.paths`（第 26 行）——**试探式取值**：`compilerOptions` 在就继续往里取 `paths`，不在就整个回 `undefined`，**不炸**。不写 `?.` 硬取，第一层没有就直接 `TypeError` 炸给你看。
- `matchedPattern ??= alias.pattern`（第 51 行）——**只在空着的时候才填**：格子里已经有东西了就不动。前台靠它「只记住第一张对上的卡」。

### 最重要的一个事实：node 只撕不查

「类型批注」只对**写代码的人**和**检查工具**有意义；node 跑 `.ts` 时只是把批注撕掉再执行，**完全不检查类型对错**。所以类型写错了程序照样跑——批注是给人类的护栏，不是给发动机的规矩。（Pi 仓库里真正的类型检查归 `npm run check` 管，那是另一道工序。）

---

## 🧪 动手跑

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/j8-typescript

# ① 批注全副武装的 TS 文件，正常跑
cat > /Users/admin/Desktop/pi-study/c-pi/labs/j8-typescript/typed.mts <<'EOF'
// TypeScript 加料演练（注意后缀是 .mts）
interface Card {
	readonly pattern: string; // readonly：这个格子只许看
	note?: string; // ?：这个格子可以有、可以没有
}

const card: Card = { pattern: "@earendil-works/pi-ai" };

// 参数和返回值都可以标明类型
function greet(name: string): string {
	return `你好，${name}`;
}

console.log(greet(card.pattern));
console.log("note 格子没填:", card.note); // undefined

// 联合类型：string | undefined = 「要么是字符串，要么是 undefined」
let matched: string | undefined;
matched = "@earendil-works/pi-ai/*";
console.log("matched:", matched);
EOF
node /Users/admin/Desktop/pi-study/c-pi/labs/j8-typescript/typed.mts

# ② 石破天惊：类型写「错」了，node 照样跑
cat > /Users/admin/Desktop/pi-study/c-pi/labs/j8-typescript/wrong-type.mts <<'EOF'
// 石破天惊：类型写「错」了，node 照样跑！
const x: string = 123;
console.log("x =", x, "（node 只把类型撕掉，不检查对错）");
EOF
node /Users/admin/Desktop/pi-study/c-pi/labs/j8-typescript/wrong-type.mts

# ③ ?. 与 ??=（普通 .mjs 就能跑——它们是 JS 运算符）
cat > /Users/admin/Desktop/pi-study/c-pi/labs/j8-typescript/optional-and-nullish.mjs <<'EOF'
// ① ?. 一层层试探，任何一层没有就停下回 undefined
const cfg = {};
console.log("① cfg.compilerOptions?.paths →", cfg.compilerOptions?.paths);

// ② ??= 「只在还空着的时候才赋值」
let matched;
matched ??= "第一张对上的卡";
matched ??= "第二张（不会覆盖）";
console.log("② matched =", matched);
EOF
node /Users/admin/Desktop/pi-study/c-pi/labs/j8-typescript/optional-and-nullish.mjs

# ④ 对比：不用 ?. 硬取，第一层就炸
cat > /Users/admin/Desktop/pi-study/c-pi/labs/j8-typescript/without-optional-crash.mjs <<'EOF'
// 不用 ?. 的下场：第一层就没有，硬往里钻会炸
const cfg = {};
console.log(cfg.compilerOptions.paths);
EOF
node /Users/admin/Desktop/pi-study/c-pi/labs/j8-typescript/without-optional-crash.mjs
```

**预期输出**：

```text
（① typed.mts：）
你好，@earendil-works/pi-ai
note 格子没填: undefined
matched: @earendil-works/pi-ai/*
（② wrong-type.mts：）
x = 123 （node 只把类型撕掉，不检查对错）
（③ optional-and-nullish.mjs：）
① cfg.compilerOptions?.paths → undefined
② matched = 第一张对上的卡
（④ without-optional-crash.mjs 报错：）
TypeError: Cannot read properties of undefined (reading 'paths')
```

② 是本讲题眼：`string` 的格子装了数字 `123`，node 毫无怨言——批注归批注，执行归执行。③④ 是一对对比：同样面对「格子不存在」，`?.` 温柔地回 `undefined`，硬钻直接 `TypeError`。

---

## ✅ 小结

TS 批注全家福：`: 类型`（变量、参数、返回值都能标）、`interface` 登记表、`readonly` 只许看、`?` 可有可无、`[]` 数组、`|` 联合、`<…>` 泛型配方、`as` 拍胸脯担保、`new` 照图纸造。另有三个**真运算符**常和批注撞脸：`?.`（试探取值不炸）、`??=`（空着才填）、`? :`（三元，第 6 讲）。铁律：**node 只撕批注不查对错**——类型是写给人类的护栏。

---

[← 上一讲](/j7-loops-errors) · [下一讲 · JSON 与 tsconfig.json →](/j9-json-tsconfig)
