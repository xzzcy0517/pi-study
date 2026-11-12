# 第 11 讲 · 错误监听器：什么都不做也有用

> **对应源码**：`pi/packages/coding-agent/src/core/http-dispatcher.ts:52-66`

---

## 一句话

Node 的 `EventEmitter` 如果发出 `"error"` 事件却没人监听，可能直接让进程崩溃。Pi 给 dispatcher 加一个空监听器，就是为了防止这种情况。

## 事件和监听器

在 Node 里，很多对象会“ emit（发射）事件”。比如一个 HTTP 连接可能发射：

- `"data"`：收到数据了
- `"end"`：数据传完了
- `"error"`：出错了

你可以给这些事件注册“监听器”——就是“如果这件事发生了，就执行这个函数”。

```ts
connection.on("data", () => {
	console.log("收到数据");
});
```

## `"error"` 事件的特殊性

Node 对 `"error"` 事件有一条特殊规则：

```text
如果 emit("error") 时没有任何监听器，Node 会把这个错误抛出来，可能导致整个进程崩溃。
```

这在 HTTP dispatcher 销毁连接时特别麻烦：Undici 内部可能在关闭连接时 emit 一个 `"error"`，而这个错误其实已经被请求 Promise 处理了。但如果没人监听 `"error"`，进程可能莫名其妙崩掉。

## 源码

```ts
const ignoreUndiciDispatcherError = (_error: unknown): void => {};

function withUndiciErrorListener<T extends undici.Dispatcher>(dispatcher: T): T {
	if (dispatcher instanceof EventEmitter) {
		EventEmitter.prototype.on.call(dispatcher, "error", ignoreUndiciDispatcherError);
	}
	return dispatcher;
}
```

- `ignoreUndiciDispatcherError`：一个空函数，参数 `_error` 前面的下划线表示“这个参数我不用”；
- `withUndiciErrorListener`：接收一个 dispatcher，如果它是 `EventEmitter` 的实例，就给它注册 `"error"` 监听器；
- 最后把 dispatcher 原样返回。

## 动手跑：演示 error 事件的特殊性

```bash
cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a11/error.mjs <<'EOF'
import { EventEmitter } from "node:events";

// 情况 1：没有 error 监听器
const emitter1 = new EventEmitter();
try {
	emitter1.emit("error", new Error("没人听我就炸"));
	console.log("情况 1：没炸");
} catch (err) {
	console.log("情况 1：捕获到错误 =", err.message);
}

// 情况 2：有一个空 error 监听器
const emitter2 = new EventEmitter();
emitter2.on("error", () => {});
emitter2.emit("error", new Error("有人听我就不炸"));
console.log("情况 2：没炸");
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a11/error.mjs
```

**预期输出**：

```text
情况 1：捕获到错误 = 没人听我就炸
情况 2：没炸
```

## 这不等于吞掉所有网络错误

源码注释特别说明：

```text
这个监听器只是防止 EventEmitter 的未处理 error 特殊规则导致崩溃。
响应体流仍然会通过 reader.read() 等路径拒绝，调用方仍能发现请求失败。
```

翻译一下：

- 空监听器 ≠ 所有错误都被隐藏；
- 真正请求失败时，调用请求的地方仍然会得到错误信息；
- 这里只是防止“没人管的 error 事件”把进程炸掉。

## 动手跑：和 Pi 一样给对象加空错误监听

```bash
cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a11/pi-style.mjs <<'EOF'
import { EventEmitter } from "node:events";

const ignoreError = (_error) => {};

function withErrorListener(obj) {
	if (obj instanceof EventEmitter) {
		EventEmitter.prototype.on.call(obj, "error", ignoreError);
	}
	return obj;
}

const emitter = new EventEmitter();
withErrorListener(emitter);

emitter.emit("error", new Error("Pi 风格的忽略"));
console.log("进程没崩");
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a11/pi-style.mjs
```

**预期输出**：

```text
进程没崩
```

## 小结

- `EventEmitter` 的 `"error"` 事件没人监听时，可能抛错导致进程崩溃；
- Pi 给每个 dispatcher 加一个空 `"error"` 监听器，专门防这种情况；
- 真正的请求错误仍然会通过 Promise/流返回给调用方；
- 这是一个“兜底保险”，不是“吞错”。

## 下一讲预告

`Client` 和 `Pool`：Pi 是怎么创建实际 HTTP 连接的？

---

## 自测

1. 为什么 `"error"` 事件和其他事件不一样？
2. 空 error 监听器会隐藏所有网络错误吗？
3. `ignoreUndiciDispatcherError` 的参数名为什么加下划线？
4. `withUndiciErrorListener` 返回的是什么？
