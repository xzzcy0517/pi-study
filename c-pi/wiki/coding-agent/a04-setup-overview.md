# 第 4 讲 · setupCli() 概览

> **对应源码**：`pi/packages/coding-agent/src/cli/setup.ts:1-13`

---

## 一句话

`setupCli()` 是 Pi 真正干活之前做的**五项准备工作**：设进程名、设环境变量、屏蔽警告、配置 HTTP。

## 源码全文

```ts
import { APP_NAME } from "../config.ts";
import { configureHttpDispatcher } from "../core/http-dispatcher.ts";

export function setupCli(): void {
	process.title = APP_NAME;
	process.env.PI_CODING_AGENT = "true";
	process.env.AI_AGENT = "pi";
	process.emitWarning = (() => {}) as typeof process.emitWarning;

	// Configure undici before provider SDKs issue requests. Settings are applied
	// once SettingsManager has loaded global/project configuration.
	configureHttpDispatcher();
}
```

## 先看函数签名

```ts
export function setupCli(): void {
```

- `export`：这个函数可以被别的文件 `import`；
- `function setupCli`：函数名字叫 `setupCli`；
- `()`：不需要传参数；
- `: void`：不返回任何值，只是“做事”。

## 五步准备一览

| 顺序 | 代码 | 做什么 | 下一讲 |
|---|---|---|---|
| 1 | `process.title = APP_NAME;` | 给当前进程起个名字 | 第 5 讲 |
| 2 | `process.env.PI_CODING_AGENT = "true";` | 标记“我在 Pi coding agent 里” | 第 6 讲 |
| 3 | `process.env.AI_AGENT = "pi";` | 标记“当前 AI agent 是 pi” | 第 6 讲 |
| 4 | `process.emitWarning = ...` | 把警告输出函数换成空函数 | 第 7 讲 |
| 5 | `configureHttpDispatcher();` | 配置全局 HTTP 请求规则 | 第 8 讲 |

## 两个导入

```ts
import { APP_NAME } from "../config.ts";
import { configureHttpDispatcher } from "../core/http-dispatcher.ts";
```

- `APP_NAME`：从 `config.ts` 来的常量，当前值是 `"pi"`；
- `configureHttpDispatcher`：从 `http-dispatcher.ts` 来的函数，负责配置 HTTP。

`../config.ts` 里的 `../` 表示“从 `cli/` 目录回到上一级 `src/` 目录”。

## 注释里的重要时序

```ts
// Configure undici before provider SDKs issue requests. Settings are applied
// once SettingsManager has loaded global/project configuration.
configureHttpDispatcher();
```

翻译成人话：

- 现在先装一个**默认**的 HTTP 配置；
- 等后面 `SettingsManager` 读完用户设置（全局配置、项目配置），可能会再按用户的设置重新配置一次。

所以这一步只是“先铺好底”，不是最终版。

## 动手跑：看看 setupCli 的五步效果

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a04

cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a04/setup-overview.mts <<'EOF'
import { setupCli } from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/cli/setup.ts";

console.log("调用前 process.title:", process.title);
console.log("调用前 env.PI_CODING_AGENT:", process.env.PI_CODING_AGENT);
console.log("调用前 env.AI_AGENT:", process.env.AI_AGENT);

setupCli();

console.log("调用后 process.title:", process.title);
console.log("调用后 env.PI_CODING_AGENT:", process.env.PI_CODING_AGENT);
console.log("调用后 env.AI_AGENT:", process.env.AI_AGENT);

// 触发一次警告，看看会不会显示
process.emitWarning("这条警告应该被屏蔽");
console.log("如果没看到上一句警告，说明屏蔽生效");
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a04/setup-overview.mts
```

**预期输出**：

```text
调用前 process.title: node
调用前 env.PI_CODING_AGENT: undefined
调用前 env.AI_AGENT: undefined
调用后 process.title: pi
调用后 env.PI_CODING_AGENT: true
调用后 env.AI_AGENT: pi
如果没看到上一句警告，说明屏蔽生效
```

## 小结

`setupCli()` 不处理用户参数，也不请求模型。它只是给当前进程**立规矩、贴标签、铺好网络通道**，让后面的 `main()` 能在一个干净、一致的环境里工作。

## 下一讲预告

第一步 `process.title = APP_NAME`：Pi 为什么要给自己改进程名？

---

## 自测

1. `setupCli()` 接收参数吗？返回什么？
2. 五步准备里，哪一步和 HTTP 有关？
3. `configureHttpDispatcher()` 是最终配置还是打底配置？
4. 导入 `config.ts` 时，会触发什么动作？
