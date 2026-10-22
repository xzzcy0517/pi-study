# 第 12 讲 · 两个帮手：对暗号与找真文件（第 64–86 行）

📍 **位置**：`pi/packages/coding-agent/src/experimental/source-resolver.ts` 第 64–86 行

```ts
function matchAlias(alias: SourceAlias, specifier: string): string | undefined {
	if (!alias.pattern.includes("*")) return specifier === alias.pattern ? "" : undefined;
	if (!specifier.startsWith(alias.prefix) || !specifier.endsWith(alias.suffix)) return undefined;
	return specifier.slice(alias.prefix.length, specifier.length - alias.suffix.length);
}

function resolveSourcePath(replacement: string): string | undefined {
	const basePath = resolve(repositoryRoot, replacement);
	const rootPrefix = repositoryRoot.endsWith(sep) ? repositoryRoot : `${repositoryRoot}${sep}`;
	if (!basePath.startsWith(rootPrefix)) return undefined;
	const extension = extname(basePath);
	const sourceExtension =
		extension === ".js" ? ".ts" : extension === ".mjs" ? ".mts" : extension === ".cjs" ? ".cts" : undefined;
	const candidates = sourceExtension
		? [basePath, `${basePath.slice(0, -extension.length)}${sourceExtension}`]
		: extension === ".ts" || extension === ".mts" || extension === ".cts" || extension === ".json"
			? [basePath]
			: [basePath, `${basePath}.ts`, resolve(basePath, "index.ts")];
	for (const candidate of candidates) {
		if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
	}
	return undefined;
}
```

---

## 🤔 它是干什么的？

上一讲的前台剧本里有两句台词被一笔带过：「对暗号」「找真文件」。这两句台词就是由最后这两个帮手函数完成的。它们**不掺和前台的政治**，只管把自己的一件小事做好——这种「一个函数只干一件事」的拆法，也是读代码时最值得学的手法。

### 帮手 1：`matchAlias`——对暗号（第 64–68 行）

输入：一张翻译卡片 + 顾客报的花名。输出：**对上了没有；对上的话，`*` 捕到了什么**。

```text
情况 A：卡片上没有 *（精确暗号）
   → 整个花名一字不差才算对上，捕到的东西是空串 ""

情况 B：卡片上有 *
   → 花名必须以「前缀」开头、以「后缀」结尾，否则不对
   → 对上后，把头尾剪掉，中间那段就是 * 捕到的猎物
```

看两个真实例子就懂了：

| 卡片 | 顾客报的花名 | 结果 |
|---|---|---|
| `@earendil-works/pi-ai`（无 `*`） | `@earendil-works/pi-ai` | ✅ 对上，捕到 `""` |
| `@earendil-works/pi-ai`（无 `*`） | `@earendil-works/pi-ai/oauth` | ❌ 没对上（多了尾巴，精确暗号不认） |
| `@earendil-works/pi-ai/*` | `@earendil-works/pi-ai/providers/all` | ✅ 对上，捕到 `providers/all` |
| `@earendil-works/pi-ai/*` | `@earendil-works/pi-tui` | ❌ 没对上（前缀就不对） |

`undefined`（查无此物）和 `""`（对上了但啥也没捕到）在这里被严格区分：前者是「没对上」，后者是「对上了」——所以第 11 讲的前台用 `=== undefined` 来判断要不要换下一张卡。

### 帮手 2：`resolveSourcePath`——找真文件（第 70–86 行）

输入：一条替换地址（`*` 已填好猎物）。输出：**磁盘上真实存在的文件地址；找不到就 `undefined`**。四步走：

**第 1 步 · 拼绝对地址 + 安检**（第 71–73 行）：

```ts
const basePath = resolve(repositoryRoot, replacement);   // 以仓库根为基准拼出绝对地址
if (!basePath.startsWith(rootPrefix)) return undefined;  // 拼完必须还在仓库大院里！
```

第二行是**保安检查**：如果替换地址里藏了 `../../../../etc/...` 这种「越狱」路径，拼出来的结果会跑出仓库根目录之外——直接拒绝服务（回 `undefined`）。翻译官只给本大院的地址带路。

**第 2 步 · 看后缀，决定「猜测清单」**（第 74–81 行）。源码世界有个小麻烦：同一个文件，可能被用**好几种写法**称呼。于是按后缀分三种情况，生成一份候选清单：

| 地址写的后缀 | 候选清单 | 为什么 |
|---|---|---|
| `.js` / `.mjs` / `.cjs` | 先试原样，再试换成 `.ts` / `.mts` / `.cts` | 有些地址是按「编译后的名字」写的，源码其实是 `.ts`——换个后缀再找找 |
| `.ts` / `.mts` / `.cts` / `.json` | 只试原样 | 写的本来就是源码真名，不用猜 |
| 没有后缀 | 依次试：原样 → 补上 `.ts` → 当文件夹找里面的 `index.ts` | 三种最常见的「省略写法」都照顾到 |

**第 3 步 · 一个个摸过去**（第 82–84 行）：`existsSync`（在不在）+ `statSync(...).isFile()`（是不是一个正经文件、而不是文件夹）双重确认，**第一个通过检验的候选直接胜出**。

**第 4 步 · 全落空就回 `undefined`**：交给前台去试卡片的下一个替换地址（回忆第 11 讲的双层循环）。

---

## 🧪 动手跑

把两个帮手原样抄进一个「演练场」，喂各种输入看输出（labs 里已放好，可直接运行；以下是完整创建命令）：

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/r12-helpers

cat > /Users/admin/Desktop/pi-study/c-pi/labs/r12-helpers/playground.mjs <<'EOF'
// 翻译官两个帮手函数的「演练场」——原样照搬，喂给它们各种输入看输出
import { existsSync, statSync } from "node:fs";
import { extname, resolve, sep } from "node:path";

const repositoryRoot = "/Users/admin/Desktop/pi-study/pi/";

// ── 帮手 1：对暗号（第 64–68 行同款）──
function matchAlias(alias, specifier) {
	if (!alias.pattern.includes("*"))
		return specifier === alias.pattern ? "" : undefined;
	if (!specifier.startsWith(alias.prefix) || !specifier.endsWith(alias.suffix))
		return undefined;
	return specifier.slice(
		alias.prefix.length,
		specifier.length - alias.suffix.length,
	);
}

// ── 帮手 2：找真文件（第 70–86 行同款）──
function resolveSourcePath(replacement) {
	const basePath = resolve(repositoryRoot, replacement);
	const rootPrefix = repositoryRoot.endsWith(sep)
		? repositoryRoot
		: `${repositoryRoot}${sep}`;
	if (!basePath.startsWith(rootPrefix)) return undefined;
	const extension = extname(basePath);
	const sourceExtension =
		extension === ".js"
			? ".ts"
			: extension === ".mjs"
				? ".mts"
				: extension === ".cjs"
					? ".cts"
					: undefined;
	const candidates = sourceExtension
		? [basePath, `${basePath.slice(0, -extension.length)}${sourceExtension}`]
		: extension === ".ts" ||
				extension === ".mts" ||
				extension === ".cts" ||
				extension === ".json"
			? [basePath]
			: [basePath, `${basePath}.ts`, resolve(basePath, "index.ts")];
	for (const candidate of candidates) {
		if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
	}
	return undefined;
}

// ── 演练开始 ──
console.log("===== 帮手 1：对暗号 =====");
const exactCard = {
	pattern: "@earendil-works/pi-ai",
	prefix: "@earendil-works/pi-ai",
	suffix: "",
};
const starCard = {
	pattern: "@earendil-works/pi-ai/*",
	prefix: "@earendil-works/pi-ai/",
	suffix: "",
};
console.log(
	"精确卡 vs 全对上的暗号 →",
	JSON.stringify(matchAlias(exactCard, "@earendil-works/pi-ai")),
	"（空字符串 = 对上，* 没捕到东西）",
);
console.log(
	"精确卡 vs 多拖了尾巴的暗号 →",
	matchAlias(exactCard, "@earendil-works/pi-ai/oauth"),
	"（undefined = 没对上）",
);
console.log(
	"带 * 卡 vs 子路径暗号 →",
	JSON.stringify(matchAlias(starCard, "@earendil-works/pi-ai/providers/all")),
	"（* 捕到的部分）",
);
console.log(
	"带 * 卡 vs 别家暗号 →",
	matchAlias(starCard, "@earendil-works/pi-tui"),
	"（undefined = 前缀对不上）",
);

console.log("\n===== 帮手 2：找真文件 =====");
console.log(
	"① 明写 .ts 的地址 →",
	resolveSourcePath("./packages/ai/src/compat.ts"),
);
console.log(
	"② 写着 .js 的地址（自动换 .ts）→",
	resolveSourcePath("./packages/ai/src/models.js"),
);
console.log(
	"③ 不带后缀（依次试 裸名 / +.ts / 文件夹找 index.ts）→",
	resolveSourcePath("./packages/ai/src/providers/all"),
);
console.log(
	"④ 想逃出仓库的地址（拒绝服务）→",
	resolveSourcePath("../../../../etc/hostname"),
);
console.log(
	"⑤ 仓库里但根本不存在的文件 →",
	resolveSourcePath("./packages/ai/src/不存在的文件.ts"),
);
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/r12-helpers/playground.mjs
```

**预期输出**：

```text
===== 帮手 1：对暗号 =====
精确卡 vs 全对上的暗号 → "" （空字符串 = 对上，* 没捕到东西）
精确卡 vs 多拖了尾巴的暗号 → undefined （undefined = 没对上）
带 * 卡 vs 子路径暗号 → "providers/all" （* 捕到的部分）
带 * 卡 vs 别家暗号 → undefined （undefined = 前缀对不上）

===== 帮手 2：找真文件 =====
① 明写 .ts 的地址 → /Users/admin/Desktop/pi-study/pi/packages/ai/src/compat.ts
② 写着 .js 的地址（自动换 .ts）→ /Users/admin/Desktop/pi-study/pi/packages/ai/src/models.ts
③ 不带后缀（依次试 裸名 / +.ts / 文件夹找 index.ts）→ /Users/admin/Desktop/pi-study/pi/packages/ai/src/providers/all.ts
④ 想逃出仓库的地址（拒绝服务）→ undefined
⑤ 仓库里但根本不存在的文件 → undefined
```

五个试验各戳中一个知识点：② 见证了 `.js` 自动换 `.ts`（磁盘上根本没有 `models.js`，找到的是 `models.ts`）；③ 见证了「补后缀」猜测；④ 见证了保安把越狱地址拒之门外；⑤ 说明「找不到」也是正常回答，不等于程序崩了。

---

## ✅ 小结

最后这两个帮手各管一件事：`matchAlias` 负责「对暗号」——无 `*` 的卡要一字不差，有 `*` 的卡对前缀后缀、把头尾剪掉取出捕获内容；`resolveSourcePath` 负责「找真文件」——拼绝对地址后先过保安（不许跑出仓库），再按后缀生成猜测清单（`.js` 换 `.ts`、补 `.ts`、找 `index.ts`），用 `existsSync` + `statSync` 逐个验证，第一个真实存在的胜出。至此，翻译官的 87 行全部拆解完毕。

---

[← 上一讲](/r11-register-hooks) · [下一讲 · 毕业总结：现场围观翻译官干活 →](/r13-resolver-summary)
