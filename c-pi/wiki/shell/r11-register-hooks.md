# 第 11 讲 · registerHooks：给 import 设一个前台（第 45–62 行）

📍 **位置**：`pi/packages/coding-agent/src/experimental/source-resolver.ts` 第 45–62 行

```ts
registerHooks({
	resolve(specifier, context, nextResolve) {
		let matchedPattern: string | undefined;
		for (const alias of aliases) {
			const wildcard = matchAlias(alias, specifier);
			if (wildcard === undefined) continue;
			matchedPattern ??= alias.pattern;
			for (const replacement of alias.replacements) {
				const resolved = resolveSourcePath(replacement.replace("*", wildcard));
				if (resolved) return { url: pathToFileURL(resolved).href, shortCircuit: true };
			}
		}
		if (matchedPattern) {
			throw new Error(`Source runtime could not resolve ${specifier} through tsconfig path ${matchedPattern}`);
		}
		return nextResolve(specifier, context);
	},
});
```

---

## 🤔 它是干什么的？

这是整个文件的**心脏**：前面准备的花名册、翻译卡片，全都是为了这一刻——**在 import 的必经之路上设一个前台，现场办公**。

### `registerHooks`：node 官方的「安插前台」机制

`registerHooks` 来自 `node:module`，作用是：往 node 的模块加载流程里**挂一个自定义函数**。挂上之后，**这个进程里发生的每一次 import（或 require），都要先拿到这里问一遍**，再由你决定怎么办。

回忆第 6 讲：翻译官是用 `--import` **抢跑**加载的。为什么必须抢跑？因为前台必须在第一个顾客（第一条 import）进门**之前**就坐好——晚一步，就有花名漏过去了。

### 前台的工作流程（`resolve` 函数）

`resolve` 收到三样东西：

| 参数 | 是什么 | 打个比方 |
|---|---|---|
| `specifier` | 顾客报的名字（import 后面那串原文） | 「我找 `@earendil-works/pi-ai`」 |
| `context` | 补充信息（谁发起的等） | 登记表上的备注栏 |
| `nextResolve` | node 的**默认流程** | 「我管不了，转给总台按老规矩办」的转诊单 |

然后按这个剧本走（对照代码行号读）：

```text
① 掏出那叠翻译卡片，从最具体的一张开始，逐张「对暗号」（matchAlias，第 12 讲）
      │
      ├─ 对不上 → 换下一张卡（continue）
      │
      └─ 对上了 → 记住是哪张卡（matchedPattern ??= …，??= 表示「只在第一次记住」）
            │
            └─ 拿这张卡的地址清单，逐个把 * 换成捕到的内容，去磁盘上找真文件
                  │
                  ├─ 找到了 → 发通行证：{ url: 文件的网址, shortCircuit: true }，收工！
                  └─ 没找到 → 试清单里的下一个地址；都试完 → 继续换下一张卡

② 一圈下来：有卡对上了暗号、但文件一个都没找到
      → 当场报错「Source runtime could not resolve …」（绝不糊弄）

③ 一圈下来：没有任何卡对得上（人家报的就不是自家花名）
      → nextResolve 转诊：交回 node 默认流程（内置模块、真 npm 包都走这条路）
```

两个细节值得记住：

- **`shortCircuit: true`** =「到此为止，短路掉后续所有流程」。node 收到这个回答，就不会再去 `node_modules/` 碰运气——这正是「绝不偷偷用旧 dist」的技术保证。
- **对上了却找不到文件 → 直接 `throw`**。这是本讲最重要的一条设计：假如你 import 的花名在花名册里、源码文件却不在（比如你改名后忘了同步），翻译官**大声报错**，而不是闷声滑到 `node_modules` 的旧编译产物上——文件头注释里 "cannot silently fall through to stale package dist files" 说的就是这个兜底。

---

## 🧪 动手跑

我们造一个**迷你前台**，亲自体验「冒名顶替」的快感：编一个根本不存在的假花名 `@fake/greeter`，让前台把它指到本地一个真文件。

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/r11-hooks
cd /Users/admin/Desktop/pi-study/c-pi/labs/r11-hooks

# 前台（迷你版翻译官）
cat > hook.mjs <<'EOF'
import { registerHooks } from "node:module";
import { pathToFileURL } from "node:url";

registerHooks({
	resolve(specifier, context, nextResolve) {
		if (specifier === "@fake/greeter") {
			console.error("[前台] 截到一笔:", specifier);
			return {
				url: pathToFileURL(
					"/Users/admin/Desktop/pi-study/c-pi/labs/r11-hooks/greeter.mjs",
				).href,
				shortCircuit: true,
			};
		}
		console.error("[前台] 不认识", JSON.stringify(specifier), "，交给 node 默认流程");
		return nextResolve(specifier, context);
	},
});
EOF

# 主程序：import 一个根本不存在的假花名
cat > main.mjs <<'EOF'
import { hello } from "@fake/greeter";

console.log(hello("小明"));
EOF

# 真正干活的文件
cat > greeter.mjs <<'EOF'
export function hello(name) {
	return `你好，${name}！这句话来自被“冒名顶替”的 greeter.mjs`;
}
EOF

node --import ./hook.mjs ./main.mjs 2>&1
```

**预期输出**：

```text
[前台] 不认识 "file:///Users/admin/Desktop/pi-study/c-pi/labs/r11-hooks/main.mjs" ，交给 node 默认流程
[前台] 截到一笔: @fake/greeter
你好，小明！这句话来自被“冒名顶替”的 greeter.mjs
```

三行输出，每一行都有戏：

1. **第一行**：连「主程序自己在哪」这笔加载都先过了前台——前台不认识（不是假花名），`nextResolve` 转诊放行。可见 `registerHooks` 拦截的是**进程里的一切加载**，无一漏网。
2. **第二行**：`main.mjs` 里的 `import "@fake/greeter"` 被前台截住，对上了暗号。
3. **第三行**：node 实际加载的是 `greeter.mjs`——假花名顺利「冒名顶替」，主程序对此毫无察觉。

> 💡 实验里前台的嘀咕用的是 `console.error`（打印到「错误通道」）而不是 `console.log`：日志和正常输出各走各的道，互不污染。真翻译官全程一言不发，就是怕干扰主程序——第 13 讲我们给它装窃听器时还会用到这个技巧。

真翻译官和我们的迷你前台**结构一模一样**，只是前台查的从「一张手写卡」换成了「31 张从 tsconfig 读出来的卡」，找文件的动作也交给了专职帮手——下一讲就拆这两个帮手。

---

## ✅ 小结

第 45–62 行用 node 官方的 `registerHooks` 在 import 必经之路上设了一个前台：每条 import 先进来对暗号，对上翻译卡片就去磁盘找真源码文件，找到就发 `file://` 通行证并 `shortCircuit` 收工；对上了却找不到文件就**大声报错**（绝不偷偷用旧 dist）；不是自家花名则 `nextResolve` 交还 node 默认流程。

---

[← 上一讲](/r10-alias-cards) · [下一讲 · 两个帮手：对暗号与找真文件 →](/r12-helpers)
