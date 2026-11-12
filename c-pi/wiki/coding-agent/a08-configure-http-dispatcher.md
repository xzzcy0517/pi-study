# 第 8 讲 · 配置 HTTP 总管

> **对应源码**：`pi/packages/coding-agent/src/cli/setup.ts:10-12` 和 `pi/packages/coding-agent/src/core/http-dispatcher.ts:81-113`

---

## 一句话

`configureHttpDispatcher()` 给 Pi 之后的所有 HTTP 请求设定默认规则：怎么连、等多久、是否走代理。

## 源码

```ts
// setup.ts
configureHttpDispatcher();
```

这次调用没有传参数，所以使用默认的 5 分钟空闲超时。

## 为什么要配置 HTTP

Pi 需要和各种模型 Provider 的服务器通信（OpenAI、DeepSeek、Kimi 等）。这些通信底层都是 HTTP 请求。

不同的 Node 版本、不同的环境（有代理、没代理、HTTP/2 等），默认行为可能不一样。Pi 在启动时统一配置好，避免后面出现奇怪的问题。

## 用快递公司来比喻

| 概念 | 比喻 |
|---|---|
| HTTP 请求 | 寄快递 |
| dispatcher | 快递公司的调度中心 |
| `configureHttpDispatcher()` | 设定调度规则：多久算超时、是否走中转站（代理） |
| Provider SDK | 具体填快递单的部门 |

Pi 不替 SDK 决定“寄给谁、写什么内容”，只规定“怎么发车、等多久”。

## 默认配置了什么

```ts
new undici.EnvHttpProxyAgent({
	allowH2: false,
	proxyTunnel: true,
	bodyTimeout: 300_000,
	connect: {
		autoSelectFamilyAttemptTimeout: 2_000,
	},
	headersTimeout: 300_000,
	clientFactory: createUndiciClient,
	factory: createUndiciOriginDispatcher,
});
```

| 配置 | 通俗解释 |
|---|---|
| `EnvHttpProxyAgent` | 自动读取 `HTTP_PROXY`、`HTTPS_PROXY` 环境变量 |
| `allowH2: false` | 不用 HTTP/2 |
| `proxyTunnel: true` | 走代理时也用 CONNECT 隧道 |
| `bodyTimeout: 300000` | 响应体传输的空闲超时：5 分钟 |
| `headersTimeout: 300000` | 等待完整响应头的超时：5 分钟 |
| `autoSelectFamilyAttemptTimeout: 2000` | IPv4/IPv6 单次连接尝试等 2 秒 |
| 两个 factory | 统一创建带错误监听器的连接 |

## 重要：这不会立刻发请求

配置 dispatcher 不等于发网络请求。它只是把规则写好，等后面真正调用模型接口时才使用。

## 动手跑：看 dispatcher 被设置成什么

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a08

cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a08/dispatcher.mts <<'EOF'
import * as undici from "/Users/admin/Desktop/pi-study/pi/node_modules/undici/index.js";
import { configureHttpDispatcher } from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/core/http-dispatcher.ts";

console.log("配置前 dispatcher:", undici.getGlobalDispatcher().constructor.name);

configureHttpDispatcher();

console.log("配置后 dispatcher:", undici.getGlobalDispatcher().constructor.name);

// 用完关闭，避免进程挂起
await undici.getGlobalDispatcher().close();
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a08/dispatcher.mts
```

**预期输出**（配置前的名字可能因 Node 版本不同而显示为 `Agent` 或 `GlobalDispatcher`，重点是配置后变成 `EnvHttpProxyAgent`）：

```text
配置前 dispatcher: Agent
配置后 dispatcher: EnvHttpProxyAgent
```

## 动手跑：5 分钟到底是多少毫秒

```bash
cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a08/timeout.mjs <<'EOF'
const fiveMinutes = 300_000;
console.log("5 分钟 =", fiveMinutes, "毫秒");
console.log("换算成秒:", fiveMinutes / 1000, "秒");
console.log("换算成分钟:", fiveMinutes / 1000 / 60, "分钟");
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a08/timeout.mjs
```

**预期输出**：

```text
5 分钟 = 300000 毫秒
换算成秒: 300 秒
换算成分钟: 5 分钟
```

## 小结

- `configureHttpDispatcher()` 设置 Pi 的全局 HTTP 规则；
- 默认 5 分钟空闲超时；
- 自动识别 `HTTP_PROXY` / `HTTPS_PROXY` 环境变量；
- 只是“铺好底”，不是最终配置，后面 `SettingsManager` 还可能再调；
- 配置时不发任何网络请求。

## 下一章预告

进入 `http-dispatcher.ts` 内部，细学超时、代理、错误监听等规则。

---

## 自测

1. `configureHttpDispatcher()` 传参数了吗？默认值是多少？
2. 配置 dispatcher 会立刻发送网络请求吗？
3. `EnvHttpProxyAgent` 会读取哪些环境变量？
4. 5 分钟超时是指“整个请求必须在 5 分钟内完成”吗？
