# 第 8 讲 · 翻译官登场：这个文件是干什么的（第 1–8 行）

📍 **位置**：`pi/packages/coding-agent/src/experimental/source-resolver.ts` 第 1–8 行

```ts
import { existsSync, readFileSync, statSync } from "node:fs";
import { registerHooks } from "node:module";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// Node strips TypeScript natively, but it does not apply the workspace source
// aliases from tsconfig.json. Internal source processes preload this resolver so
// they cannot silently fall through to stale package dist files.
```

> 🎬 **第二季开幕**：第 1–7 讲我们把 `pi-test.sh` 从头到脚读完了。但故事还留了一个人物没交代——第 6 讲里被 `--import` 抢先装进 node 的「翻译官」`source-resolver.ts`。从这一讲起，用同样的节奏，把这个 87 行的文件也逐块读懂。

---

## 🤔 它是干什么的？

### 先看问题：源码之间互相叫「花名」

打开 Pi 的任何一份源码，你会看到这样写代码（真实例子，`pi/packages/coding-agent/src/main.ts` 第 9 行）：

```ts
import { type ImageContent, modelsAreEqual } from "@earendil-works/pi-ai";
```

`@earendil-works/pi-ai` 是一个**包名**，相当于一个「花名」——好记、体面，但**不是一个真实的文件地址**。node 拿到花名，默认只会去 `node_modules/` 里找同名包裹，然后看包裹的 `package.json` 写的入口。而 `pi/packages/ai/package.json` 里写的是：

```json
"main": "./dist/index.js"
```

`dist/` 是**编译产物**的目录——相当于「提前做好、真空包装的蛋糕」。问题来了：

1. 我们从源码直接启动，**根本没烤过蛋糕**——`packages/ai/dist/` 这个目录不存在；
2. 就算以前烤过，源码改了而没重新编译，吃到的就是**过期蛋糕**。

可我们的目标明明是：让 Pi 直接用 `packages/ai/src/` 里的**新鲜源码**。

### 翻译官的本职工作

花名 → 源码真实地址 的对照表，其实**早就写好了**，就躺在仓库根目录的 `tsconfig.json` 里（一个 32 条目的「花名册」）。但那是 TypeScript 的规矩，**node 自己不读这个文件**。

于是 `source-resolver.ts` 这位翻译官登场了：它替 node 读花名册，然后**守在 import 的必经之路上**，每当有文件说「我要 import 某某花名」，它就上前翻译：「你要找的其实是 `packages/ai/src/index.ts`」。

文件开头这段注释（第 6–8 行）就是作者的亲笔说明：

> Node strips TypeScript natively, but it does not apply the workspace source aliases from tsconfig.json. Internal source processes preload this resolver so they cannot silently fall through to stale package dist files.
>
> （node 天生能直接运行 TypeScript，但它**不会**应用 tsconfig.json 里的源码别名。内部源码进程要预加载这个解析器，这样它们就**不可能神不知鬼不觉地滑到陈旧的 dist 编译产物**上去。）

### 第 1–4 行：开箱先亮工具

开头四行 `import` 是翻译官自带的四件工具，全部来自 node 内置仓库（`node:` 前缀 = 「node 自家产的，不用安装」）：

| 工具 | 来自 | 干什么用 | 在第几讲上场 |
|---|---|---|---|
| `existsSync`、`readFileSync`、`statSync` | `node:fs` | **摸文件**：读文件内容、看文件在不在 | 第 9、12 讲 |
| `registerHooks` | `node:module` | **装前台**：在 import 必经之路上设卡拦截 | 第 11 讲 |
| `extname`、`resolve`、`sep` | `node:path` | **拼地址**：拼接、拆解文件路径 | 第 9、12 讲 |
| `fileURLToPath`、`pathToFileURL` | `node:url` | **地址 ↔ 网址**互译——第 5 讲的老朋友 | 第 9、11 讲 |

注意 `pathToFileURL`：第 5 讲里脚本用它把翻译官的地址翻译成网址；翻译官自己也要用它给翻译好的文件「发通行证」。同一个函数，两处上岗。

---

## 🧪 动手跑

亲眼看看**有没有翻译官，差别有多大**。我们都用同一个花名 `@earendil-works/pi-ai` 做试验（`import(...)` 是「边跑边加载」的写法，适合在 `node -e` 里临时用）：

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/r8-probe
cd /Users/admin/Desktop/pi-study/pi

echo "─── 第 1 回合：不请翻译官 ───"
node -e 'import("@earendil-works/pi-ai").then(m=>console.log("居然成功了，导出数:",Object.keys(m).length)).catch(e=>console.log("加载失败:",e.code))'

echo "─── 第 2 回合：请来翻译官 ───"
RESOLVER_URL="$(node -p 'require("node:url").pathToFileURL(process.argv[1]).href' "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/experimental/source-resolver.ts")"
echo "翻译官网址: $RESOLVER_URL"
node --import "$RESOLVER_URL" -e 'import("@earendil-works/pi-ai").then(m=>console.log("加载成功，导出成员数:",Object.keys(m).length)).catch(e=>console.log("失败:",e.message))'
```

> 💡 第 2 回合的第一行眼熟吗？这就是 `pi-test.sh` 第 58 行（第 5 讲讲过）原样搬过来的——把翻译官地址转成网址。第二行的 `--import` 则是第 6 讲的「抢跑装载」。

**预期输出**：

```text
─── 第 1 回合：不请翻译官 ───
加载失败: ERR_MODULE_NOT_FOUND
─── 第 2 回合：请来翻译官 ───
翻译官网址: file:///Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/experimental/source-resolver.ts
加载成功，导出成员数: 66
```

- **第 1 回合**：node 拿着花名去 `node_modules/`，顺着 `package.json` 摸到 `dist/index.js`——不存在，只能报 `ERR_MODULE_NOT_FOUND`（模块没找到）。
- **第 2 回合**：翻译官提前上岗，同一个花名被翻译成 `packages/ai/src/index.ts`——源码加载成功，还顺便数出了这个包向外提供 66 个成员。

一个文件 87 行，就让「免编译、直接跑源码」这件事成立了。

---

## ✅ 小结

`source-resolver.ts` 是 **import 花名的「翻译官」**：源码文件之间用 `@earendil-works/xxx` 这种花名互相引用，而 node 只认真实地址、且不读 tsconfig.json 的对照表。翻译官替 node 读表、守在 import 路口做翻译，保证 Pi 永远加载新鲜源码、绝不偷偷用过期的编译产物。开头四行是它从 node 自带的四件工具：摸文件、装前台、拼地址、地址网址互译。

---

[← 上一讲（第一季毕业总结）](/r7-summary) · [下一讲 · 两张说明书与找花名册 →](/r9-tsconfig-paths)
