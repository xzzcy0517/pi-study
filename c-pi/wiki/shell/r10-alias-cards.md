# 第 10 讲 · 把花名册加工成翻译卡片（第 29–43 行）

📍 **位置**：`pi/packages/coding-agent/src/experimental/source-resolver.ts` 第 29–43 行

```ts
const aliases: SourceAlias[] = Object.entries(paths)
	.filter(([pattern]) => pattern.startsWith("@earendil-works/"))
	.map(([pattern, replacements]) => {
		const wildcard = pattern.indexOf("*");
		if (wildcard !== -1 && pattern.indexOf("*", wildcard + 1) !== -1) {
			throw new Error(`Source runtime does not support multiple wildcards in ${pattern}`);
		}
		return {
			pattern,
			prefix: wildcard === -1 ? pattern : pattern.slice(0, wildcard),
			suffix: wildcard === -1 ? "" : pattern.slice(wildcard + 1),
			replacements,
		};
	})
	.sort((left, right) => right.pattern.length - left.pattern.length);
```

---

## 🤔 它是干什么的？

上一讲拿到的是**生花名册**——tsconfig.json 里原汁原味 32 条记录。这一段把它**加工成一叠顺手好用的「翻译卡片」**，正好用上第 10 讲那张 `SourceAlias` 说明书。整条生产线连起来是四道工序：**摊平 → 筛选 → 拆卡 → 排序**。

### 工序一：`Object.entries` 把名册「摊平」

`paths` 在文件里是这样一坨（节选）：

```json
"@earendil-works/pi-ai": ["./packages/ai/src/index.ts"],
"@earendil-works/pi-ai/*": ["./packages/ai/src/*.ts", "./packages/ai/src/providers/*.ts"]
```

`Object.entries(paths)` 把它变成**一行一行的清单**，每行是 `[花名, 地址清单]` 一对——后面的工序才能「逐条处理」。

### 工序二：`filter` 只留自家花名

```ts
.filter(([pattern]) => pattern.startsWith("@earendil-works/"))
```

上一讲数过：32 条里只有 31 条以 `@earendil-works/` 开头。被筛掉的那条是 `"typebox": ["./node_modules/typebox"]`——它指向 `node_modules` 里的真包裹，**本来就不需要翻译官操心**（node 自己能找到）。`filter`（过滤器）的职责：只留下姓 `@earendil-works` 的自家花名。

### 工序三：`map` 逐条拆成卡片

`map`（映射）=「把清单里每一条，按同一套模具各做一个新东西」。这里的模具就是 `SourceAlias` 说明书，关键操作是**按 `*` 的位置把暗号劈成两半**：

```ts
const wildcard = pattern.indexOf("*");                 // 找 * 在第几个字符，没有就回 -1
if (wildcard !== -1 && pattern.indexOf("*", wildcard + 1) !== -1) {
	throw new Error(`…`);                                 // 一张卡出现两个 *：不会处理，宁可报错
}
prefix = wildcard === -1 ? pattern : pattern.slice(0, wildcard);   // * 之前的一半
suffix = wildcard === -1 ? "" : pattern.slice(wildcard + 1);       // * 之后的一半
```

以 `@earendil-works/pi-ai/*` 为例：

```text
@earendil-works/pi-ai/*
└── 前缀 prefix ──┘↑└ 后缀
                   *        （后缀是空串 ""）
```

`*` 是**通配符**（wildcard），意思是「这个位置可以是任意内容」。劈成前后两半之后，对暗号就简单了（第 12 讲细说）：开头的部分对得上、结尾的部分对得上，中间夹着的不管多长，都算这张卡匹配。

至于「两个 `*` 就报错」——又是一个 fail fast：作者明说「多张野牌的情况我不想支持」，与其悄悄算错，不如明说。

### 工序四：`sort` 长的卡片排前面

```ts
.sort((left, right) => right.pattern.length - left.pattern.length)
```

按暗号**长度从长到短**排队。为什么？因为**越长越具体，越具体越该优先**。花名册里既有 `@earendil-works/pi-ai/dist/*`（29 个字符），也有 `@earendil-works/pi-ai/*`（24 个字符）。假如有人报花名 `@earendil-works/pi-ai/dist/models`，**两张卡都接得住**——但显然该用更具体的 `dist/*` 那张。把长的排前面，遍历到它就先命中，天然实现「专家号优先，普通号兜底」。

---

## 🧪 动手跑

把这套加工流程原样抄进一个小脚本，对真花名册跑一遍（这个文件也已经帮你放在 labs 里了，可以直接 `node` 它；下面是从零创建的完整命令）：

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/r10-alias-cards

cat > /Users/admin/Desktop/pi-study/c-pi/labs/r10-alias-cards/build-cards.mjs <<'EOF'
// 把 tsconfig.json 的「花名册」加工成「翻译卡片」——和翻译官第 29–43 行同款逻辑
import { readFileSync } from "node:fs";

const tsconfig = JSON.parse(
	readFileSync("/Users/admin/Desktop/pi-study/pi/tsconfig.json", "utf8"),
);
const paths = tsconfig.compilerOptions.paths;

const cards = Object.entries(paths)
	.filter(([pattern]) => pattern.startsWith("@earendil-works/"))
	.map(([pattern, replacements]) => {
		const wildcard = pattern.indexOf("*");
		return {
			pattern,
			prefix: wildcard === -1 ? pattern : pattern.slice(0, wildcard),
			suffix: wildcard === -1 ? "" : pattern.slice(wildcard + 1),
			replacements,
		};
	})
	.sort((a, b) => b.pattern.length - a.pattern.length);

console.log("翻译卡片总数:", cards.length);

console.log("\n排最前面的 3 张（最长 = 最具体，优先试）:");
for (const c of cards.slice(0, 3)) {
	console.log(`  ${c.pattern}  （长度 ${c.pattern.length}）`);
}

console.log("\n带 * 的卡会被拆成「前缀 + 后缀」，以 @earendil-works/pi-ai/* 为例:");
const star = cards.find((c) => c.pattern === "@earendil-works/pi-ai/*");
console.log("  前缀 prefix:", JSON.stringify(star.prefix));
console.log("  后缀 suffix:", JSON.stringify(star.suffix));
console.log("  替换地址 replacements:", JSON.stringify(star.replacements));

console.log("\n不带 * 的卡（精确暗号），以 @earendil-works/pi-ai 为例:");
const exact = cards.find((c) => c.pattern === "@earendil-works/pi-ai");
console.log("  前缀 = 整张卡:", JSON.stringify(exact.prefix));
console.log("  后缀:", JSON.stringify(exact.suffix), "（空字符串）");
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/r10-alias-cards/build-cards.mjs
```

**预期输出**：

```text
翻译卡片总数: 31

排最前面的 3 张（最长 = 最具体，优先试）:
  @earendil-works/pi-codemode/declarations  （长度 40）
  @earendil-works/pi-codemode/cloudflare  （长度 38）
  @earendil-works/pi-coding-agent/hooks  （长度 37）

带 * 的卡会被拆成「前缀 + 后缀」，以 @earendil-works/pi-ai/* 为例:
  前缀 prefix: "@earendil-works/pi-ai/"
  后缀 suffix: "" 
  替换地址 replacements: ["./packages/ai/src/*.ts","./packages/ai/src/providers/*.ts"]

不带 * 的卡（精确暗号），以 @earendil-works/pi-ai 为例:
  前缀 = 整张卡: "@earendil-works/pi-ai"
  后缀: "" （空字符串）
```

对照着看：31 张卡、长的在前；`*` 卡被劈成「前缀 `@earendil-works/pi-ai/` + 空后缀」，还随身带着**两个**替换地址（先试哪个、后试哪个，第 12 讲见分晓）；不带 `*` 的精确卡，前缀就是整张卡。

---

## ✅ 小结

第 29–43 行是一条四工序生产线：`Object.entries` 摊平花名册 → `filter` 只留 `@earendil-works/` 自家花名（31/32）→ `map` 按 `*` 把暗号劈成前缀+后缀做成卡片（双 `*` 直接报错）→ `sort` 让更具体的长卡片排前面。加工完，翻译官兜里就有了一叠按优先级排好的翻译卡片，随时准备接客。

---

[← 上一讲](/r9-tsconfig-paths) · [下一讲 · registerHooks：给 import 设前台 →](/r11-register-hooks)
