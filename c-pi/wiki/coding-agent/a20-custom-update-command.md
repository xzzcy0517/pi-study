# 第 20 讲 · 用户自定义更新命令

> **对应源码**：`pi/packages/coding-agent/src/config.ts:337-361`

---

## 一句话

如果你用 Nix、mise 或公司内部 wrapper 管理 Pi，Pi 可能识别不出来。这时可以用环境变量 `PI_SELF_UPDATE_COMMAND` 或设置项 `selfUpdateCommand` 告诉它该跑什么命令。

## 为什么需要自定义

自动识别只认 npm、pnpm、yarn、bun 这几种常见安装方式。但现实里还有：

- Nix / Guix 的包管理；
- mise、asdf 这类版本管理器；
- 公司内部的安装脚本；
- 自己写的 wrapper。

这些情况 Pi 猜不出来。与其瞎猜，不如让用户直接给一条命令。

## 优先级

```ts
export function getConfiguredSelfUpdateArgv(setting: string[] | undefined): string[] | undefined {
	const fromEnv = process.env.PI_SELF_UPDATE_COMMAND?.trim().split(/\s+/).filter(Boolean);
	if (fromEnv?.length) return fromEnv;
	return setting?.length ? setting : undefined;
}
```

顺序是：

```text
环境变量 PI_SELF_UPDATE_COMMAND
  ↓ 没有就用
设置项 selfUpdateCommand
  ↓ 都没有就
undefined（表示没配置）
```

环境变量适合临时覆盖，设置项适合长期保存。

## 按空白拆分，不支持引号

```ts
process.env.PI_SELF_UPDATE_COMMAND?.trim().split(/\s+/).filter(Boolean)
```

这行做了三件事：

1. `trim()`：去掉首尾空白；
2. `split(/\s+/)`：按一个或多个空白字符切开；
3. `filter(Boolean)`：去掉空字符串。

关键限制：**它不认识引号**。

假设你写：

```text
wrapper "install my-pkg"
```

它会被切成：

```ts
["wrapper", '"install', 'my-pkg"']
```

引号变成了普通字符，参数边界也错了。所以自定义命令里的参数不能含空格。

## 填占位符

```ts
export function makeConfiguredSelfUpdateCommand(
	argv: string[],
	release: { packageName: string; version: string },
): SelfUpdateCommand {
	const values: Record<string, string> = {
		packageName: release.packageName,
		version: release.version,
		installSpec: `${release.packageName}@${release.version}`,
	};
	const [command = "", ...args] = argv.map((arg) =>
		arg.replace(/\{(packageName|version|installSpec)\}/g, (_, name: string) => values[name]),
	);
	return makeSelfUpdateCommandStep(command, args);
}
```

支持三个占位符：

| 占位符 | 会被替换成 |
|---|---|
| `{packageName}` | 包名，例如 `@earendil-works/pi-coding-agent` |
| `{version}` | 版本号，例如 `1.2.3` |
| `{installSpec}` | 包名加版本，例如 `@earendil-works/pi-coding-agent@1.2.3` |

替换发生在**每一个参数**上，不只是最后一个。

不认识的占位符（比如 `{unknown}`）不会被匹配，原样保留。

## 动手跑：自定义命令实验

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a20

cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a20/custom-command.mts <<'EOF'
import {
	getConfiguredSelfUpdateArgv,
	makeConfiguredSelfUpdateCommand,
} from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/config.ts";

const release = {
	packageName: "@earendil-works/pi-coding-agent",
	version: "1.2.3",
};

// ① 环境变量和设置都没有
delete process.env.PI_SELF_UPDATE_COMMAND;
console.log("① 都没有:", getConfiguredSelfUpdateArgv(undefined));

// ② 只有设置项
console.log("② 只有设置项:", getConfiguredSelfUpdateArgv(["mise", "upgrade", "{installSpec}"]));

// ③ 环境变量优先，并按空白拆分
process.env.PI_SELF_UPDATE_COMMAND = "  nub   upgrade {installSpec} ";
console.log("③ 环境变量:", getConfiguredSelfUpdateArgv(["mise", "upgrade"]));

// ④ 填占位符
const argv = getConfiguredSelfUpdateArgv(undefined);
console.log("④ 填好的命令:", makeConfiguredSelfUpdateCommand(argv, release));

// ⑤ 未知占位符原样保留
console.log("\n⑤ 未知占位符:");
console.log(makeConfiguredSelfUpdateCommand(["wrapper", "install", "{installSpec}", "{unknown}"], release));

// ⑥ 引号不支持：引号会被当成普通字符
process.env.PI_SELF_UPDATE_COMMAND = 'wrapper "install my-pkg"';
console.log("\n⑥ 带引号的环境变量:");
console.log(getConfiguredSelfUpdateArgv(undefined));
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a20/custom-command.mts
```

**预期输出**：

```text
① 都没有: undefined
② 只有设置项: [ 'mise', 'upgrade', '{installSpec}' ]
③ 环境变量: [ 'nub', 'upgrade', '{installSpec}' ]
④ 填好的命令: {
  command: 'nub',
  args: [ 'upgrade', '@earendil-works/pi-coding-agent@1.2.3' ],
  display: 'nub upgrade @earendil-works/pi-coding-agent@1.2.3'
}

⑤ 未知占位符:
{
  command: 'wrapper',
  args: [ 'install', '@earendil-works/pi-coding-agent@1.2.3', '{unknown}' ],
  display: 'wrapper install @earendil-works/pi-coding-agent@1.2.3 {unknown}'
}

⑥ 带引号的环境变量:
[ 'wrapper', '"install', 'my-pkg"' ]
```

三个观察点：

1. ③ 里环境变量覆盖了设置项，说明环境变量优先；
2. ④ 里 `{installSpec}` 被替换成完整的“包名@版本”；
3. ⑥ 里引号被拆散，说明自定义命令不支持带空格的参数。

## 和自动识别的关系

`getConfiguredSelfUpdateArgv()` 只是把“用户配置的命令”读出来。它不检查三道门——用户显式配置的命令，代表用户自己知道该怎么更新，Pi 不需要再判断是不是 npm 全局安装。

可以把它理解成：

```text
自动识别：Pi 猜你该怎么更新，猜对了也要过安全门
用户配置：你直接告诉 Pi 怎么更新
```

## 小结

- 环境变量 `PI_SELF_UPDATE_COMMAND` 优先于设置项 `selfUpdateCommand`；
- 命令按空白拆分，不支持引号；
- 支持 `{packageName}`、`{version}`、`{installSpec}` 三个占位符；
- 未知占位符原样保留；
- 适合 Nix、mise、wrapper 等自动识别覆盖不到的场景。

## 下一章预告

`config.ts` 还剩资源路径和用户配置路径两部分，下一讲先看内置资源路径。

---

## 自测

1. 环境变量和设置项，哪个优先？
2. `PI_SELF_UPDATE_COMMAND` 支持带空格的参数吗？
3. `{installSpec}` 会被替换成什么？
4. 未知占位符 `{unknown}` 会怎样？
