# 第 10 讲 · tsconfig.base.json 逐条：全仓库共享的底色

📍 **对应文件**：`pi/tsconfig.base.json` 全文（这就是 `tsconfig.json` 里 `"extends"` 抄作业的那份底稿）

```json
{
	"compilerOptions": {
		"target": "ES2024",
		"module": "Node16",
		"lib": ["ES2024"],
		"strict": true,
		"erasableSyntaxOnly": true,
		"verbatimModuleSyntax": true,
		"esModuleInterop": true,
		"skipLibCheck": true,
		"forceConsistentCasingInFileNames": true,
		"declaration": true,
		"declarationMap": true,
		"sourceMap": true,
		"inlineSources": true,
		"inlineSourceMap": false,
		"moduleResolution": "Node16",
		"resolveJsonModule": true,
		"allowImportingTsExtensions": true,
		"rewriteRelativeImportExtensions": true,
		"types": ["node"]
	}
}
```

---

## 🤔 这份文件是干什么的？

第 9 讲说过，tsconfig.json 是「TS 检查工具的说明书」。这份 `base` 版是**全仓库共享的底色**：17 个包各自的小 tsconfig 都从它抄起。19 行看着唬人，其实按用途分成四组：**定方言 → 立护栏 → 管产物 → 开方便之门**。逐条过一遍，每条后面标注「你以后读源码时在哪里会撞上它」。

实验都用 pi 仓库自带的 `tsc`（`/Users/admin/Desktop/pi-study/pi/node_modules/.bin/tsc`，TypeScript 检查器的命令行本体，`npm run check` 最后跑的就是它）。

> 💡 **疑点先讲：`.bin/tsc` 打开只有两行、还引用了一个不存在的 `../lib/tsc.js`，为什么却能跑？**
>
> 用编辑器打开 `node_modules/.bin/tsc`，你会看到：
>
> ```js
> #!/usr/bin/env node
> import "../lib/tsc.js";
> ```
>
> 从 `.bin/` 出发按字面找 `../lib/tsc.js`，是 `node_modules/lib/tsc.js`——**不存在**。但命令明明跑得好好的。机关在于：`.bin/tsc` **不是真文件，是一个软链接（symlink，快捷方式）**，真身是 `node_modules/typescript/bin/tsc`：
>
> ```bash
> ls -la /Users/admin/Desktop/pi-study/pi/node_modules/.bin/tsc
> ```
>
> ```text
> lrwxr-xr-x … .bin/tsc -> ../typescript/bin/tsc
> ```
>
> 行首的 `l` 和末尾的 `-> 箭头`就是快捷方式的身份证。npm 装包时，会把每个包提供的命令都在 `.bin/` 里放这样一个快捷方式（所以 `.bin/` 里才有一大串名字）。
>
> 同一份内容，两双眼睛看出两个结果：
>
> - **编辑器**：穿墙显示真身的内容，但路径栏仍写 `.bin/tsc`——你按 `../lib/tsc.js` 跳转时，它从 `.bin/` 出发找，自然扑空；
> - **node**：执行快捷方式前，**先还原成真身**（realpath），再解析里面的相对 `import`——`../lib/tsc.js` 相对真身 `typescript/bin/` 来找，即 `typescript/lib/tsc.js`，这个**真的存在**，所以跑得好好的。
>
> 迷你复现实验（labs 里已建好 `j10-base/symlink-demo/`）：
>
> ```bash
> cd /Users/admin/Desktop/pi-study/c-pi/labs/j10-base
> mkdir -p symlink-demo/typescript/bin symlink-demo/typescript/lib symlink-demo/.bin
> cat > symlink-demo/typescript/lib/tsc-lite.mjs <<'EOF'
> console.log("真身库文件被执行了！我住在 typescript/lib/");
> EOF
> cat > symlink-demo/typescript/bin/tsc-lite.mjs <<'EOF'
> #!/usr/bin/env node
> import "../lib/tsc-lite.mjs";
> EOF
> ln -s ../typescript/bin/tsc-lite.mjs symlink-demo/.bin/tsc-lite   # 造快捷方式
>
> ls -la symlink-demo/.bin/tsc-lite                  # ① 看 l 开头和 -> 箭头
> ls symlink-demo/.bin/../lib/tsc-lite.mjs           # ② 编辑器的找法：扑空
> node symlink-demo/.bin/tsc-lite                    # ③ node 的找法：成功
> node -p 'require("node:fs").realpathSync("symlink-demo/.bin/tsc-lite")'  # ④ 还原真身
> ```
>
> **预期输出**：
>
> ```text
> ① lrwxr-xr-x … .bin/tsc-lite -> ../typescript/bin/tsc-lite.mjs
> ② ls: symlink-demo/.bin/../lib/tsc-lite.mjs: No such file or directory
> ③ 真身库文件被执行了！我住在 typescript/lib/
> ④ …/symlink-demo/typescript/bin/tsc-lite.mjs
> ```
>
> 一句话记住：**`.bin` 里全是快捷方式；看内容时编辑器按「你打开的路径」算相对位置，跑起来时 node 按「真身的位置」算相对位置**。以后读任何包的 bin 脚本都适用。

### 第一组 · 定方言：这门语言说哪个年代的版本

**`target: "ES2024"` + `lib: ["ES2024"]`** —— JS 每年都有新版本（ES2023、ES2024……），`target` 说「我们按 ES2024 的方言写」，`lib` 配套说「ES2024 自带的那些现成工具（数组新方法、`Object.groupBy` 等）都认识」。写旧年份，新工具就会被误判成「不存在」。

**`module: "Node16"` + `moduleResolution: "Node16"`** —— import 语句按 Node 16 定下的规矩解析（比如 `import "./foo.js"` 实际找的是 `foo.ts`）。根目录的 tsconfig.json 把它覆盖成了 `NodeNext`（下一讲讲）。

### 第二组 · 立护栏：这些写法不许用

**`strict: true`** —— **一整族严格检查的总开关**，里面包括两个最常用的：

- `noImplicitAny`：参数类型不许「靠猜」，必须写明（TS7006）；
- `strictNullChecks`：可能是 `undefined` 的东西不许直接用（TS18048）——你在源码里看到的满坑满谷的 `?.`（第 8 讲）和 `if (!x) throw`（fail fast），**全是这条规矩逼出来的好习惯**。

**`erasableSyntaxOnly: true`** —— 只准用「能被整块撕掉」的 TS 语法。为什么？因为 node 跑 `.ts` 靠的就是「撕批注」（第 1 讲）。像 `enum`（枚举）这种**会在运行时变出真代码**的语法，撕完就坏了，所以直接禁用（TS1294）。这是「免构建跑源码」能成立的前提之一。

**`verbatimModuleSyntax: true`** —— import 写进来什么，就原样是什么，不许偷偷转换。**类型必须用 `import { type X }` 标出来**。Pi 源码里满地的 `import { type … }` 就是它规定的，例如 `main.ts:9`：

```ts
import { type ImageContent, modelsAreEqual } from "@earendil-works/pi-ai";
```

**`forceConsistentCasingInFileNames: true`** —— import 里的文件名大小写必须和磁盘上一致。macOS 的文件系统**不区分大小写**（`FOO.ts` 和 `foo.ts` 都能打开），但 Linux 服务器区分——不开这个检查，就会出现「我电脑上好好的，CI 上炸了」。

### 第三组 · 管产物：打包发布时产出什么

这组只对「编译发布」有意义（仓库平时 `noEmit`，下一讲讲）：

| 配置 | 产出的东西 |
|---|---|
| `declaration: true` | `.d.ts`——给使用者看的「类型说明书」 |
| `declarationMap: true` | `.d.ts.map`——说明书到源码的地图（编辑器「跳转到定义」靠它直达源码） |
| `sourceMap: true` | `.js.map`——编译产物到源码的地图（调试时用） |
| `inlineSources: true` | 地图里**嵌入源码全文**，地图文件自包含 |
| `inlineSourceMap: false` | 地图**单独成文件**，不塞进 `.js` 尾巴里 |

### 第四组 · 开方便之门

**`resolveJsonModule: true`** —— 允许 `import` 直接读 `.json` 文件（第 9 讲的 JSON 知识直接用进代码）。Pi 的模型数据就是这么读的，例如 `packages/ai/src/providers/xiaomi.models.ts:4`：

```ts
import values from "./data/xiaomi.json" with { type: "json" };
```

**`allowImportingTsExtensions: true` + `rewriteRelativeImportExtensions: true`** —— 一对搭档：前者**允许** import 时写真话（`./foo.ts`），后者在**发布编译时自动改写成** `./foo.js`。所以你在源码里看到的都是 `.ts` 后缀（如 `cli.ts:2` 的 `from "./cli/setup.ts"`）——node 撕批注直接跑需要真后缀，发布时再由编译器改写，两头都照顾到。

**`types: ["node"]`** —— 只装「node 全家桶」的类型说明书（`process`、`Buffer` 等全局变量才算合法）。

**`esModuleInterop: true`、`skipLibCheck: true`** —— 两个「少折腾」开关：前者让 ESM 和老式 CJS 包互相 import 时少些别扭；后者说「node_modules 里**别人写的**说明书（`.d.ts`）有毛病别找我」——只查自己的代码，检查速度快得多。

---

## 🧪 动手跑

六个开关，六个眼见为实的实验（实验文件 labs 里已建好，以下是从零创建的完整命令）：

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/j10-base
cd /Users/admin/Desktop/pi-study/c-pi/labs/j10-base
TSC=/Users/admin/Desktop/pi-study/pi/node_modules/.bin/tsc

# ① strict 家族：参数类型不许靠猜
cat > strict-demo.ts <<'EOF'
function greet(name) {
	return "你好 " + name;
}
console.log(greet("世界"));
EOF
$TSC --noEmit --noImplicitAny false strict-demo.ts && echo "（关掉：安静通过）"
$TSC --noEmit --strict strict-demo.ts

# ② strict 家族：可能是 undefined 的东西不许直接用
cat > null-demo.ts <<'EOF'
const x: string | undefined = undefined;
console.log(x.length);
EOF
$TSC --noEmit --strictNullChecks false null-demo.ts && echo "（关掉：安静通过）"
$TSC --noEmit --strictNullChecks null-demo.ts

# ③ erasableSyntaxOnly：enum 这种「变出真代码」的语法被禁
cat > enum-demo.ts <<'EOF'
enum Color {
	Red,
	Green,
}
console.log(Color.Red);
EOF
$TSC --noEmit enum-demo.ts && echo "（不开检查：安静通过）"
$TSC --noEmit --erasableSyntaxOnly enum-demo.ts

# ④ verbatimModuleSyntax：类型 import 必须标明 type
cat > card.ts <<'EOF'
export interface Card {
	pattern: string;
}
EOF
cat > vms-demo.ts <<'EOF'
import { Card } from "./card.js";
const c: Card = { pattern: "x" };
console.log(c.pattern);
EOF
$TSC --noEmit --verbatimModuleSyntax vms-demo.ts
cat > vms-fixed.ts <<'EOF'
import { type Card } from "./card.js";
const c: Card = { pattern: "x" };
console.log(c.pattern);
EOF
$TSC --noEmit --verbatimModuleSyntax vms-fixed.ts && echo "（改成 import { type Card } 后：安静通过）"

# ⑤ target：ES2023 还不认识 Object.groupBy，ES2024 认识
cat > groupby-demo.ts <<'EOF'
const r = Object.groupBy([1, 2, 3, 4], (n: number) => (n % 2 === 0 ? "偶" : "奇"));
console.log(r);
EOF
$TSC --noEmit --target ES2023 groupby-demo.ts
$TSC --noEmit --target ES2024 groupby-demo.ts && echo "（ES2024：安静通过）"

# ⑥ 大小写一致性：两位同事用两种大小写引用同一文件
cat > foo.ts <<'EOF'
export const x = 1;
EOF
cat > a.ts <<'EOF'
import { x } from "./foo.js";
console.log(x);
EOF
cat > b.ts <<'EOF'
import { x } from "./FOO.js";
console.log(x);
EOF
$TSC --noEmit --module Node16 --moduleResolution Node16 --forceConsistentCasingInFileNames a.ts b.ts
```

**预期输出**（报错就是胜利——每条都对应一个开关在干活）：

```text
① （关掉：安静通过）
  strict-demo.ts(1,16): error TS7006: Parameter 'name' implicitly has an 'any' type.
② （关掉：安静通过）
  null-demo.ts(2,13): error TS18048: 'x' is possibly 'undefined'.
③ （不开检查：安静通过）
  enum-demo.ts(1,6): error TS1294: This syntax is not allowed when 'erasableSyntaxOnly' is enabled.
④ vms-demo.ts(1,10): error TS1484: 'Card' is a type and must be imported using a type-only import …
  （改成 import { type Card } 后：安静通过）
⑤ groupby-demo.ts(1,18): error TS2550: Property 'groupBy' does not exist on type 'ObjectConstructor'. …
  （ES2024：安静通过）
⑥ b.ts(1,19): error TS1149: File name '…/FOO.ts' differs from already included file name '…/foo.ts' only in casing.
```

再补两个「产物」实验——发布四件套长什么样，以及 `types: ["node"]` 管什么：

```bash
# ⑦ 发布四件套：.js + .d.ts + 两张地图
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/j10-base/emit
cd /Users/admin/Desktop/pi-study/c-pi/labs/j10-base/emit
cat > hello.ts <<'EOF'
export function hello(name: string): string {
	return `你好，${name}`;
}
EOF
/Users/admin/Desktop/pi-study/pi/node_modules/.bin/tsc hello.ts --target ES2024 --module Node16 --declaration --declarationMap --sourceMap --inlineSources
ls -1
cat hello.d.ts

# ⑧ types: ["node"]——没有它，process 都不认识
cd /Users/admin/Desktop/pi-study/c-pi/labs/j10-base
mkdir -p empty-types
cat > process-demo.ts <<'EOF'
process.exitCode = 0;
console.log("process 是 node 的全局变量");
EOF
$TSC --noEmit --typeRoots /Users/admin/Desktop/pi-study/c-pi/labs/j10-base/empty-types process-demo.ts
$TSC --noEmit --typeRoots /Users/admin/Desktop/pi-study/pi/node_modules/@types --types node process-demo.ts && echo "（配上 node 类型后：安静通过）"
```

**预期输出**：

```text
⑦ hello.d.ts  hello.d.ts.map  hello.js  hello.js.map  hello.ts
  hello.d.ts 的内容：
  export declare function hello(name: string): string;
  //# sourceMappingURL=hello.d.ts.map
⑧ process-demo.ts(1,1): error TS2591: Cannot find name 'process'. Do you need to install type definitions for node? …
  （配上 node 类型后：安静通过）
```

⑦ 里注意 `hello.d.ts`——**只有「形状」没有实现**（`export declare function …`），这就是给使用者看的说明书；报错信息 ⑧ 甚至亲口告诉你解法是 "add 'node' to the types field"——正是 `types: ["node"]` 那行干的活。

> 💡 命令行里的 `--noEmit`、`--strict` 这些旗子，和 tsconfig 里的配置项是**同一套东西的两种写法**：写在文件里 = 长久规矩，跟在命令后 = 临时指定。下一讲的 `noEmit` 你会在 pi 的 `npm run check` 里看到命令行版。

---

## ✅ 小结

`tsconfig.base.json` 是全仓库共享的检查规矩，分四组：**定方言**（`target`/`lib` ES2024、`module` Node16）；**立护栏**（`strict` 一族、`erasableSyntaxOnly` 只许可撕语法、`verbatimModuleSyntax` 逼出 `import { type … }`、`forceConsistentCasingInFileNames` 防大小写坑）；**管产物**（`.d.ts` + 两张地图 + 嵌源码）；**开方便之门**（`resolveJsonModule` 直接 import JSON、`allow/rewrite…TsExtensions` 让源码写 `.ts` 真后缀、`types:["node"]`、`skipLibCheck`）。读懂它们，源码里那些「奇怪但整齐」的写法就都有了出处。

---

[← 上一讲](/j9-json-tsconfig) · [下一讲 · tsconfig.json 逐条 →](/j11-tsconfig-root)
