# 第 0 讲 · 这七章代码是什么关系

> **对应源码**：学习分支 `pi-1104-2026`，`packages/coding-agent/src/cli.ts` 及其 `setupCli()` 分支。

---

## 一句话

Pi 启动时，在真正进入主流程 `main()` 之前，要先做一圈**环境准备**。这些准备工作散落在 7 个文件里，通过 `import` 一条一条串起来。

## 这七个文件分别是谁

```text
pi/packages/coding-agent/src/cli.ts          ← 入口，只有 6 行
├── cli/setup.ts                             ← 环境准备函数 setupCli()
│   ├── config.ts                            ← 配置中心：名字、版本、路径、自更新
│   │   ├── utils/child-process.ts           ← 启动子进程的工具
│   │   ├── utils/paths.ts                   ← 路径处理工具
│   │   │   └── utils/child-process.ts       ← 共享，不会重复执行
│   │   └── utils/text.ts                    ← 文本处理工具（去 BOM）
│   └── core/http-dispatcher.ts              ← HTTP 请求总管
└── main.ts                                  ← 主舞台（本章暂时不学）
```

## 用做菜来比喻

| 文件 | 比喻 | 这次启动有没有被“开火” |
|---|---|---|
| `cli.ts` | 餐厅前台，先喊一声“准备开工” | 是 |
| `cli/setup.ts` | 领班，按清单检查五项准备工作 | 是 |
| `config.ts` | 仓库管理员，抬头看一眼招牌、版本号、仓库位置 | 是（导入时） |
| `http-dispatcher.ts` | 外卖接单系统，设定好超时、代理规则 | 是（被 setupCli 调用） |
| `child-process.ts` | 厨房里的备用灶具 | 只是摆好，还没点火 |
| `paths.ts` | 地址翻译手册 | 只是摆在桌上，还没查 |
| `text.ts` | 去标签的小剪刀 | 只在读 package.json 时用了一下 |
| `main.ts` | 真正的大厨，开始做菜 | 下一章才学 |

## 两种动作一定要分清

这批文件里有两种内容，初学者最容易混在一起：

| 类型 | 例子 | 本次是否执行 |
|---|---|---|
| **导入时就会跑的顶层代码** | `config.ts` 读取 `package.json` | 会 |
| **只是定义好、等别人调用的函数** | `spawnProcess()`、`normalizePath()` | 大多数不会 |

打个比方：

- 顶层代码 = 厨师一上班就先把围裙穿好、把招牌看清楚；
- 函数定义 = 把菜谱贴在墙上，等客人点菜后才按菜谱做。

## 额外会读一个非代码文件

```text
pi/packages/coding-agent/package.json
```

`config.ts` 启动时会读它，取出：

- 包名（`@earendil-works/pi-coding-agent`）
- 版本号（当前是 `1.5.0`）
- 配置目录名（`.pi`）

## 下一讲预告

在讲具体代码之前，先搞清楚一件更重要的事：`import` 一行代码，到底什么时候执行？为什么 `config.ts` 比 `setupCli()` 还先跑？

---

## 自测

1. 本章要读的 7 个 TypeScript 文件里，哪个是入口？
2. `config.ts` 在什么时候读取 `package.json`？是 `setupCli()` 被调用之后吗？
3. `child-process.ts` 被导入时，会立刻启动一个子进程吗？
4. `main.ts` 本章为什么不展开？
