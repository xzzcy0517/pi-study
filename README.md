# pi-study

Pi 代码仓库的**学习工作区**：目标是以最小粒度把 [earendil-works/pi](https://github.com/earendil-works/pi)（一个极简、可扩展的 agent 框架）从零逐步重新搭建一遍，完整理解它的设计与实现。

学习方式：全程由 AI（Agent）辅助——AI 负责读码、生成代码和文档，我负责读代码理解、手动执行每一步操作、把控学习节奏。

## 仓库结构

```
pi-study/
├── AGENTS.md   # 给 AI 的背景知识与学习工作流（每次新会话的入口）
├── README.md   # 本文件
├── pi/         # Fork 的 Pi 源码（不上传，见 .gitignore）
└── c-pi/       # 学习工作区
    ├── docs/   # 学习文档（VitePress 文档站）
    └── promots/  # 口述提示词草稿
```

## 阅读学习文档

文档站用 VitePress 搭建，第一篇是《01 运行 Pi 原始仓库》：

```bash
cd c-pi/docs
npm install    # 首次需要
npm run dev    # 打开 http://localhost:5173
```

构建静态站点用 `npm run build`（产物在 `.vitepress/dist/`）。

## 获取 pi 源码

`pi/` 目录是学习对象，**不随本仓库上传**。需要时自行克隆到 `pi/`：

```bash
git clone git@github.com:xzzcy0517/pi.git pi
```

克隆后如何安装依赖、水合模型数据、从源码启动，见文档站第一篇。

- 原始仓库：<https://github.com/earendil-works/pi>
- 我的 Fork：<https://github.com/xzzcy0517/pi>

## 学习工作流（简述）

- `main` 分支：与上游同步的基线，装依赖、跑项目都在这里；
- 学习分支：命名 `pi-MMDD-YYYY`（如 `pi-1006-2026`），每轮基于最新 main 检出，通过与 main 的 diff 对比掌握上游更新；
- 原则：先全景后细节、最小粒度、从简到繁、读码为主。

完整约定见 [AGENTS.md](AGENTS.md)。
