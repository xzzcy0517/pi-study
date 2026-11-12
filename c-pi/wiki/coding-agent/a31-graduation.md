# 第 31 讲 · 毕业总结：setupCli() 到底做了什么

> **对应源码**：`pi/packages/coding-agent/src/cli.ts` 及其 `setupCli()` 分支的全部项目内依赖。

---

## 一句话

`setupCli()` 不做业务、不请求模型、不启动子进程。它只是在 `main()` 开始工作之前，把当前进程的名字、环境标记、警告输出和 HTTP 通道准备好。

## 一、完整地图

```text
cli.ts                         入口：导入 → setupCli() → main()
├── cli/setup.ts               环境准备：五步
│   ├── config.ts              配置中心：名字、版本、路径、自更新
│   │   ├── utils/child-process.ts   子进程工具
│   │   ├── utils/paths.ts           路径工具
│   │   │   └── utils/child-process.ts（共享）
│   │   └── utils/text.ts            BOM 处理
│   └── core/http-dispatcher.ts      HTTP 通道配置
└── main.ts                    主舞台（下一阶段再学）
```

另外，`config.ts` 在导入时会读取：

```text
packages/coding-agent/package.json
```

## 二、真实时间线

这是整个系列最重要的一张图：

```text
① 建立模块图，执行静态依赖的顶层代码
   ├── config.ts 顶层：
   │     找到包根 → 读 package.json → 去 BOM → JSON.parse
   │     算出 PACKAGE_NAME / APP_NAME / APP_TITLE / VERSION 等常量
   ├── http-dispatcher.ts 顶层：
   │     记录 globalThis.fetch 快照，初始化常量
   ├── child-process.ts 顶层：
   │     只定义函数和 100ms 常量，不启动任何进程
   ├── paths.ts 顶层：
   │     只编译 Unicode 空格正则
   └── text.ts 顶层：
         只定义两个函数

② 回到 cli.ts，调用 setupCli()
   ├── process.title = "pi"
   ├── process.env.PI_CODING_AGENT = "true"
   ├── process.env.AI_AGENT = "pi"
   ├── process.emitWarning = 空函数
   └── configureHttpDispatcher() → 设置全局 dispatcher（不发请求）

③ 回到 cli.ts，调用 main(process.argv.slice(2))
```

## 三、五步准备复盘

| 步骤 | 代码 | 实际效果 |
|---|---|---|
| 1 | `process.title = APP_NAME` | 进程名变成 `pi` |
| 2 | `process.env.PI_CODING_AGENT = "true"` | 写入字符串标记 |
| 3 | `process.env.AI_AGENT = "pi"` | 写入通用 agent 标记 |
| 4 | `process.emitWarning = 空函数` | 后续警告不再显示 |
| 5 | `configureHttpDispatcher()` | 默认 5 分钟空闲超时、代理感知、错误兜底 |

## 四、它没有做什么

| 容易以为做了 | 实际 |
|---|---|
| 读取用户设置 | 没有。`SettingsManager` 在 `main()` 之后才加载 |
| 检查登录/API Key | 没有 |
| 请求模型接口 | 没有。只是配置请求通道 |
| 扫描/恢复会话 | 没有 |
| 启动子进程 | 没有。`child-process.ts` 只是被导入 |
| 创建 `~/.pi/agent` 目录 | 没有。路径函数只算字符串 |
| 执行自更新 | 没有。只定义了命令构造和检查函数 |
| 标记云同步忽略 | 没有。`setupCli()` 不调用它 |

## 五、十个最容易记错的点

1. **“第一行可执行代码是 `setupCli()`”** —— 对，但程序最早的动作是执行静态依赖的顶层代码。
2. **“用到时才加载 `config.ts`”** —— 不对。`import` 在 `setupCli()` 之前就执行完了。
3. **“`APP_NAME` 是 `π`”** —— 不对。`APP_NAME` 是 `pi`，`π` 是 `APP_TITLE`。
4. **“屏蔽警告能撤回已经发出的警告”** —— 不能。替换只对之后的调用生效。
5. **“配置 dispatcher 会发请求”** —— 不会。它只设置规则。
6. **“识别出 npm 就会自动更新”** —— 不会。还要过归属和可写两道门。
7. **“`getUpdateInstruction()` 代表 Pi 会自己执行”** —— 不代表。它只是给用户的提示文本。
8. **“`waitForChildProcess()` 的 100ms 是总上限”** —— 不是。是“连续安静 100ms”，持续有数据可以更久。
9. **“`normalizePath()` 会把相对路径变绝对”** —— 不会。那是 `resolvePath()` 的工作。
10. **“资源路径函数会创建目录”** —— 不会。它们只拼字符串。

## 六、实验地图

| 章 | 实验目录 | 你会看到什么 |
|---|---|---|
| 第 0 章 | `a01` | import 先执行、函数调用后执行 |
| 第 1 章 | `a02`、`a03` | shebang、参数切片 |
| 第 2 章 | `a04`–`a08` | setupCli 五步的实际效果 |
| 第 3 章 | `a09`–`a12` | 超时解析、代理、错误监听、连接工厂 |
| 第 4 章 | `a13`–`a16` | 运行形态、包根、package.json、常量 |
| 第 5 章 | `a17`–`a20` | 安装方式、更新命令、三道门、自定义命令 |
| 第 6 章 | `a21`–`a24` | 资源路径、Wasm/worker、安装变化、用户路径 |
| 第 7 章 | `a25`、`a26` | 子进程启动与等待 |
| 第 8 章 | `a27`–`a30` | 路径比较/规范化、小工具、BOM |
| 第 9 章 | `a31` | 结业自检 |

## 七、结业实验：一次跑完关键结论

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a31

cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a31/graduation-check.mts <<'EOF'
import assert from "node:assert";
import {
	APP_NAME,
	APP_TITLE,
	PACKAGE_NAME,
	VERSION,
} from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/config.ts";
import { setupCli } from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/cli/setup.ts";
import { parseHttpIdleTimeoutMs } from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/core/http-dispatcher.ts";
import {
	isPathWithin,
	normalizePath,
	pathsEqual,
} from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/utils/paths.ts";
import { splitBom } from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/utils/text.ts";

const checks: [string, () => void][] = [
	["包名是 @earendil-works/pi-coding-agent", () => assert.strictEqual(PACKAGE_NAME, "@earendil-works/pi-coding-agent")],
	["APP_NAME 是 pi", () => assert.strictEqual(APP_NAME, "pi")],
	["APP_TITLE 是 π", () => assert.strictEqual(APP_TITLE, "π")],
	["VERSION 非空", () => assert.ok(VERSION.length > 0)],
	["300000 毫秒合法", () => assert.strictEqual(parseHttpIdleTimeoutMs(300_000), 300_000)],
	["disabled 解析为 0", () => assert.strictEqual(parseHttpIdleTimeoutMs("disabled"), 0)],
	["空字符串解析为 undefined", () => assert.strictEqual(parseHttpIdleTimeoutMs(""), undefined)],
	["兄弟目录不算包含", () => assert.strictEqual(isPathWithin("/home/me", "/home/me2"), false)],
	[".. 会被折叠", () => assert.ok(pathsEqual("/a/b/../c", "/a/c"))],
	["~ 会展开", () => assert.strictEqual(normalizePath("~/x", { homeDir: "/home/me" }), "/home/me/x")],
	["BOM 码点是 feff", () => assert.strictEqual(splitBom("\uFEFFhi").bom.codePointAt(0), 0xfeff)],
];

setupCli();

checks.push(
	["setupCli 后进程名是 pi", () => assert.strictEqual(process.title, APP_NAME)],
	["PI_CODING_AGENT 是字符串 true", () => assert.strictEqual(process.env.PI_CODING_AGENT, "true")],
	["AI_AGENT 是 pi", () => assert.strictEqual(process.env.AI_AGENT, "pi")],
);

let passed = 0;
for (const [name, check] of checks) {
	try {
		check();
		console.log("✅", name);
		passed++;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.log("❌", name, "—", message);
	}
}

console.log(`\n${passed}/${checks.length} 项通过`);
process.exitCode = passed === checks.length ? 0 : 1;
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a31/graduation-check.mts
```

**预期输出**：

```text
✅ 包名是 @earendil-works/pi-coding-agent
✅ APP_NAME 是 pi
✅ APP_TITLE 是 π
✅ VERSION 非空
✅ 300000 毫秒合法
✅ disabled 解析为 0
✅ 空字符串解析为 undefined
✅ 兄弟目录不算包含
✅ .. 会被折叠
✅ ~ 会展开
✅ BOM 码点是 feff
✅ setupCli 后进程名是 pi
✅ PI_CODING_AGENT 是字符串 true
✅ AI_AGENT 是 pi

14/14 项通过
```

如果有一项 `❌`，说明你运行的环境或源码版本和教程不同，先回去看对应那一讲。

## 八、毕业自测（12 题）

1. `cli.ts` 一共几行？`setupCli()` 和 `main()` 谁先执行？
2. 为什么 `config.ts` 的顶层代码比 `setupCli()` 先跑？
3. `PACKAGE_NAME`、`APP_NAME`、`APP_TITLE` 当前分别是什么？
4. `setupCli()` 的五步准备分别是什么？
5. 为什么替换 `process.emitWarning` 不能屏蔽导入阶段发出的警告？
6. `configureHttpDispatcher()` 默认超时是多少？它会发请求吗？
7. `parseHttpIdleTimeoutMs(0)` 和 `parseHttpIdleTimeoutMs("nope")` 有什么区别？
8. 为什么 `detectInstallMethod()` 识别出 npm 后，仍不一定自动更新？
9. `waitForChildProcess()` 的 100ms 规则到底是什么？持续输出会怎样？
10. `normalizePath()` 和 `resolvePath()` 的分工是什么？
11. `stripBom()` 会去掉几个 BOM？
12. 用一句话概括：`setupCli()` 到底做了什么？

参考答案都在前 30 讲里；最后一题的关键词：**进程名、环境标记、警告屏蔽、HTTP 通道，仅此而已**。

## 九、接下来学什么

`setupCli()` 分支到此毕业。下一步回到入口最后一行：

```ts
main(process.argv.slice(2));
```

进入 `main.ts` 后，建议继续用同样的方法：

1. 先看主流程的骨架（参数解析 → 认证 → 会话 → runtime → 按模式分发）；
2. 再对每个被调用的项目内文件递归展开；
3. 始终区分“导入时执行”和“调用时执行”；
4. 每学一个模块，配一个能单独运行的小实验。

`main.ts` 会第一次真正接触模型、会话、工具和界面——那才是 Pi 的“主舞台”。但有了前面这 31 讲打底，你已经熟悉了它的地基：配置怎么来、路径怎么算、进程怎么起、HTTP 怎么发。

---

## 全系列目录

<details>
<summary>展开查看前 31 讲完整列表（本讲为第 31 讲）</summary>

- [第 0 讲 · 这七章代码是什么关系](/a00-what-we-read)
- [第 1 讲 · 导入时执行 vs 调用时执行](/a01-import-vs-call)
- [第 2 讲 · cli.ts 只有 6 行](/a02-cli-6-lines)
- [第 3 讲 · process.argv.slice(2) 是什么意思](/a03-argv-slice)
- [第 4 讲 · setupCli() 概览](/a04-setup-overview)
- [第 5 讲 · process.title 与 APP_NAME](/a05-process-title)
- [第 6 讲 · 两个环境变量](/a06-env-vars)
- [第 7 讲 · 为什么屏蔽 process.emitWarning](/a07-emit-warning)
- [第 8 讲 · 配置 HTTP 总管](/a08-configure-http-dispatcher)
- [第 9 讲 · 5 分钟空闲超时](/a09-idle-timeout)
- [第 10 讲 · HTTP_PROXY 与代理](/a10-proxy-settings)
- [第 11 讲 · 错误监听器](/a11-error-listener)
- [第 12 讲 · Client、Pool 与全局 dispatcher](/a12-client-pool-global)
- [第 13 讲 · 判断运行形态](/a13-runtime-detection)
- [第 14 讲 · 找到包根目录](/a14-find-package-dir)
- [第 15 讲 · 读取 package.json](/a15-read-package-json)
- [第 16 讲 · APP_NAME 为什么是 "pi"](/a16-constants)
- [第 17 讲 · 识别安装方式](/a17-install-method)
- [第 18 讲 · 构造自更新命令](/a18-command-shape)
- [第 19 讲 · 三道安全门](/a19-three-gates)
- [第 20 讲 · 用户自定义更新命令](/a20-custom-update-command)
- [第 21 讲 · 内置资源路径](/a21-resource-paths)
- [第 22 讲 · QuickJS Wasm 与 worker](/a22-special-resources)
- [第 23 讲 · 安装被换掉了怎么办](/a23-install-change)
- [第 24 讲 · 用户配置路径 ~/.pi/agent](/a24-user-paths)
- [第 25 讲 · 启动子进程](/a25-spawn-process)
- [第 26 讲 · 等待子进程结束](/a26-wait-child-process)
- [第 27 讲 · 路径比较](/a27-path-comparison)
- [第 28 讲 · 规范化与解析](/a28-normalize-resolve)
- [第 29 讲 · 来源判断、指纹、云同步](/a29-path-misc)
- [第 30 讲 · 去掉 JSON 开头的 BOM](/a30-text-bom)

</details>
