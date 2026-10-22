# 第 13 讲 · 毕业总结：现场围观翻译官干活

学完前 5 讲，`source-resolver.ts` 的 87 行已经全部拆完。这一讲把它拼回整体，然后做一个全场最爽的实验：**给翻译官装上窃听器，围观它给真正的 Pi 打工**。

---

## 一句话答案

**`source-resolver.ts` 是 import 花名的「翻译官」**：它在主程序启动前被 `--import` 抢跑装入，从 `tsconfig.json` 读出「花名 → 源码地址」的花名册并加工成一叠按优先级排序的翻译卡片；之后进程里每一条 import 都被它设的前台拦截——对得上暗号的，指到 `packages/*/src/` 里的新鲜源码；对上了却找不到文件的，当场报错；不是自家花名的，交还 node 默认流程。

## 87 行拼回一张图

```text
文件一被 --import 加载（抢跑，第 6 讲）
  │
  ├─ 第 1–4 行    亮工具：摸文件 / 装前台 / 拼地址 / 地址↔网址     [第 8 讲]
  ├─ 第 10–21 行  两张 interface 说明书（运行时被撕掉的约定）      [第 9 讲]
  ├─ 第 23–27 行  从自身上爬 4 层找仓库根，读出 tsconfig 花名册    [第 9 讲]
  ├─ 第 29–43 行  花名册 → 31 张翻译卡片（筛自家花名、劈 *、排序）  [第 10 讲]
  └─ 第 45–62 行  registerHooks 设前台，等候每一条 import         [第 11 讲]
       │
       ▼  之后每次有人 import：
        对暗号（matchAlias，第 12 讲）
          → 找真文件（resolveSourcePath，第 12 讲）
            → 发 file:// 通行证，shortCircuit 收工
```

## 三个设计意图（都能在代码里找到出处）

1. **免编译跑源码**——和 `pi-test.sh` 的使命一脉相承：改完源码立刻生效，不用等构建；
2. **绝不偷偷用旧 dist**——文件头注释亲笔："cannot silently fall through to stale package dist files"，靠 `shortCircuit` + 「对上了却找不到就 `throw`」两道保险实现；
3. **有问题立刻喊停**——花名册缺 `paths` 报错（第 9 讲）、一张卡两个 `*` 报错（第 10 讲）、花名对上了文件却不在报错（第 11 讲）。三次 fail fast，绝不带病上岗。

---

## 🧪 动手跑：给翻译官装窃听器

真翻译官全程沉默（怕干扰主程序）。我们复制一个**间谍版**，在它每完成一笔翻译时偷偷记一行日志，然后用它启动真正的 Pi：

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/r13-spy
cd /Users/admin/Desktop/pi-study/c-pi/labs/r13-spy

# ① 把真翻译官复制过来（改后缀为 .mts，node 照样认）
cp /Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/experimental/source-resolver.ts resolver-spy.mts

# ② 间谍搬了家，「上爬 4 层找仓库根」会算错地方——改成写死的地址
perl -pi -e 's|const repositoryRoot = .*|const repositoryRoot = "/Users/admin/Desktop/pi-study/pi/";|' resolver-spy.mts

# ③ 在「翻译成功、发通行证」那一行植入窃听器（console.error 走错误通道，不污染正常输出）
perl -pi -e 's|if \(resolved\) return .*|if (resolved) { console.error("[翻译] " + specifier + "  →  " + resolved.replace("/Users/admin/Desktop/pi-study/pi/", "pi/")); return { url: pathToFileURL(resolved).href, shortCircuit: true }; }|' resolver-spy.mts

# ④ 检查两处手术是否成功（应看到第 23 行和第 54 行变成了新内容）
grep -n "repositoryRoot = \|console.error" resolver-spy.mts
```

**预期输出**（第 ④ 步）：

```text
23:const repositoryRoot = "/Users/admin/Desktop/pi-study/pi/";
54:				if (resolved) { console.error("[翻译] " + specifier + "  →  " + resolved.replace("/Users/admin/Desktop/pi-study/pi/", "pi/")); return { url: pathToFileURL(resolved).href, shortCircuit: true }; }
```

现在点火——用间谍翻译官启动真正的 Pi，让它打印版本号；间谍日志引到文件里慢慢看：

```bash
node --import /Users/admin/Desktop/pi-study/c-pi/labs/r13-spy/resolver-spy.mts /Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/cli.ts --version 2> spy.log

echo "─── 间谍日志前 12 行 ───"
head -12 spy.log
echo "─── 总共翻译次数 ───"
wc -l < spy.log
```

**预期输出**：

```text
1.2.0
─── 间谍日志前 12 行 ───
[翻译] @earendil-works/pi-ai  →  pi/packages/ai/src/index.ts
[翻译] @earendil-works/pi-tui  →  pi/packages/tui/src/index.ts
[翻译] @earendil-works/pi-ai/utils/retry  →  pi/packages/ai/src/utils/retry.ts
[翻译] @earendil-works/pi-ai  →  pi/packages/ai/src/index.ts
[翻译] @earendil-works/pi-ai  →  pi/packages/ai/src/index.ts
[翻译] @earendil-works/pi-ai/providers/all  →  pi/packages/ai/src/providers/all.ts
[翻译] @earendil-works/pi-ai/providers/openrouter  →  pi/packages/ai/src/providers/openrouter.ts
[翻译] @earendil-works/pi-ai/utils/model-operations  →  pi/packages/ai/src/utils/model-operations.ts
[翻译] @earendil-works/pi-ai/providers/compat-schema  →  pi/packages/ai/src/providers/compat-schema.ts
[翻译] @earendil-works/pi-ai/providers/model-schema  →  pi/packages/ai/src/providers/model-schema.ts
[翻译] @earendil-works/pi-ai  →  pi/packages/ai/src/index.ts
[翻译] @earendil-works/pi-ai/compat  →  pi/packages/ai/src/compat.ts
─── 总共翻译次数 ───
     113
```

> 💡 `2> spy.log` 是「把错误通道的内容引到文件里」——第 11 讲说过窃听器走 `console.error`，所以屏幕上只剩 Pi 自己打印的 `1.2.0`，113 行翻译记录全进了 `spy.log`。这就是「两条通道各走各的」的好处。

对着日志回味前 5 讲的知识，每一条都能对上号：

- **第 1、2 行**：`@earendil-works/pi-ai`、`@earendil-works/pi-tui` 都是**精确卡**（无 `*`），一字不差对上，直接指到各自的 `src/index.ts`；
- **第 3、6 行**：`pi-ai/utils/retry`、`pi-ai/providers/all` 走的是**带 `*` 的卡** `@earendil-works/pi-ai/*`，`*` 分别捕到 `utils/retry` 和 `providers/all`，填进替换地址 `./packages/ai/src/*.ts`；
- **`pi-ai` 反复出现**：每个文件 import 它一次，前台就办公一次——翻译官不厌其烦；
- **仅仅打印一个版本号就翻译了 113 笔**：Pi 启动时要拉起多少源码文件，一目了然。

---

## 🎓 毕业自测（能答上 = 真正读懂了这个文件）

1. 用一句话说 `source-resolver.ts` 是干什么的；没有它，`import "@earendil-works/pi-ai"` 会发生什么？
2. 它怎么找到仓库根目录的？为什么要用这种方式，而不是写死一个地址？
3. 翻译卡片是按什么规则排序的？为什么要这样排？
4. 前台的 `resolve` 函数里，`shortCircuit: true` 和 `nextResolve(...)` 分别是什么态度？
5. 「对上了暗号但文件没找到」和「完全没对上暗号」，翻译官的处理有何不同？为什么这样设计？
6. `resolveSourcePath` 看到地址后缀是 `.js` 时会多做什么尝试？为什么？

全部答上，这个文件就毕业了——连同第 1–7 讲的 `pi-test.sh`，**整条启动链**（脚本 → 翻译官 → `cli.ts`）你已经全部打通。🎉

接下来想继续深挖：

- 读源码时撞到不认识的 JS/TS 符号（`?.`、`??=`、`=>`、`as`……）→ **语法扫盲站** `c-pi/wiki/js-ts/`（`npm run dev:js-ts`），那两个文件用到的每个语法点都讲了一遍；
- node 点火之后 Pi 又做了什么 → 主线文档《执行 ./pi-test.sh 之后，发生了什么》（`c-pi/docs/02-run-to-ui.md`）。

---

[← 上一讲](/r12-helpers) · [回第一季毕业总结](/r7-summary)
