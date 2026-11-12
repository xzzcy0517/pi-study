---
title: setupCli()：Pi 开跑前做了哪些准备
---

# 03 · `setupCli()`：Pi 开跑前做了哪些准备

> **本篇定位**：`setupCli()` 的详细讲解已迁移到 Wiki「coding-agent 入口陪读」，这里只保留概览和入口链接。

Pi 启动时，在真正进入 `main()` 之前要先做一圈环境准备：

```text
cli.ts
├── cli/setup.ts
│   ├── config.ts
│   │   ├── utils/child-process.ts
│   │   ├── utils/paths.ts
│   │   └── utils/text.ts
│   └── core/http-dispatcher.ts
└── main.ts（下一篇）
```

`setupCli()` 做五步准备：

1. `process.title = APP_NAME` —— 给进程起名字；
2. `process.env.PI_CODING_AGENT = "true"` —— 标记 Pi coding agent 环境；
3. `process.env.AI_AGENT = "pi"` —— 标记当前 AI agent 身份；
4. `process.emitWarning = 空函数` —— 屏蔽后续噪音警告；
5. `configureHttpDispatcher()` —— 配置全局 HTTP 请求规则。

## 逐讲细读（已迁移到 Wiki）

这部分内容已拆成短视频友好的小讲，每讲配可运行示例。

当前已发布前 9 讲（第 0–2 章）：

- 第 0 讲 · 这七章代码是什么关系
- 第 1 讲 · 导入时执行 vs 调用时执行
- 第 2 讲 · cli.ts 只有 6 行
- 第 3 讲 · process.argv.slice(2) 是什么意思
- 第 4 讲 · setupCli() 概览
- 第 5 讲 · process.title 与 APP_NAME
- 第 6 讲 · 两个环境变量
- 第 7 讲 · 为什么屏蔽 process.emitWarning
- 第 8 讲 · 配置 HTTP 总管

在 `c-pi/` 目录执行 `npm run dev:coding-agent` 即可本地浏览完整 Wiki。

后续章节（HTTP 总管、config.ts 配置中心、工具函数等）会陆续补齐。

## 本地启动 Wiki

```bash
cd /Users/admin/Desktop/pi-study/c-pi
npm run dev:coding-agent
```

## 下一篇

回到主线，进入 `main.ts`：

```ts
main(process.argv.slice(2));
```
