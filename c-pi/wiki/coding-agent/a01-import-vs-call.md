# 第 1 讲 · 导入时执行 vs 调用时执行

> **对应源码**：`pi/packages/coding-agent/src/cli.ts` 前两行；ES 模块加载规则。

---

## 一句话

在 Node 的 ES 模块里，**`import` 语句会在任何函数调用之前执行**。所以 `config.ts` 的顶层代码比 `setupCli()` 更早跑。

## 看入口文件

```ts
#!/usr/bin/env node
import { setupCli } from "./cli/setup.ts";
import { main } from "./main.ts";

setupCli();
main(process.argv.slice(2));
```

第一眼会觉得：

```text
第 5 行 setupCli() 先执行 → 第 6 行 main() 再执行
```

这没错，但**不是完整的故事**。

## 完整顺序

Node 执行一个 ES 模块文件时，会分两步：

```text
第一步：加载并执行所有静态 import 的模块
  → config.ts 被加载，它的顶层代码开始跑
  → http-dispatcher.ts 被加载，它的顶层常量开始算
  → child-process.ts、paths.ts、text.ts 被加载

第二步：回到 cli.ts，按顺序执行函数调用
  → setupCli()
  → main(...)
```

所以真正的时间线是：

```text
import { setupCli } from "./cli/setup.ts";
  ↓ 触发 cli/setup.ts 加载
    ↓ 触发 config.ts 加载
      ↓ config.ts 顶层代码：读取 package.json，算出 APP_NAME
    ↓ 触发 http-dispatcher.ts 加载
      ↓ 顶层代码：保存 globalThis.fetch 快照
  ↓ setup.ts 模块准备好
import { main } from "./main.ts";
  ↓ main.ts 及其依赖加载……

setupCli();   ← 现在才真正开始
main(...);
```

## 动手跑：验证 import 先执行

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a01

cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a01/order.mjs <<'EOF'
// 这个文件专门验证：导入先执行，函数调用后执行

console.log("① 开始执行 a.js 的顶层代码");

import { foo } from "./b.mjs";

console.log("④ 回到 a.js，准备调用 foo()");
foo();
console.log("⑥ a.js 结束");
EOF

cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a01/b.mjs <<'EOF'
console.log("② b.mjs 被加载，顶层代码开始执行");

export function foo() {
	console.log("⑤ foo() 被调用了");
}

console.log("③ b.mjs 顶层代码执行完毕");
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a01/order.mjs
```

**预期输出**：

```text
① 开始执行 a.js 的顶层代码
② b.mjs 被加载，顶层代码开始执行
③ b.mjs 顶层代码执行完毕
④ 回到 a.js，准备调用 foo()
⑤ foo() 被调用了
⑥ a.js 结束
```

注意：虽然 `import` 写在 `console.log("①...")` 后面，但 `②` 和 `③` 却出现在 `④` 之前。这就是 ES 模块的“先加载依赖”规则。

## 对 Pi 有什么影响

这意味着：

- `setupCli()` 设置 `process.title = APP_NAME` 时，`APP_NAME` 已经从 `package.json` 算好了；
- `setupCli()` 替换 `process.emitWarning` 时，**导入阶段已经发出的 warning 不会被它屏蔽**。

## 常见误解

❌ 错误理解：

```text
cli.ts 第一行可执行代码是 setupCli()，所以整个程序从 setupCli() 开始。
```

✅ 正确理解：

```text
cli.ts 第一个被调用的函数是 setupCli()，但程序最早的动作是加载并执行静态依赖模块。
```

## 下一讲预告

现在知道时序了，开始逐行读 `cli.ts` 本身。

---

## 自测

1. `import` 和函数调用，哪个先执行？
2. 为什么 `config.ts` 读取 `package.json` 发生在 `setupCli()` 之前？
3. `setupCli()` 替换的 `process.emitWarning` 能屏蔽导入阶段已经发出的警告吗？
4. 在刚才的实验里，如果把 `import` 移到文件最开头，输出顺序会改变吗？
