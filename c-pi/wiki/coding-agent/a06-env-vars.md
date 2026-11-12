# 第 6 讲 · 两个环境变量

> **对应源码**：`pi/packages/coding-agent/src/cli/setup.ts:6-7`

---

## 一句话

`setupCli()` 往当前进程的环境里写入两个标记：`PI_CODING_AGENT` 和 `AI_AGENT`，供后续代码或被启动的子进程识别“我在 Pi 里”。

## 源码

```ts
process.env.PI_CODING_AGENT = "true";
process.env.AI_AGENT = "pi";
```

## 什么是环境变量

环境变量就是当前进程里的一本“小字典”，每个 key 对应一个字符串值。

在 Node 里，这本字典叫 `process.env`。你可以读、也可以写。

```ts
console.log(process.env.HOME);      // 读取
process.env.MY_FLAG = "yes";        // 写入
```

## 第一个变量：PI_CODING_AGENT

```ts
process.env.PI_CODING_AGENT = "true";
```

意思是：**当前进程正在运行 Pi 的 coding agent**。

后续代码或被 Pi 启动的子进程可以检查这个变量，判断自己是否处在 Pi 环境中。

### 注意值是字符串

环境变量的值永远是**字符串**，不是布尔值。

```ts
process.env.PI_CODING_AGENT === "true"; // ✅ true
process.env.PI_CODING_AGENT === true;   // ❌ false，右边是布尔值
```

## 第二个变量：AI_AGENT

```ts
process.env.AI_AGENT = "pi";
```

上一个变量是 Pi coding agent 的专属标记；这个变量则用更通用的名字声明当前 AI agent 是 `pi`。

如果以后有别的 agent 也遵循这个约定，它们可能会设成 `AI_AGENT = "claude"` 或 `"copilot"` 等。

## 动手跑：读写环境变量

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a06

cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a06/env.mjs <<'EOF'
console.log("改之前:");
console.log("  PI_CODING_AGENT:", process.env.PI_CODING_AGENT);
console.log("  AI_AGENT:", process.env.AI_AGENT);

process.env.PI_CODING_AGENT = "true";
process.env.AI_AGENT = "pi";

console.log("改之后:");
console.log("  PI_CODING_AGENT:", process.env.PI_CODING_AGENT);
console.log("  AI_AGENT:", process.env.AI_AGENT);
console.log("  类型:", typeof process.env.PI_CODING_AGENT);

if (process.env.AI_AGENT === "pi") {
	console.log("✅ 确认：当前是 Pi agent 环境");
}
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a06/env.mjs
```

**预期输出**：

```text
改之前:
  PI_CODING_AGENT: undefined
  AI_AGENT: undefined
改之后:
  PI_CODING_AGENT: true
  AI_AGENT: pi
  类型: string
✅ 确认：当前是 Pi agent 环境
```

## 动手跑：环境变量会传给子进程吗

```bash
cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a06/child.mjs <<'EOF'
process.env.PI_CODING_AGENT = "true";
process.env.AI_AGENT = "pi";

import { spawn } from "node:child_process";

const child = spawn(process.execPath, ["-e", "console.log('子进程看到 AI_AGENT:', process.env.AI_AGENT)"], {
	stdio: "inherit",
});
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a06/child.mjs
```

**预期输出**：

```text
子进程看到 AI_AGENT: pi
```

这说明：父进程设置的环境变量，默认会传给它的子进程。Pi 启动别的命令时，被启动的程序也能知道自己是在 Pi 环境里。

## 小结

| 变量 | 值 | 作用 |
|---|---|---|
| `PI_CODING_AGENT` | `"true"` | 标记当前在 Pi coding agent 中 |
| `AI_AGENT` | `"pi"` | 通用标记，声明当前 AI agent 身份 |

两个值都是字符串，判断时要用 `"true"` 和 `"pi"` 字符串比较，不要和布尔值比较。

## 下一讲预告

第 4 步：为什么 Pi 要把 `process.emitWarning` 换成一个空函数？

---

## 自测

1. `process.env` 是什么类型的数据？
2. `PI_CODING_AGENT` 的值是字符串 `"true"` 还是布尔值 `true`？
3. 环境变量会传给子进程吗？
4. 如果以后有另一个 agent 也写 `AI_AGENT`，它可能写成什么值？
