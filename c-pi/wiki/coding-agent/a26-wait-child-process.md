# 第 26 讲 · 等待子进程结束

> **对应源码**：`pi/packages/coding-agent/src/utils/child-process.ts:38-137`

---

## 一句话

`waitForChildProcess()` 等子进程结束并拿到退出码。但它不能只监听 `exit`，也不能死等 `close`——源码用了一个“100ms 静默宽限”的折中方案。

## 两个事件的区别

| 事件 | 含义 |
|---|---|
| `exit` | 直接启动的那个子进程结束了 |
| `close` | 子进程结束，并且它的 stdio 流也关闭了 |

正常情况下 `exit` 先到，`close` 后到。但在一种情况下，两者会相隔很久：

```text
Pi 启动命令 A
  → A 又启动后台命令 B
  → A 很快退出（exit 触发）
  → B 继承了 stdout/stderr，还在继续输出
  → 直到 B 也结束，close 才触发
```

## 两个都不能只用

| 方案 | 问题 |
|---|---|
| 只等 `exit` | B 还没输出完就返回，尾部输出丢失 |
| 死等 `close` | 如果 B 永远不关闭管道（比如 Windows 后台进程），永远不返回 |

## 折中方案：100ms 静默宽限

```ts
const EXIT_STDIO_GRACE_MS = 100;
```

规则：

1. 收到 `exit` 后，启动一个 100ms 计时器；
2. 每收到一块新数据，就**重新计时**；
3. 连续 100ms 没有新数据，就认为“安静了”，结束等待；
4. 如果两端流正常结束（`end`）或 `close` 先到，直接结束。

所以 100ms 不是“退出后最多再等 100ms”，而是“**连续安静** 100ms”。只要还有数据持续到达，就可以远超 100ms。

## 状态变量

```ts
let settled = false;       // Promise 是否已完成
let exited = false;        // 是否收到 exit
let exitCode: number | null = null;
let postExitTimer: NodeJS.Timeout | undefined;
let stdoutEnded = child.stdout === null;
let stderrEnded = child.stderr === null;
```

| 变量 | 作用 |
|---|---|
| `settled` | 防止重复完成 |
| `exited` | 标记直接子进程已退出 |
| `exitCode` | 保存退出码 |
| `postExitTimer` | 静默计时器 |
| `stdoutEnded` / `stderrEnded` | 两端输出是否结束；没有流则一开始就算结束 |

## 完成动作

```ts
const finalize = (code: number | null) => {
	if (settled) return;
	settled = true;
	cleanup();
	child.stdout?.destroy();
	child.stderr?.destroy();
	resolve(code);
};
```

做四件事：

1. 标记已完成，防止重入；
2. 移除所有监听器；
3. 销毁 stdout / stderr；
4. 用退出码完成 Promise。

## 各种事件怎么推动状态

```ts
const onData = () => {
	if (exited && !settled) armIdleTimer();
};
```

退出后还有数据 → 重新计时。

```ts
const onExit = (code: number | null) => {
	exited = true;
	exitCode = code;
	maybeFinalizeAfterExit();
	if (!settled) {
		armIdleTimer();
	}
};
```

记录退出码；如果两端流已经结束就直接完成，否则开始计时。

```ts
const onClose = (code: number | null) => {
	finalize(code);
};
```

正常关闭 → 直接完成。

```ts
const onError = (err: Error) => {
	if (settled) return;
	settled = true;
	cleanup();
	reject(err);
};
```

子进程启动失败或发生错误 → Promise 拒绝。

## 动手跑一：正常结束、非零退出、启动失败

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a26

cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a26/wait-basic.mts <<'EOF'
import {
	spawnProcess,
	waitForChildProcess,
} from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/utils/child-process.ts";

// ① 正常结束：观察 exit 和 close 的先后
const child = spawnProcess(process.execPath, ["-e", "console.log('done')"], {
	stdio: ["ignore", "pipe", "pipe"],
});
child.on("exit", (code) => console.log("事件 exit:", code));
child.on("close", (code) => console.log("事件 close:", code));

let output = "";
child.stdout.on("data", (chunk) => {
	output += chunk;
});

const code = await waitForChildProcess(child);
console.log("wait 结果:", code, "输出:", JSON.stringify(output));

// ② 非零退出码
const bad = spawnProcess(process.execPath, ["-e", "process.exit(7)"], {
	stdio: ["ignore", "pipe", "pipe"],
});
console.log("② 非零退出:", await waitForChildProcess(bad));

// ③ 命令不存在：Promise 会 reject
try {
	const missing = spawnProcess("definitely-not-a-real-command-xyz", [], {
		stdio: ["ignore", "pipe", "pipe"],
	});
	await waitForChildProcess(missing);
} catch (error) {
	console.log("③ 错误被 reject:", error.code);
}
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a26/wait-basic.mts
```

**预期输出**：

```text
事件 exit: 0
事件 close: 0
wait 结果: 0 输出: "done\n"
② 非零退出: 7
③ 错误被 reject: ENOENT
```

`exit` 先于 `close`，符合预期。

## 动手跑二：孙进程还占着管道

```bash
cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a26/wait-grandchild.mts <<'EOF'
import {
	spawnProcess,
	waitForChildProcess,
} from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/utils/child-process.ts";

// ① 孙进程在父进程退出后继续写 stdout（每 50ms 一块，持续越过 100ms 宽限）
const lateParent = `
const { spawn } = require("node:child_process");
spawn(process.execPath, ["-e", "let i = 0; const t = setInterval(() => { process.stdout.write('chunk' + (++i)); if (i === 5) clearInterval(t); }, 50)"], {
	stdio: ["ignore", "inherit", "inherit"],
	detached: true,
}).unref();
process.exit(0);
`;

const late = spawnProcess(process.execPath, ["-e", lateParent], {
	stdio: ["ignore", "pipe", "pipe"],
});
let lateOutput = "";
late.stdout.on("data", (chunk) => {
	lateOutput += chunk;
});

const start1 = Date.now();
const code1 = await waitForChildProcess(late);
console.log(
	"① 退出码:",
	code1,
	"输出:",
	JSON.stringify(lateOutput),
	"耗时:",
	Date.now() - start1,
	"ms",
);

// ② 孙进程一直占着管道、但从不写
const quietParent = `
const { spawn } = require("node:child_process");
spawn(process.execPath, ["-e", "setTimeout(() => {}, 2000)"], {
	stdio: ["ignore", "inherit", "inherit"],
	detached: true,
}).unref();
process.exit(0);
`;

const quiet = spawnProcess(process.execPath, ["-e", quietParent], {
	stdio: ["ignore", "pipe", "pipe"],
});

const start2 = Date.now();
const code2 = await waitForChildProcess(quiet);
console.log(
	"② 退出码:",
	code2,
	"耗时:",
	Date.now() - start2,
	"ms（应约 100ms，而不是等 2 秒）",
);
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a26/wait-grandchild.mts
```

**预期输出**（耗时会有几十毫秒浮动）：

```text
① 退出码: 0 输出: "chunk1chunk2chunk3chunk4chunk5" 耗时: 298 ms
② 退出码: 0 耗时: 139 ms（应约 100ms，而不是等 2 秒）
```

两个关键观察：

1. ① 的直接子进程在 0ms 就退出了，但 300ms 内陆续到达的 5 块输出全部保留——因为每块数据都重置了计时器；
2. ② 的孙进程要活 2 秒，但一直不写数据，所以 100ms 后就放行，不会傻等。

## 一个容易忽略的细节

`finalize()` 会销毁 `stdout` 和 `stderr`。所以：

- 调用 `waitForChildProcess()` 之前，要先挂好 `data` 监听器并保存输出；
- 等待结束后，不要再指望从这两个流里读数据。

## 为什么不用固定超时

如果写成“退出后最多再读 300ms”，会有两个问题：

- 输出持续超过 300ms 的后台进程，尾部还是会被截断；
- 每次都要白等 300ms，短命令变慢。

“每来一块数据就重新计时”同时解决了两头：有输出就一直读，没输出就尽快放行。

## 小结

- 不能只等 `exit`（会丢尾输出），也不能死等 `close`（可能永远不关）；
- `exit` 后等 stdio 连续安静 100ms；
- 每收到一块数据就重新计时，所以持续输出可以超过 100ms；
- `close` 或两端 `end` 先到就立即完成；
- 错误会让 Promise 拒绝；
- 结束时销毁输出流，调用前要先挂好监听器。

## 下一章预告

`config.ts` 和 `child-process.ts` 都读完了。下一章进入 `paths.ts`：路径怎么比较、怎么规范化。

---

## 自测

1. `exit` 和 `close` 有什么区别？
2. 为什么不能只监听 `exit`？
3. 100ms 是“退出后的总等待上限”吗？
4. 孙进程一直占着管道但不写数据，`waitForChildProcess()` 会等多久？
