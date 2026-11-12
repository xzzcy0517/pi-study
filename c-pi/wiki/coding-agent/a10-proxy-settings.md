# 第 10 讲 · HTTP_PROXY 与代理

> **对应源码**：`pi/packages/coding-agent/src/core/http-dispatcher.ts:45-50`

---

## 一句话

Pi 提供一个函数 `applyHttpProxySettings()`，把用户配置的代理地址写到 `HTTP_PROXY` 和 `HTTPS_PROXY` 环境变量里，但**不会覆盖已经存在的值**。

## 什么是代理

打个比方：你想给国外的朋友寄信，但邮局规定必须走指定的中转站。这个中转站就是**代理服务器**。

在计算机网络里：

- 你的电脑 = 发信人
- 目标服务器（比如 DeepSeek API）= 收信人
- 代理服务器 = 中转站

很多公司内网或个人科学上网工具都会设置代理。程序需要知道代理地址，才能把请求先发到代理，再由代理转发出去。

## 代理地址长什么样

```text
http://127.0.0.1:7890
```

- `http://`：协议
- `127.0.0.1`：代理服务器地址（这里是本机）
- `7890`：端口号

## 源码

```ts
export function applyHttpProxySettings(httpProxy: string | undefined): void {
	const proxy = httpProxy?.trim();
	if (!proxy) return;
	process.env.HTTP_PROXY ??= proxy;
	process.env.HTTPS_PROXY ??= proxy;
}
```

三步行事：

1. 去掉首尾空白；
2. 如果结果是空的，直接返回，什么都不做；
3. 用 `??=` 写入 `HTTP_PROXY` 和 `HTTPS_PROXY`，但**只在它们还没值时才写**。

## `??=` 是什么意思

`??=` 叫“空值合并赋值”。

```ts
process.env.HTTP_PROXY ??= proxy;
```

等价于：

```ts
if (process.env.HTTP_PROXY === undefined || process.env.HTTP_PROXY === null) {
	process.env.HTTP_PROXY = proxy;
}
```

也就是说：**已有的环境变量优先，不会被覆盖**。

## 动手跑：代理设置实验

```bash
cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a10/proxy.mts <<'EOF'
import { applyHttpProxySettings } from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/core/http-dispatcher.ts";

// 先把环境变量清空（仅用于实验）
delete process.env.HTTP_PROXY;
delete process.env.HTTPS_PROXY;

console.log("初始状态:");
console.log("  HTTP_PROXY:", process.env.HTTP_PROXY);
console.log("  HTTPS_PROXY:", process.env.HTTPS_PROXY);

applyHttpProxySettings("  http://127.0.0.1:7890  ");

console.log("\n设置后:");
console.log("  HTTP_PROXY:", process.env.HTTP_PROXY);
console.log("  HTTPS_PROXY:", process.env.HTTPS_PROXY);

// 模拟环境变量已存在的情况
process.env.HTTP_PROXY = "http://already-set:8080";
applyHttpProxySettings("http://new-proxy:9999");

console.log("\nHTTP_PROXY 已存在时再次设置:");
console.log("  HTTP_PROXY:", process.env.HTTP_PROXY, "（应保留旧值）");

// 模拟空值或纯空白
applyHttpProxySettings("   ");
console.log("\n传入空白后:");
console.log("  HTTP_PROXY:", process.env.HTTP_PROXY, "（应不变）");
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a10/proxy.mts
```

**预期输出**：

```text
初始状态:
  HTTP_PROXY: undefined
  HTTPS_PROXY: undefined

设置后:
  HTTP_PROXY: http://127.0.0.1:7890
  HTTPS_PROXY: http://127.0.0.1:7890

HTTP_PROXY 已存在时再次设置:
  HTTP_PROXY: http://already-set:8080 （应保留旧值）

传入空白后:
  HTTP_PROXY: http://already-set:8080 （应不变）
```

## 注意：这一步 setupCli() 没调用它

在 `setupCli()` 的当前调用里：

```ts
configureHttpDispatcher();
```

这个函数内部**没有**调用 `applyHttpProxySettings()`。代理环境变量是在后面 `SettingsManager` 读取用户配置时才应用的。

所以 `applyHttpProxySettings()` 是工具箱里的函数，不是启动主路径。

## 小结

- `applyHttpProxySettings()` 把代理地址写入 `HTTP_PROXY` / `HTTPS_PROXY`；
- 已有环境变量优先，不会被覆盖；
- 空白字符串会被忽略；
- 本次 `setupCli()` 没有调用它，它由后续设置流程使用。

## 下一讲预告

给 dispatcher 加一个空错误监听器：为什么连“什么都不做”的函数也有用？

---

## 自测

1. `applyHttpProxySettings()` 会覆盖已有的 `HTTP_PROXY` 吗？
2. 如果传入 `"   "`（纯空白），函数会做什么？
3. `??=` 在什么情况下才赋值？
4. `setupCli()` 当前有没有调用 `applyHttpProxySettings()`？
