# 支线知识库（wiki）

主线（`c-pi/docs/`）学的是「Pi 怎么设计与实现」；这里存放**支线**：读 Pi 源码时撞到的通用基础知识，每个主题一个独立 VitePress 站。原则：**主线读到哪，支线补到哪**，不提前学。

## 目录约定

```text
c-pi/wiki/
├── README.md        ← 本文件：支线索引
└── <主题>/          ← 每个主题一个独立 VitePress 站
    ├── package.json
    ├── .vitepress/config.mts
    ├── index.md     ← 该支线首页 + 学习路线
    └── *.md         ← 知识点文章（一篇一个点）
```

启动某个支线站（在 `c-pi/` 目录）：

```bash
npm run dev:shell      # 现在只有 shell 一条支线
# 通用形式：npm run dev --workspace wiki/<主题>
```

## 现有支线

| 支线 | 目录 | 解决什么问题 | 状态 |
|---|---|---|---|
| pi-test.sh 陪读 | [shell/](./shell) | **零基础读懂 `pi/pi-test.sh`**：7 讲陪读教程（每讲一段代码 + 可复制实验 + 预期输出），只围绕这一个文件 | ✅ 主路径 |

动手实验统一落在 `c-pi/labs/`（教程命令会自动创建，可整体删除）。

## 规划中的支线（按主线需要逐步补）

| 支线 | 触发时机（主线读到哪） |
|---|---|
| Node CLI 机制 | 读 `pi-test.sh` 的 `node --import` 部分 |
| 模块解析与 TS 运行 | 读 `source-resolver.ts` |
| 终端与 TUI 渲染 | 读 `packages/tui`（差分渲染、ANSI、raw 模式） |
| TypeScript 进阶 | 读 `packages/coding-agent` 的类型设计时 |

支线文章的「动手实验」统一落在 `c-pi/labs/`（陪读教程每讲一个子目录，命令自动创建、可整体删除）。
