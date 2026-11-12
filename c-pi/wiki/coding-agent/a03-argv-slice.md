# 第 3 讲 · process.argv.slice(2) 是什么意思

> **对应源码**：`pi/packages/coding-agent/src/cli.ts:6`

---

## 一句话

`process.argv` 是 Node 看到的完整命令行参数列表；`.slice(2)` 把前两项（Node 本身和入口文件）去掉，只保留用户真正传入的参数。

## 什么是 process.argv

`process.argv` 是一个**数组**，里面放了启动命令时被拆开的每一个“块”。

假设你在终端执行：

```bash
node cli.ts --model deepseek --help
```

Node 会把这行拆成：

```text
node
cli.ts
--model
deepseek
--help
```

然后放进数组：

```ts
process.argv = [
  "node",           // 第 0 项：node 可执行文件
  "cli.ts",         // 第 1 项：入口脚本
  "--model",        // 第 2 项：用户参数
  "deepseek",       // 第 3 项：用户参数
  "--help",         // 第 4 项：用户参数
];
```

## 数组的 slice 方法

`.slice(2)` 表示：**从索引 2 开始，切到数组末尾**。

数组索引从 0 开始数：

```text
索引:    0      1        2         3        4
值:    node   cli.ts   --model   deepseek   --help
```

所以从 2 开始切，得到：

```ts
["--model", "deepseek", "--help"]
```

## 动手跑：看 process.argv 长什么样

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a03

cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a03/argv.mjs <<'EOF'
console.log("完整 process.argv：");
console.log(process.argv);

console.log("\n去掉前两项后：");
console.log(process.argv.slice(2));
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a03/argv.mjs --model deepseek --help
```

**预期输出**：

```text
完整 process.argv：
[
  '/path/to/node',
  '/Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a03/argv.mjs',
  '--model',
  'deepseek',
  '--help'
]

去掉前两项后：
[ '--model', 'deepseek', '--help' ]
```

注意前两项的路径会根据你的环境变化，但结构一定是一样的。

## 为什么要去掉前两项

因为 `main()` 只关心用户想干什么，不关心自己是被哪个 node、哪个脚本启动的。

```ts
main(process.argv.slice(2));
```

等价于：

```ts
main(["--model", "deepseek", "--help"]);
```

这样 `main()` 内部解析参数时，可以直接从 `"--model"` 开始看。

## 不传参数时是什么

```bash
node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a03/argv.mjs
```

**预期输出**：

```text
完整 process.argv：
[
  '/path/to/node',
  '/Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a03/argv.mjs'
]

去掉前两项后：
[]
```

`process.argv.slice(2)` 会返回一个**空数组**，表示用户没有传任何参数。

## 动手跑：自己解析参数

```bash
cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a03/parse.mjs <<'EOF'
const args = process.argv.slice(2);

console.log("用户参数:", args);
console.log("参数个数:", args.length);

// 找 --model 后面的值
const modelIndex = args.indexOf("--model");
if (modelIndex !== -1 && args[modelIndex + 1]) {
	console.log("模型是:", args[modelIndex + 1]);
} else {
	console.log("没有指定 --model");
}
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a03/parse.mjs --model deepseek
node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a03/parse.mjs
```

**预期输出**：

```text
用户参数: [ '--model', 'deepseek' ]
参数个数: 2
模型是: deepseek

用户参数: []
参数个数: 0
没有指定 --model
```

## 小结

| 表达式 | 含义 |
|---|---|
| `process.argv` | 完整命令行参数数组 |
| `process.argv[0]` | node 可执行文件路径 |
| `process.argv[1]` | 入口脚本路径 |
| `process.argv.slice(2)` | 用户传入的参数 |

Pi 的 `main()` 只接收 `slice(2)` 的结果，这样它就不用自己再跳过 node 和 cli.ts 的位置了。

## 下一讲预告

进入 `setupCli()` 内部，先看它到底要做哪五步准备。

---

## 自测

1. `process.argv` 是一个数组还是对象？
2. `process.argv[0]` 和 `process.argv[1]` 分别是什么？
3. `process.argv.slice(2)` 在用户没传参数时返回什么？
4. 如果用户传 `--model deepseek`，`main()` 收到的是几个元素？
