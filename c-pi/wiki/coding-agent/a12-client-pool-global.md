# 第 12 讲 · Client、Pool 与全局 dispatcher

> **对应源码**：`pi/packages/coding-agent/src/core/http-dispatcher.ts:64-113`

---

## 一句话

Pi 创建 HTTP 连接时，根据配置决定用单个 `Client` 还是连接池 `Pool`，最后把整个 dispatcher 设为全局，让后续请求都走这套规则。

## 两种连接对象

Undici 提供两种主要对象：

| 对象 | 比喻 | 什么时候用 |
|---|---|---|
| `Client` | 一条专线 | 只需要一个连接时 |
| `Pool` | 一个车队 | 需要多个连接并行时 |

## 创建 Client

```ts
function createUndiciClient(origin: string | URL, options: object): undici.Dispatcher {
	return withUndiciErrorListener(new undici.Client(origin, options as undici.Client.Options));
}
```

- `origin`：目标服务器的基础地址，例如 `https://api.example.com`；
- `options`：连接选项；
- 创建后立刻加空 error 监听器。

## 创建 Pool

```ts
function createUndiciOriginDispatcher(origin: string | URL, options: object): undici.Dispatcher {
	const dispatcherOptions = options as undici.Pool.Options;
	if (dispatcherOptions.connections === 1) {
		return createUndiciClient(origin, dispatcherOptions);
	}
	return withUndiciErrorListener(
		new undici.Pool(origin, {
			...dispatcherOptions,
			factory: createUndiciClient,
		}),
	);
}
```

逻辑：

1. 如果配置只允许 1 个连接，直接用 `Client`；
2. 否则用 `Pool`，并让 Pool 通过 `createUndiciClient` 创建具体连接。

这样每条具体连接都会带上错误监听器。

## 主函数 configureHttpDispatcher

```ts
export function configureHttpDispatcher(timeoutMs: number = DEFAULT_HTTP_IDLE_TIMEOUT_MS): void {
	const normalizedTimeoutMs = parseHttpIdleTimeoutMs(timeoutMs);
	if (normalizedTimeoutMs === undefined) {
		throw new Error(`Invalid HTTP idle timeout: ${String(timeoutMs)}`);
	}

	const dispatcher = withUndiciErrorListener(
		new undici.EnvHttpProxyAgent({
			allowH2: false,
			proxyTunnel: true,
			bodyTimeout: normalizedTimeoutMs,
			connect: {
				autoSelectFamilyAttemptTimeout: DEFAULT_AUTO_SELECT_FAMILY_ATTEMPT_TIMEOUT_MS,
			},
			headersTimeout: normalizedTimeoutMs,
			clientFactory: createUndiciClient,
			factory: createUndiciOriginDispatcher,
		}),
	);

	undici.setGlobalDispatcher(dispatcher);

	// 必要时安装同源的 fetch 全局对象
	const shouldInstallGlobals =
		installedGlobalFetch === undefined
			? globalThis.fetch === originalGlobalFetch
			: globalThis.fetch === installedGlobalFetch;
	if (shouldInstallGlobals) {
		undici.install?.();
		installedGlobalFetch = globalThis.fetch;
	}
}
```

分四步：

1. **解析超时**：把输入规范化成整数毫秒，无效则抛错；
2. **创建代理 dispatcher**：用 `EnvHttpProxyAgent` 包装，自动读代理环境变量；
3. **设为全局**：`undici.setGlobalDispatcher(dispatcher)`；
4. **同步 fetch**：如果当前全局 `fetch` 还是本模块加载时的那个（或上次安装的），就调用 `undici.install()`，避免 Node 自带 fetch 和 npm undici 版本不一致导致的问题。

## 动手跑：看 Client 和 Pool 的创建逻辑

```bash
cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a12/dispatcher.mts <<'EOF'
import * as undici from "/Users/admin/Desktop/pi-study/pi/node_modules/undici/index.js";
import { configureHttpDispatcher } from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/core/http-dispatcher.ts";

console.log("设置前 dispatcher:", undici.getGlobalDispatcher().constructor.name);

configureHttpDispatcher();

console.log("设置后 dispatcher:", undici.getGlobalDispatcher().constructor.name);

// 清理，避免进程挂起
await undici.getGlobalDispatcher().close();
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a12/dispatcher.mts
```

**预期输出**：

```text
设置前 dispatcher: Agent
设置后 dispatcher: EnvHttpProxyAgent
```

## 动手跑：无效超时会抛错

```bash
cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a12/invalid.mts <<'EOF'
import * as undici from "/Users/admin/Desktop/pi-study/pi/node_modules/undici/index.js";
import { configureHttpDispatcher } from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/core/http-dispatcher.ts";

try {
	configureHttpDispatcher("不是数字");
} catch (err) {
	console.log("捕获到错误:", (err as Error).message);
}

// 确认全局 dispatcher 没变
console.log("dispatcher 仍是:", undici.getGlobalDispatcher().constructor.name);
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a12/invalid.mts
```

**预期输出**：

```text
捕获到错误: Invalid HTTP idle timeout: 不是数字
dispatcher 仍是: Agent
```

## 小结

- `Client` 是单连接，`Pool` 是多连接；
- 根据 `connections` 配置自动选择；
- 最终通过 `setGlobalDispatcher()` 让后续请求都走这套规则；
- 还会同步全局 `fetch`，避免 Node 自带实现和 npm undici 不匹配。

## 下一章预告

进入 `config.ts`：Pi 怎么知道自己是谁、在哪、版本多少。

---

## 自测

1. `Client` 和 `Pool` 分别适合什么场景？
2. `configureHttpDispatcher()` 里，如果超时解析失败会做什么？
3. 为什么要调用 `setGlobalDispatcher()`？
4. `undici.install()` 在什么情况下会执行？
