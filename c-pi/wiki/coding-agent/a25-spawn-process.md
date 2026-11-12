# 第 25 讲 · 启动子进程

> **对应源码**：`pi/packages/coding-agent/src/utils/child-process.ts:1-36`

---

## 一句话

`child-process.ts` 把 Node 自带的 `spawn` / `spawnSync` 包了一层：Windows 上换成 `cross-spawn`，其他平台用 Node 原生实现。Pi 启动外部命令时都走这两个函数。

## 为什么需要包一层

Node 自带的 `spawn` 在 Windows 上有个麻烦：很多命令其实是 `.cmd` 文件（比如 `npm.cmd`、`pnpm.cmd`），直接 `spawn("npm", ...)` 可能找不到，参数里的空格和引号也容易出错。

`cross-spawn` 专门解决这些 Windows 兼容问题。所以 Pi 的判断很简单：

```ts
return process.platform === "win32" ? crossSpawn(command, args, options) : nodeSpawn(command, args, options);
```

- Windows：走 `cross-spawn`；
- macOS / Linux：走 Node 原生 `spawn`。

## 异步版本：spawnProcess

```ts
export function spawnProcess(
	command: string,
	args: string[],
	options: SpawnOptionsWithStdioTuple<StdioNull, StdioPipe, StdioPipe>,
): ChildProcessByStdio<null, Readable, Readable>;
export function spawnProcess(command: string, args: string[], options: SpawnOptions): ChildProcess;
export function spawnProcess(command: string, args: string[], options: SpawnOptions): ChildProcess {
	return process.platform === "win32" ? crossSpawn(command, args, options) : nodeSpawn(command, args, options);
}
```

前两行是 TypeScript 的**函数重载声明**，最后一行才是真正的实现。

为什么要写两个声明？为了让类型更精确：

| 你传的 `stdio` | 返回类型 | 好处 |
|---|---|---|
| `["ignore", "pipe", "pipe"]` | `ChildProcessByStdio<null, Readable, Readable>` | 编译器知道 `stdout` / `stderr` 一定存在 |
| 其他组合 | `ChildProcess` | 用宽松类型 |

这样调用方写 `child.stdout.on(...)` 时，TypeScript 不会报“`stdout` 可能是 null”。

## 同步版本：spawnProcessSync

```ts
export function spawnProcessSync(
	command: string,
	args: string[],
	options: SpawnSyncOptionsWithStringEncoding,
): SpawnSyncReturns<string> {
	return process.platform === "win32"
		? crossSpawn.sync(command, args, options)
		: nodeSpawnSync(command, args, options);
}
```

同步版本会**卡住当前程序**，直到子进程结束，然后把结果一次性返回：

```ts
const result = spawnProcessSync("npm", ["root", "-g"], { encoding: "utf-8" });
// result.status  → 退出码
// result.stdout  → 标准输出文本
// result.stderr  → 标准错误文本
// result.error   → 启动失败时的错误对象
```

`encoding: "utf-8"` 表示把输出按 UTF-8 解码成字符串，而不是返回 Buffer。

### 什么时候用同步

只有在“必须马上知道结果、而且命令很快”时才用，比如：

```ts
// config.ts 里查询 npm 全局根目录
readCommandOutput("npm", ["root", "-g"]);
```

长时间运行的命令（比如跑测试、开服务器）必须用异步，否则整个 Pi 会卡住。

## 参数为什么是数组

```ts
spawnProcess("node", ["-e", "console.log('hi')"], options);
```

参数用数组，每个元素就是一个独立参数。空格不会被当成分隔符：

```ts
["a b", "c"]  // 两个参数：第一个是 "a b"，第二个是 "c"
```

如果传一整段字符串 `"a b c"`，程序就得自己猜怎么拆——路径里一旦有空格就会猜错。这也是上一章 `SelfUpdateCommand` 把 `args` 存成数组的原因。

## 动手跑：同步、异步、退出码

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a25

cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a25/spawn-basics.mts <<'EOF'
import {
	spawnProcess,
	spawnProcessSync,
} from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/utils/child-process.ts";

// ① 同步执行：等命令跑完才继续
const sync = spawnProcessSync(process.execPath, ["-e", "console.log('sync hello')"], {
	encoding: "utf-8",
});
console.log("① 同步 status:", sync.status, "stdout:", JSON.stringify(sync.stdout));

// ② 非零退出码
const failed = spawnProcessSync(process.execPath, ["-e", "process.exit(3)"], {
	encoding: "utf-8",
});
console.log("② 非零 status:", failed.status);

// ③ 命令不存在
const missing = spawnProcessSync("definitely-not-a-real-command-xyz", [], {
	encoding: "utf-8",
});
console.log("③ 不存在 status:", missing.status, "error:", missing.error?.code);

// ④ 参数里的空格不会把参数拆开
const spaced = spawnProcessSync(
	process.execPath,
	["-e", "console.log(JSON.stringify(process.argv.slice(1)))", "a b", "c"],
	{ encoding: "utf-8" },
);
console.log("④ 参数:", spaced.stdout.trim());

// ⑤ 异步执行：先拿到子进程对象，再等它结束
const child = spawnProcess(process.execPath, ["-e", "setTimeout(() => console.log('async hello'), 100)"], {
	stdio: ["ignore", "pipe", "pipe"],
});
console.log("⑤ 异步 pid 类型:", typeof child.pid, "（数字表示已经启动）");

let output = "";
child.stdout.on("data", (chunk) => {
	output += chunk;
});

const code = await new Promise<number | null>((resolve) => {
	child.on("close", resolve);
});
console.log("⑤ 异步 code:", code, "stdout:", JSON.stringify(output));
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a25/spawn-basics.mts
```

**预期输出**：

```text
① 同步 status: 0 stdout: "sync hello\n"
② 非零 status: 3
③ 不存在 status: null error: ENOENT
④ 参数: ["a b","c"]
⑤ 异步 pid 类型: number （数字表示已经启动）
⑤ 异步 code: 0 stdout: "async hello\n"
```

## 观察点

1. 退出码 `0` 表示成功，`3` 表示失败；
2. 命令不存在时，`status` 是 `null`，`error.code` 是 `ENOENT`；
3. `"a b"` 仍然是一个参数，没有被空格拆成两个；
4. 异步版本立刻返回一个子进程对象（有 `pid`），之后才慢慢结束。

## 导入不等于执行

`config.ts` 顶部导入了 `spawnProcessSync`，但只有调用 `readCommandOutput()` 时才会真的启动命令。同样，`setupCli()` 的启动路径里**不会**启动任何子进程。

## 小结

- Windows 用 `cross-spawn`，其他平台用 Node 原生 `spawn`；
- 同步版本适合短命令，异步版本适合长任务；
- 参数存成数组，空格不会拆错；
- 退出码 `0` 成功，非零失败，`null` 通常表示被信号终止或启动失败；
- 导入函数不会启动进程，调用才会。

## 下一讲预告

异步启动之后，怎么知道子进程“真的结束了”？`waitForChildProcess()` 有一个 100ms 的巧思。

---

## 自测

1. 为什么 Windows 上要用 `cross-spawn`？
2. 同步和异步版本分别适合什么场景？
3. 参数为什么用数组而不是一整段字符串？
4. `status` 为 `null` 可能是什么原因？
