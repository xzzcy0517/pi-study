# 第 7 讲 · 为什么屏蔽 process.emitWarning

> **对应源码**：`pi/packages/coding-agent/src/cli/setup.ts:8`

---

## 一句话

Pi 把 `process.emitWarning` 换成一个空函数，让后续代码调用这个方法时不会真的输出警告。

## 源码

```ts
process.emitWarning = (() => {}) as typeof process.emitWarning;
```

这行看起来很复杂，拆成三层就简单了：

```ts
() => {}                              // ① 一个什么都不做的函数
(() => {}) as typeof process.emitWarning // ② 告诉 TypeScript：把它当成 emitWarning 的类型
process.emitWarning = ...               // ③ 替换当前进程的方法
```

## process.emitWarning 本来做什么

Node 有一个内置方法 `process.emitWarning("某条警告")`，用来发出运行时警告。

比如：

```ts
process.emitWarning("这个 API 以后可能会变");
```

默认会在终端打印类似：

```text
(node:12345) Warning: 这个 API 以后可能会变
```

## 为什么要屏蔽

Pi 运行时会依赖很多第三方包。有些包可能会调用 `process.emitWarning` 发出警告，但这些警告对普通用户来说通常是噪音，没必要显示。

Pi 选择直接把这个方法替换成空函数，调用它就等于调用“什么都不做”。

## 动手跑：看 emitWarning 被替换前后的效果

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a07

cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a07/warning.mjs <<'EOF'
console.log("=== 替换前 ===");
process.emitWarning("这条会显示");

console.log("=== 替换后 ===");
process.emitWarning = () => {};
process.emitWarning("这条不会显示");

console.log("=== 结束 ===");
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a07/warning.mjs
```

**预期输出**（Node 的警告默认是异步发出的，顺序可能略有不同，但一定能看到替换前那条）：

```text
=== 替换前 ===
=== 替换后 ===
=== 结束 ===
(node:12345) Warning: 这条会显示
```

> 注意：Node 的 `process.emitWarning` 默认不是立即打印，而是等当前一小段代码执行完后再发。所以上面的输出里，警告可能出现在 `=== 结束 ===` 之后。这不影响结论：替换前的警告会显示，替换后的不会。

第二句警告消失了。

## 注意：不能撤回已经发出的警告

`setupCli()` 是在 `cli.ts` 的静态导入都完成后才执行的。如果某个依赖模块在**导入阶段**就调用了 `process.emitWarning`，那时候替换还没发生，警告仍然会显示。

所以这不是一个“时光机”，不能屏蔽已经发生过的事。

## 注意：这是对整个进程的修改

`process.emitWarning` 是全局的。Pi 替换它之后，当前进程里任何代码调用这个方法都会变成空操作。

而且源码里没有保存原来的函数，也没有提供恢复逻辑。也就是说，一旦替换，直到进程退出前都不会改回去。

## 动手跑：和 Pi 的写法一致

```bash
cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a07/pi-style.mts <<'EOF'
// 用 Pi 源码的同款写法
process.emitWarning = (() => {}) as typeof process.emitWarning;

process.emitWarning("这条应该被吞掉");
console.log("程序继续执行，没有看到警告");
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a07/pi-style.mts
```

**预期输出**：

```text
程序继续执行，没有看到警告
```

## 小结

- `process.emitWarning` 默认会输出警告；
- Pi 把它换成空函数，避免后续噪音警告打扰用户；
- 替换发生在导入完成后，所以导入阶段的警告不会被屏蔽；
- 这是全局修改，进程结束前不会恢复。

## 下一讲预告

最后一步 `configureHttpDispatcher()`：给 HTTP 请求立规矩。

---

## 自测

1. `process.emitWarning` 默认会做什么？
2. Pi 把它换成了什么？
3. 替换后能屏蔽导入阶段已经发出的警告吗？为什么？
4. 这个替换是只影响 `setupCli()` 内部，还是影响整个进程？
