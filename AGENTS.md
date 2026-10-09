# AGENTS.md — Pi 代码仓库学习工作区

本文档是进入本工作区时必读的背景资料。每次新会话/新对话开始时，先读本文档恢复上下文；工作流或进度发生变化时，同步更新本文档（尤其是文末「当前进度与下一步」）。

## 工作区概述

这是一个**学习型工作区**：目标是把 [Pi](https://github.com/earendil-works/pi)（一个极简、可扩展的 agent 框架）从零开始、以最小粒度逐步重新搭建一遍，从而完整理解它的设计与实现。所有代码由 AI 生成，用户负责读代码和把控学习节奏，全程以 Agent 辅助完成。

```
pi-study/
├── AGENTS.md   # 本文件：背景知识与工作流（工作区根目录）
├── pi/         # Pi 源码仓库（Fork），学习与运行的对象
├── c-pi/       # 学习工作区
│   ├── docs/   # 学习文档，已用 VitePress 初始化（在 docs/ 内 npm run dev 启动、npm run build 构建）
│   └── promots/  # 存放给 AI 的提示词/任务草稿（目录名按现状保留）
└── ...         # 后续复现的代码目录将逐步加入
```

## 仓库信息

- 上游（原始仓库）：<https://github.com/earendil-works/pi>
- 我的 Fork：<https://github.com/xzzcy0517/pi>
- **本工作区仓库**：`pi-study/` 根目录自身是 git 仓库，`origin` 指向 <https://github.com/xzzcy0517/pi-study>（SSH）。`.gitignore` 已忽略 `pi/`（原始源码不上传）、`node_modules/`、`.vitepress/dist` 与 `cache` 等本地产物。
- `pi/` 内 git remote：`origin` 指向 Fork（SSH）。**上游 remote 尚未配置**，需要同步时先添加：
  ```bash
  git remote add upstream https://github.com/earendil-works/pi.git
  ```
- 技术栈：TypeScript monorepo，npm workspaces，要求 Node.js ≥ 22.19；Biome（格式化/检查）、Vitest（测试）。
- 主要 packages：`ai`（多 Provider LLM 统一 API）、`agent`（agent 运行时）、`coding-agent`（交互式编码 agent CLI，主体）、`tui`（终端 UI）、`durable`（持久化会话/任务）、`chord`、`telemetry`、`mcp`、`protocol`、`client`、`server` 等。
- 常用命令（在 `pi/` 根目录）：`npm install --ignore-scripts` 安装依赖；`npm run build` 构建；`npm run check` 代码检查（不含测试）；`./test.sh` 跑非 e2e 测试。

## 分支模型与同步工作流

- **main 分支**：与上游同步的基线。**依赖安装、项目启动都在 main 上完成**，保证 main 始终可运行。
- **学习分支**：命名规范 `pi-MMDD-YYYY`，例如 `pi-1006-2026` 表示 2026 年 10 月 6 日检出（中间 1006 是月日，后面 2026 是年份）。每轮学习基于当时的最新 main 检出当日分支。
- **同步循环**：
  1. 上游有更新 → 同步到 Fork 的 main；
  2. 从 main 检出当日学习分支 `pi-MMDD-YYYY`；
  3. 在学习分支上学习；通过对比各学习分支与 main 的 diff，掌握上游新增/变化的代码。
- **当前分支状态**（如与实际不符，以 `git branch` 为准并更新本节）：`pi/` 当前在 main，工作区干净；本地已有 `main`、`pi-1006-2026` 两个分支。

## 学习方法论

1. **先全景后细节**：动手复现之前，先完整梳理原仓库——有哪些功能、怎样运行、功能点清单——写入 `c-pi/docs/`，作为复现路线图。
2. **最小粒度**：功能拆分成最小单元，一次只学一个点、只做一步，吃透再前进。
3. **从简到繁迭代**：从项目启动开始，一步一步重新搭建；最终目标是完整复刻原仓库的文件目录结构，但过程是渐进的。
4. **读码为主**：用户负责读代码理解设计；实现代码由 AI 生成。AI 不要一次性生成大段代码，要按拆分节奏分批给出，每次说明生成的是哪个功能点、对应原仓库哪个文件/模块。

## 给 AI 的工作约定

- **语言**：用中文与用户交流；文档也用中文撰写（代码、标识符、引用的原文除外）。
- **在 `pi/` 内工作时**：先完整阅读 `pi/AGENTS.md`（上游开发规则）和 `pi/CONTRIBUTING.md`，严格遵守其中的代码规范与命令约定（如：改代码后跑 `npm run check`、不擅自 commit、不用 `any`、依赖用 `--ignore-scripts` 安装等）。工作区根目录的本文件管「学什么、怎么学」，`pi/AGENTS.md` 管「在 pi 里怎么写代码」，两者同时适用，冲突时以 `pi/AGENTS.md` 为准。
- **文档产出**：学习文档统一写入 `c-pi/docs/`，一个功能点一篇，结构清晰，方便后续 VitePress 站点化。
- **小步推进**：每完成一个粒度，明确说明「完成了什么、对应原仓库哪里、下一步做什么」，再继续。
- **不擅自 git**：未经用户要求，不 commit、不 push、不改分支。
- **改动前先读懂**：修改或生成代码前，先读相关模块并向用户解释清楚设计，再动手。

## 当前进度与下一步

按时间顺序勾选，未完成项即为下一步。（Agent 完成一项后更新本节。）

- [x] 生成工作区背景文档 `AGENTS.md`（本文件）
- [x] 用 VitePress 初始化 `c-pi/docs/` 为文档站（`npm run dev` → http://localhost:5173）
- [x] 第一篇文章：`c-pi/docs/01-run-pi.md` 运行 Pi 原始仓库（用户手动执行验证中）
- [ ] 全景梳理：输出原仓库功能清单、运行方式、功能点地图 → `c-pi/docs/`
- [ ] 按最小粒度制定复现路线图（拆分学习步骤）
- [ ] 切换到学习分支 `pi-1006-2026`，开始第一步复现
