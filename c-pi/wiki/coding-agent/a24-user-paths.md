# 第 24 讲 · 用户配置路径 ~/.pi/agent

> **对应源码**：`pi/packages/coding-agent/src/config.ts:613-681`

---

## 一句话

Pi 把用户的设置、登录凭据、会话记录都放在一个配置目录里，默认是 `~/.pi/agent`。`config.ts` 提供一组函数，算出这个目录和它下面各个文件的路径。

## 配置目录的确定方式

```ts
export function getAgentDir(): string {
	const envDir = process.env[ENV_AGENT_DIR];
	if (envDir) {
		return expandTildePath(envDir);
	}
	return join(homedir(), CONFIG_DIR_NAME, "agent");
}
```

优先级：

1. 环境变量 `PI_CODING_AGENT_DIR`（名字由 `APP_NAME` 推导）；
2. 否则 `主目录/.pi/agent`。

当前 `APP_NAME = "pi"`、`CONFIG_DIR_NAME = ".pi"`，所以默认是：

```text
/Users/admin/.pi/agent
```

`expandTildePath()` 目前只是委托给 `normalizePath()`，负责展开开头的 `~`：

```ts
export function expandTildePath(path: string): string {
	return normalizePath(path);
}
```

## 目录下有什么

| 函数 | 子路径 | 用途 |
|---|---|---|
| `getCustomThemesDir()` | `themes/` | 用户自定义主题 |
| `getModelsPath()` | `models.json` | 自定义模型配置 |
| `getAuthPath()` | `auth.json` | 登录凭据 |
| `getSettingsPath()` | `settings.json` | 全局设置 |
| `getToolsDir()` | `tools/` | 自定义工具 |
| `getBinDir()` | `bin/` | fd、rg 等受管二进制 |
| `getPromptsDir()` | `prompts/` | 提示词模板 |
| `getSessionsDir()` | `sessions/` | 会话记录 |
| `getDebugLogPath()` | `pi-debug.log` | 调试日志 |

每个函数都很短，比如：

```ts
export function getSettingsPath(): string {
	return join(getAgentDir(), "settings.json");
}
```

它们都依赖 `getAgentDir()`，所以只要改了配置目录，下面所有路径会一起变。

## 只是算路径，不创建目录

这一点要反复强调：

```ts
getSessionsDir(); // 返回 .../sessions
```

它**不会**创建 `sessions` 目录。目录创建发生在真正需要写入的时候。

所以第一次运行 Pi 之前，`~/.pi/agent` 可能根本不存在。

## 分享地址

```ts
const DEFAULT_SHARE_VIEWER_URL = "https://pi.dev/session/";

export function getShareViewerUrl(gistId: string): string {
	const baseUrl = process.env.PI_SHARE_VIEWER_URL || DEFAULT_SHARE_VIEWER_URL;
	return `${baseUrl}#${gistId}`;
}
```

例子：

```ts
getShareViewerUrl("gist-123");
// "https://pi.dev/session/#gist-123"
```

- 只是拼 URL，不上传任何内容；
- 可用 `PI_SHARE_VIEWER_URL` 换基础地址；
- `||` 意味着环境变量为空字符串时也用默认值。

## 动手跑：看所有用户路径

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a24

cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a24/user-paths.mts <<'EOF'
import {
	getAgentDir,
	getCustomThemesDir,
	getModelsPath,
	getAuthPath,
	getSettingsPath,
	getToolsDir,
	getBinDir,
	getPromptsDir,
	getSessionsDir,
	getDebugLogPath,
	expandTildePath,
	getShareViewerUrl,
} from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/config.ts";

console.log("默认配置目录:", getAgentDir());

const items: [string, string][] = [
	["自定义主题", getCustomThemesDir()],
	["models.json", getModelsPath()],
	["auth.json", getAuthPath()],
	["settings.json", getSettingsPath()],
	["tools 目录", getToolsDir()],
	["bin 目录", getBinDir()],
	["prompts 目录", getPromptsDir()],
	["sessions 目录", getSessionsDir()],
	["调试日志", getDebugLogPath()],
];

for (const [name, path] of items) {
	console.log(" ", name.padEnd(14), path);
}

// ① 用环境变量覆盖，并支持 ~
process.env.PI_CODING_AGENT_DIR = "~/my-pi-agent";
console.log("\n① 设置 PI_CODING_AGENT_DIR=~/my-pi-agent:");
console.log("  getAgentDir():", getAgentDir());
console.log("  expandTildePath('~/x'):", expandTildePath("~/x"));

// ② 用绝对路径覆盖
process.env.PI_CODING_AGENT_DIR = "/tmp/pi-agent";
console.log("\n② 设置绝对路径 /tmp/pi-agent:");
console.log("  getAgentDir():", getAgentDir());
console.log("  settings:", getSettingsPath());

delete process.env.PI_CODING_AGENT_DIR;

// ③ 分享地址
console.log("\n③ 分享地址:");
console.log("  默认:", getShareViewerUrl("gist-123"));
process.env.PI_SHARE_VIEWER_URL = "https://example.com/session/";
console.log("  自定义:", getShareViewerUrl("gist-123"));
delete process.env.PI_SHARE_VIEWER_URL;
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a24/user-paths.mts
```

**预期输出**（`/Users/admin` 是你的主目录）：

```text
默认配置目录: /Users/admin/.pi/agent
  自定义主题          /Users/admin/.pi/agent/themes
  models.json    /Users/admin/.pi/agent/models.json
  auth.json      /Users/admin/.pi/agent/auth.json
  settings.json  /Users/admin/.pi/agent/settings.json
  tools 目录       /Users/admin/.pi/agent/tools
  bin 目录         /Users/admin/.pi/agent/bin
  prompts 目录     /Users/admin/.pi/agent/prompts
  sessions 目录    /Users/admin/.pi/agent/sessions
  调试日志           /Users/admin/.pi/agent/pi-debug.log

① 设置 PI_CODING_AGENT_DIR=~/my-pi-agent:
  getAgentDir(): /Users/admin/my-pi-agent
  expandTildePath('~/x'): /Users/admin/x

② 设置绝对路径 /tmp/pi-agent:
  getAgentDir(): /tmp/pi-agent
  settings: /tmp/pi-agent/settings.json

③ 分享地址:
  默认: https://pi.dev/session/#gist-123
  自定义: https://example.com/session/#gist-123
```

## 观察点

1. 默认目录是 `/Users/admin/.pi/agent`；
2. 设置 `~/my-pi-agent` 后，`~` 被自动展开成主目录；
3. 设置绝对路径后，所有派生路径跟着变；
4. 分享地址可以整段替换基础 URL。

## 小结

- 配置目录默认 `~/.pi/agent`，可用 `PI_CODING_AGENT_DIR` 覆盖；
- 设置、凭据、会话、主题、工具等都在它下面；
- 这些函数只算路径，不创建目录；
- `expandTildePath()` 负责展开 `~`；
- `getShareViewerUrl()` 只拼分享链接，不上传内容。

## 下一章预告

`config.ts` 读完了。下一章进入 `child-process.ts`：Pi 怎么启动一个子进程。

---

## 自测

1. 默认配置目录在哪？怎么覆盖？
2. `getSettingsPath()` 和 `getAuthPath()` 分别指向什么？
3. 调用 `getSessionsDir()` 会创建 `sessions` 目录吗？
4. `PI_SHARE_VIEWER_URL` 为空字符串时，`getShareViewerUrl()` 用哪个地址？
