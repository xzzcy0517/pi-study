# 第 9 讲 · 5 分钟空闲超时

> **对应源码**：`pi/packages/coding-agent/src/core/http-dispatcher.ts:1-43`

---

## 一句话

Pi 给 HTTP 连接设了一个默认的“空闲等待时间”：如果 5 分钟内没有任何数据来往，连接就关闭。这个值可以来自用户配置，所以 Pi 先写一个“解析函数”把它规范化。

## 为什么要专门解析超时

超时可能从两个地方来：

1. **用户配置**：写在 `settings.json` 里，可能是 `"5 min"`、`300000`、`"disabled"`；
2. **代码默认值**：`300_000` 毫秒。

Pi 不能直接把用户填的内容丢给网络库，因为网络库只认数字毫秒。所以需要一个“翻译官”：`parseHttpIdleTimeoutMs()`。

## 源码

```ts
export const DEFAULT_HTTP_IDLE_TIMEOUT_MS = 300_000;

export const HTTP_IDLE_TIMEOUT_CHOICES = [
	{ label: "30 sec", timeoutMs: 30_000 },
	{ label: "1 min", timeoutMs: 60_000 },
	{ label: "2 min", timeoutMs: 120_000 },
	{ label: "5 min", timeoutMs: 300_000 },
	{ label: "disabled", timeoutMs: 0 },
] as const;
```

`300_000` 里的下划线只是让人好读，实际就是 `300000`。

`HTTP_IDLE_TIMEOUT_CHOICES` 是设置界面下拉框的数据：用户看到“5 min”，程序拿到 `300000`。

## 解析函数

```ts
export function parseHttpIdleTimeoutMs(value: unknown): number | undefined {
	if (typeof value === "string") {
		const trimmed = value.trim();
		if (trimmed.toLowerCase() === "disabled") {
			return 0;
		}
		if (trimmed.length === 0) {
			return undefined;
		}
		return parseHttpIdleTimeoutMs(Number(trimmed));
	}

	if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
		return undefined;
	}
	return Math.floor(value);
}
```

处理顺序：

1. 字符串先去空白；
2. `"disabled"` 不区分大小写，转成 `0`；
3. 空字符串表示“没有有效值”，返回 `undefined`；
4. 其他字符串尝试 `Number(...)` 转数字，再递归调用；
5. 不是有限数字、负数、其他类型，返回 `undefined`；
6. 合法数字向下取整。

## `undefined` 和 `0` 必须分清

| 输入 | 输出 | 含义 |
|---|---|---|
| `"disabled"` | `0` | 明确说“不要超时” |
| `""` | `undefined` | 没填有效值 |
| `"nope"` | `undefined` | 无效值 |
| `-1` | `undefined` | 负数无效 |
| `1500.9` | `1500` | 合法，取整 |

`0` 是“明确禁用”，`undefined` 是“我不知道该用多少”。

## 动手跑：看解析函数怎么工作

```bash
cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a09/parse.mts <<'EOF'
import { parseHttpIdleTimeoutMs } from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/core/http-dispatcher.ts";

const inputs = [
	undefined,
	"",
	" disabled ",
	"1500.9",
	"nope",
	1500.9,
	0,
	-1,
	Infinity,
	null,
];

// 用 String() 而不是 JSON.stringify()：后者会把 Infinity 显示成 null
for (const value of inputs) {
	const label = typeof value === "string" ? JSON.stringify(value) : String(value);
	console.log(label, "=>", parseHttpIdleTimeoutMs(value));
}
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a09/parse.mts
```

**预期输出**：

```text
undefined => undefined
"" => undefined
" disabled " => 0
"1500.9" => 1500
"nope" => undefined
1500.9 => 1500
0 => 0
-1 => undefined
Infinity => undefined
null => undefined
```

## 格式化函数

```ts
export function formatHttpIdleTimeoutMs(timeoutMs: number): string {
	const choice = HTTP_IDLE_TIMEOUT_CHOICES.find((item) => item.timeoutMs === timeoutMs);
	if (choice) {
		return choice.label;
	}
	return `${timeoutMs / 1000} sec`;
}
```

先查预置表，查不到就换算成秒：

```ts
formatHttpIdleTimeoutMs(30_000);  // "30 sec"
formatHttpIdleTimeoutMs(300_000); // "5 min"
formatHttpIdleTimeoutMs(0);       // "disabled"
formatHttpIdleTimeoutMs(1_500);   // "1.5 sec"
```

这个函数只负责显示，不负责判断输入是否合法。

## 动手跑：格式化示例

```bash
cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a09/format.mts <<'EOF'
import { formatHttpIdleTimeoutMs } from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/core/http-dispatcher.ts";

for (const ms of [0, 30_000, 60_000, 120_000, 300_000, 1500]) {
	console.log(ms, "ms =>", formatHttpIdleTimeoutMs(ms));
}
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a09/format.mts
```

**预期输出**：

```text
0 ms => disabled
30000 ms => 30 sec
60000 ms => 1 min
120000 ms => 2 min
300000 ms => 5 min
1500 ms => 1.5 sec
```

## 小结

- 默认空闲超时是 5 分钟（`300_000` 毫秒）；
- `parseHttpIdleTimeoutMs()` 把各种输入统一成整数毫秒；
- `"disabled"` 和 `0` 都表示禁用超时；
- `formatHttpIdleTimeoutMs()` 把毫秒变回给人看的文字。

## 下一讲预告

代理设置：`HTTP_PROXY` 是怎么被读到并应用的？

---

## 自测

1. `300_000` 实际是多少？
2. `"disabled"` 解析后是多少？它表示什么意思？
3. `""` 和 `"disabled"` 的结果一样吗？为什么？
4. `formatHttpIdleTimeoutMs(1500)` 会显示什么？
