# 第 16 讲 · APP_NAME 为什么是 "pi" 而不是 "π"

> **对应源码**：`pi/packages/coding-agent/src/config.ts:602-611`

---

## 一句话

`config.ts` 从 `package.json` 里读出名字、版本、配置目录，然后推导出几个全局常量。当前 `APP_NAME` 是 `"pi"`，`APP_TITLE` 才是 `"π"`，因为它们用途不同。

## 源码

```ts
const piConfigName: string | undefined = pkg.piConfig?.name;
export const PACKAGE_NAME: string = pkg.name || "@earendil-works/pi-coding-agent";
export const APP_NAME: string = piConfigName || "pi";
export const APP_TITLE: string = piConfigName ? APP_NAME : "π";
export const CONFIG_DIR_NAME: string = pkg.piConfig?.configDir || ".pi";
export const VERSION: string = pkg.version || "0.0.0";
```

## 当前 package.json

```json
{
	"name": "@earendil-works/pi-coding-agent",
	"version": "1.5.0",
	"piConfig": {
		"configDir": ".pi"
	}
}
```

## 推导过程

```ts
const piConfigName = pkg.piConfig?.name;
// piConfigName = undefined（因为 package.json 里没有 name）

const PACKAGE_NAME = pkg.name || "@earendil-works/pi-coding-agent";
// PACKAGE_NAME = "@earendil-works/pi-coding-agent"

const APP_NAME = piConfigName || "pi";
// APP_NAME = "pi"

const APP_TITLE = piConfigName ? APP_NAME : "π";
// APP_TITLE = "π"

const CONFIG_DIR_NAME = pkg.piConfig?.configDir || ".pi";
// CONFIG_DIR_NAME = ".pi"

const VERSION = pkg.version || "0.0.0";
// VERSION = "1.5.0"
```

## 三个名字的区别

| 常量 | 当前值 | 用途 |
|---|---|---|
| `PACKAGE_NAME` | `@earendil-works/pi-coding-agent` | npm 包名，自更新等场景用 |
| `APP_NAME` | `pi` | 进程名、环境变量前缀、命令行名字 |
| `APP_TITLE` | `π` | 界面显示用 |

所以 `APP_NAME` 是功能性的（给机器和脚本用），`APP_TITLE` 是展示性的（给人看）。

## 环境变量名也是推导出来的

```ts
export const ENV_AGENT_DIR = `${APP_NAME.toUpperCase()}_CODING_AGENT_DIR`;
export const ENV_SESSION_DIR = `${APP_NAME.toUpperCase()}_CODING_AGENT_SESSION_DIR`;
```

当前 `APP_NAME = "pi"`，所以：

```text
ENV_AGENT_DIR    = PI_CODING_AGENT_DIR
ENV_SESSION_DIR  = PI_CODING_AGENT_SESSION_DIR
```

如果 `piConfig.name` 改成 `"tau"`，环境变量名会自动变成 `TAU_CODING_AGENT_DIR`。

## 动手跑：看这些常量

```bash
cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a16/constants.mts <<'EOF'
import {
	PACKAGE_NAME,
	APP_NAME,
	APP_TITLE,
	CONFIG_DIR_NAME,
	VERSION,
	ENV_AGENT_DIR,
	ENV_SESSION_DIR,
} from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/config.ts";

console.log("PACKAGE_NAME:", PACKAGE_NAME);
console.log("APP_NAME:", APP_NAME);
console.log("APP_TITLE:", APP_TITLE);
console.log("CONFIG_DIR_NAME:", CONFIG_DIR_NAME);
console.log("VERSION:", VERSION);
console.log("ENV_AGENT_DIR:", ENV_AGENT_DIR);
console.log("ENV_SESSION_DIR:", ENV_SESSION_DIR);
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a16/constants.mts
```

**预期输出**：

```text
PACKAGE_NAME: @earendil-works/pi-coding-agent
APP_NAME: pi
APP_TITLE: π
CONFIG_DIR_NAME: .pi
VERSION: 1.5.0
ENV_AGENT_DIR: PI_CODING_AGENT_DIR
ENV_SESSION_DIR: PI_CODING_AGENT_SESSION_DIR
```

## 动手跑：模拟改名叫 tau

```bash
cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a16/tau.mjs <<'EOF'
// 用一个临时 package.json 模拟改名
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const tmpPkg = "/tmp/pi-tau-package.json";
writeFileSync(tmpPkg, JSON.stringify({
	name: "@earendil-works/tau-coding-agent",
	version: "9.9.9",
	piConfig: { name: "tau", configDir: ".tau" },
}));

// 手动推导（模拟 config.ts 的逻辑）
const pkg = JSON.parse(await (await import("node:fs")).promises.readFile(tmpPkg, "utf-8"));
const piConfigName = pkg.piConfig?.name;
const appName = piConfigName || "pi";
const envAgentDir = `${appName.toUpperCase()}_CODING_AGENT_DIR`;

console.log("如果 piConfig.name = 'tau':");
console.log("  APP_NAME:", appName);
console.log("  APP_TITLE:", piConfigName ? appName : "π");
console.log("  ENV_AGENT_DIR:", envAgentDir);

rmSync(tmpPkg);
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a16/tau.mjs
```

**预期输出**：

```text
如果 piConfig.name = 'tau':
  APP_NAME: tau
  APP_TITLE: tau
  ENV_AGENT_DIR: TAU_CODING_AGENT_DIR
```

## 小结

- `PACKAGE_NAME` 是 npm 包名；
- `APP_NAME` 是功能名（进程名、环境变量前缀）；
- `APP_TITLE` 是展示名；
- `VERSION` 是版本号；
- `CONFIG_DIR_NAME` 是用户配置目录名；
- 这些值都来自 `package.json`，方便统一品牌和版本管理。

## 下一章预告

`config.ts` 里的自更新逻辑：怎么识别安装方式、构造更新命令。

---

## 自测

1. `APP_NAME` 和 `APP_TITLE` 当前分别是什么？
2. 如果 `piConfig.name` 改成 `"tau"`，`APP_TITLE` 会变成什么？
3. `ENV_AGENT_DIR` 是怎么推导出来的？
4. `VERSION` 如果缺失会回退成什么？
