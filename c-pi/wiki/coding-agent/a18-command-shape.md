# 第 18 讲 · 构造自更新命令

> **对应源码**：`pi/packages/coding-agent/src/config.ts:35-77`、`121-196`

---

## 一句话

Pi 把更新命令拆成三部分保存：`command`（程序名）、`args`（参数数组）、`display`（给人看的完整命令）。这样执行时不用再解析一段字符串。

## 三部分的数据结构

```ts
interface SelfUpdateCommandStep {
	command: string;
	args: string[];
	display: string;
}

export interface SelfUpdateCommand extends SelfUpdateCommandStep {
	steps?: SelfUpdateCommandStep[];
}
```

| 字段 | 例子 | 用途 |
|---|---|---|
| `command` | `"npm"` | 真正要执行的程序 |
| `args` | `["install", "-g", "pkg"]` | 真正要传的参数 |
| `display` | `"npm install -g pkg"` | 显示给用户看 |
| `steps` | 卸载 + 安装两步 | 换包名时使用 |

### 为什么不直接存一整段字符串

如果只存 `"npm install -g pkg"`，执行时就得把它重新拆开。而路径里一旦有空格，拆分就会出错：

```text
npm --prefix /tmp/pi prefix install -g
```

这到底是“prefix 是 `/tmp/pi`，后面还有两个参数”，还是“prefix 是 `/tmp/pi prefix`”？

把 `args` 存成数组就不存在这个问题：

```ts
["--prefix", "/tmp/pi prefix", "install", "-g"]
```

每个元素边界清楚，不需要再猜。

## 生成一步命令

```ts
function makeSelfUpdateCommandStep(command: string, args: string[]): SelfUpdateCommandStep {
	return {
		command,
		args,
		display: [command, ...args].map((arg) => (/\s/.test(arg) ? `"${arg}"` : arg)).join(" "),
	};
}
```

- `[command, ...args]`：把程序名和参数合成一个数组；
- `/\s/.test(arg)`：这个参数里有没有空白字符；
- 有空白就加双引号；
- 最后用空格连起来，得到给人看的 `display`。

注意：**引号只加在 `display` 里，`args` 本身不变**。

## 生成多步命令

```ts
function makeSelfUpdateCommand(
	installStep: SelfUpdateCommandStep,
	uninstallStep?: SelfUpdateCommandStep,
): SelfUpdateCommand {
	if (!uninstallStep) return installStep;
	return {
		...installStep,
		display: `${uninstallStep.display} && ${installStep.display}`,
		steps: [uninstallStep, installStep],
	};
}
```

两种情况：

1. 包名没变：一步安装就够；
2. 包名变了（比如从 `@old-scope/pi` 改成 `@new-scope/pi`）：先卸载旧包，再装新包。

`&&` 在展示文本里表示“前一步成功才做下一步”；`steps` 则把两步分开存好，执行时可以逐项处理。

## 各包管理器的命令差异

| 方式 | 安装命令核心 | 包名变化时 |
|---|---|---|
| `bun-binary` | 不生成 | 去 Releases 下载 |
| `pnpm` | `pnpm install -g --ignore-scripts --config.minimumReleaseAge=0 <目标>` | 先 `pnpm remove -g <旧包>` |
| `yarn` | `yarn global add --ignore-scripts <目标>` | 先 `yarn global remove <旧包>` |
| `bun` | `bun install -g --ignore-scripts --minimum-release-age=0 <目标>` | 先 `bun uninstall -g <旧包>` |
| `npm` | `npm install -g --ignore-scripts --min-release-age=0 <目标>` | 先 `npm uninstall -g <旧包>` |
| `unknown` | 不生成 | 无 |

几个共同参数：

- `-g`：全局安装；
- `--ignore-scripts`：不自动执行依赖的生命周期脚本；
- release age 设为 `0`：避免“刚发布的新版本被包管理器的最小发布时长规则挡住”。

## 动手跑：观察命令长什么样

这两个构造函数没有 `export`，正常代码不能直接 `import`。所以下面的演练场**照抄源码逻辑**，只为观察输出。

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a18

cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a18/command-shape.mts <<'EOF'
// 演练场：照抄 config.ts 内部的两个函数，只为观察“命令长什么样”。
// 这两个函数没有 export，正常代码不能直接 import，所以这里复制一份。

interface Step {
	command: string;
	args: string[];
	display: string;
}

interface Command extends Step {
	steps?: Step[];
}

function makeStep(command: string, args: string[]): Step {
	return {
		command,
		args,
		display: [command, ...args].map((arg) => (/\s/.test(arg) ? `"${arg}"` : arg)).join(" "),
	};
}

function makeCommand(installStep: Step, uninstallStep?: Step): Command {
	if (!uninstallStep) return installStep;
	return {
		...installStep,
		display: `${uninstallStep.display} && ${installStep.display}`,
		steps: [uninstallStep, installStep],
	};
}

// ① 普通安装：只有一步
console.log("① 普通安装:");
console.log(makeStep("npm", ["install", "-g", "@earendil-works/pi-coding-agent"]));

// ② 参数里带空格：display 会自动加引号
console.log("\n② 路径带空格:");
console.log(makeStep("npm", ["--prefix", "/tmp/pi prefix", "install", "-g"]));

// ③ 换包名：先卸载再安装，两步
console.log("\n③ 改名安装:");
const uninstall = makeStep("npm", ["uninstall", "-g", "@old-scope/pi"]);
const install = makeStep("npm", ["install", "-g", "@new-scope/pi"]);
const rename = makeCommand(install, uninstall);
console.log("display:", rename.display);
console.log("steps:", rename.steps?.map((step) => step.display));
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a18/command-shape.mts
```

**预期输出**：

```text
① 普通安装:
{
  command: 'npm',
  args: [ 'install', '-g', '@earendil-works/pi-coding-agent' ],
  display: 'npm install -g @earendil-works/pi-coding-agent'
}

② 路径带空格:
{
  command: 'npm',
  args: [ '--prefix', '/tmp/pi prefix', 'install', '-g' ],
  display: 'npm --prefix "/tmp/pi prefix" install -g'
}

③ 改名安装:
display: npm uninstall -g @old-scope/pi && npm install -g @new-scope/pi
steps: [ 'npm uninstall -g @old-scope/pi', 'npm install -g @new-scope/pi' ]
```

观察 ②：`display` 里出现了双引号，但 `args` 里的 `/tmp/pi prefix` 没有引号。这说明引号只是展示用的装饰。

## 重要：这里只拼字符串，不执行

读到 `npm install -g ...` 不要误会——这些代码只是把命令对象准备好，**不会在导入或启动时安装任何东西**。真正执行更新的时机在后面的更新流程里。

## 小结

- 命令拆成 `command` / `args` / `display`；
- `args` 是数组，路径带空格也不会拆错；
- `display` 只是展示，带空白的参数会加引号；
- 包名变化时生成“先卸载、再安装”的两步；
- 构造命令 ≠ 执行命令。

## 下一讲预告

命令能构造出来了，但 Pi 还要过三道安全门才敢真的执行。

---

## 自测

1. `command`、`args`、`display` 分别有什么用？
2. 为什么参数要存成数组，而不是一整段字符串？
3. `display` 里的双引号会被放进 `args` 吗？
4. 什么情况下会生成两步命令？
