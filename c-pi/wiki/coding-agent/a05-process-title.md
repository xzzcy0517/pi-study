# 第 5 讲 · process.title 与 APP_NAME

> **对应源码**：`pi/packages/coding-agent/src/cli/setup.ts:5`

---

## 一句话

`process.title = APP_NAME;` 把当前进程的名字改成 `"pi"`，方便在进程列表里认出它。

## 源码

```ts
process.title = APP_NAME;
```

当前 `APP_NAME` 的值是 `"pi"`，所以这行等价于：

```ts
process.title = "pi";
```

## process.title 是什么

`process.title` 是 Node 进程的一个属性，表示这个进程在操作系统里的“标题”。

有些进程查看工具（比如 `ps`、活动监视器）会显示这个名字。

## 它不是什么

容易误解的三件事：

| 不是 | 说明 |
|---|---|
| 不是终端窗口标题 | 改 `process.title` 不会让终端标签页变名字 |
| 不是界面上的 `π` 标志 | 界面上的标志由 `APP_TITLE`（`"π"`）控制 |
| 不是 npm 包名 | npm 包名是 `PACKAGE_NAME`（`@earendil-works/pi-coding-agent`） |

## APP_NAME 从哪来

`APP_NAME` 来自 `config.ts`，由 `package.json` 里的 `piConfig.name` 决定。

当前 `packages/coding-agent/package.json` 是：

```json
{
	"name": "@earendil-works/pi-coding-agent",
	"version": "1.5.0",
	"piConfig": {
		"configDir": ".pi"
	}
}
```

里面没有 `piConfig.name`，所以回退到默认值 `"pi"`。

如果以后改成：

```json
"piConfig": {
	"name": "tau"
}
```

那么 `APP_NAME` 就会是 `"tau"`，`process.title` 也会变成 `"tau"`。

## 动手跑：改进程名

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a05

cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a05/title.mjs <<'EOF'
console.log("改之前:", process.title);

process.title = "my-little-pi";

console.log("改之后:", process.title);

// 让程序停一会儿，方便你在另一个终端用 ps 查看
setTimeout(() => {
	console.log("3 秒后进程标题还是:", process.title);
}, 3000);
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a05/title.mjs
```

**预期输出**：

```text
改之前: node
改之后: my-little-pi
3 秒后进程标题还是: my-little-pi
```

在脚本运行的那 3 秒内，你可以新开一个终端执行：

```bash
ps aux | grep my-little-pi | grep -v grep
```

应该能看到一个标题为 `my-little-pi` 的进程。

## 动手跑：看 Pi 实际的 APP_NAME

```bash
cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a05/app-name.mts <<'EOF'
import {
	APP_NAME,
	APP_TITLE,
	PACKAGE_NAME,
} from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/config.ts";

console.log("PACKAGE_NAME:", PACKAGE_NAME);
console.log("APP_NAME:", APP_NAME);
console.log("APP_TITLE:", APP_TITLE);
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a05/app-name.mts
```

**预期输出**：

```text
PACKAGE_NAME: @earendil-works/pi-coding-agent
APP_NAME: pi
APP_TITLE: π
```

## 小结

- `process.title` 是操作系统看到的进程名；
- Pi 把它设成 `APP_NAME`，当前就是 `"pi"`；
- 这是给进程管理工具看的，不是给用户界面看的；
- `APP_NAME` 和 `APP_TITLE` 是两个不同的东西，不要混淆。

## 下一讲预告

第 6、7 两步：往进程环境里写两个标记变量。

---

## 自测

1. `process.title` 是给谁看的？
2. 当前 `APP_NAME` 的值是什么？
3. `APP_TITLE` 和 `APP_NAME` 有什么区别？
4. 如果 `package.json` 里 `piConfig.name` 改成 `"tau"`，`process.title` 会变成什么？
