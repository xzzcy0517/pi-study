# 第 2 讲 · cli.ts 只有 6 行

> **对应源码**：`pi/packages/coding-agent/src/cli.ts:1-6`

---

## 一句话

`cli.ts` 是整个 Pi 程序的**入口大门**，只有 6 行：先导入帮手，再做环境准备，最后把参数交给主流程。

## 源码全文

```ts
#!/usr/bin/env node
import { setupCli } from "./cli/setup.ts";
import { main } from "./main.ts";

setupCli();
main(process.argv.slice(2));
```

## 第 1 行：Shebang

```ts
#!/usr/bin/env node
```

这是给操作系统看的“使用说明”。

如果构建后的 `cli.js` 文件有执行权限，并且你直接用 `./cli.js` 运行它，操作系统会读取第一行，然后通过 `/usr/bin/env` 找到 `node`，再用 `node` 执行这个文件。

在我们现在的学习流程里，`pi-test.sh` 已经显式写了 `node ...` 来启动，所以这一行主要是为发布后的可执行文件准备的。

### 动手验证 shebang

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a02

cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a02/hello <<'EOF'
#!/usr/bin/env node
console.log("shebang 让系统找到 node 来执行我");
EOF

chmod +x /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a02/hello

/Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a02/hello
```

**预期输出**：

```text
shebang 让系统找到 node 来执行我
```

## 第 2～3 行：静态导入

```ts
import { setupCli } from "./cli/setup.ts";
import { main } from "./main.ts";
```

这两行做两件事：

1. 告诉 Node：我要用 `setup.ts` 里的 `setupCli` 函数，以及 `main.ts` 里的 `main` 函数；
2. 触发模块加载：Node 会立刻去加载这两个文件及其依赖。

上一讲已经验证：`import` 会先执行，等所有依赖模块的顶层代码都跑完了，才回到 `cli.ts` 执行后面的函数调用。

## 第 5 行：环境准备

```ts
setupCli();
```

调用环境准备函数。它会做我们后面 4 讲要学的 5 件事：

1. 设置进程名；
2. 设置 `PI_CODING_AGENT`；
3. 设置 `AI_AGENT`；
4. 替换 `process.emitWarning`；
5. 配置 HTTP dispatcher。

## 第 6 行：把用户参数交给主流程

```ts
main(process.argv.slice(2));
```

`process.argv` 是 Node 看到的完整命令行参数数组。假设你执行：

```bash
node cli.ts --model deepseek --help
```

Node 看到的 `process.argv` 是：

```ts
[
  "/path/to/node",        // 可执行文件
  "/path/to/cli.ts",      // 入口文件
  "--model",              // 用户参数 1
  "deepseek",             // 用户参数 2
  "--help",               // 用户参数 3
]
```

`slice(2)` 的意思是：**从第 3 个元素开始切**，去掉前两个（node 和 cli.ts 本身），只留下用户真正传入的参数。

下一讲会专门讲 `slice(2)`。

## 动手跑：模拟 cli.ts 的调用顺序

```bash
cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a02/mini-cli.mjs <<'EOF'
// 一个迷你版 cli.ts，用来演示结构

function setupCli() {
	console.log("[setupCli] 做环境准备");
}

function main(args) {
	console.log("[main] 收到参数:", args);
}

setupCli();
main(process.argv.slice(2));
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a02/mini-cli.mjs --model deepseek --help
```

**预期输出**：

```text
[setupCli] 做环境准备
[main] 收到参数: [ '--model', 'deepseek', '--help' ]
```

## 小结

`cli.ts` 虽小，但确定了整个启动的骨架：

```text
导入帮手
  → setupCli() 做环境准备
  → main() 开始真正工作
```

## 下一讲预告

细讲 `process.argv.slice(2)`，搞懂用户参数是怎么被切出来的。

---

## 自测

1. `#!/usr/bin/env node` 是给谁看的？
2. `import` 会触发什么动作？
3. `setupCli()` 和 `main()` 哪个先执行？
4. `process.argv.slice(2)` 去掉了哪两个元素？
