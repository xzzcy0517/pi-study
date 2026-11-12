---
layout: home

hero:
  name: coding-agent 入口陪读
  text: 读懂 Pi 启动前的准备
  tagline: 把 setupCli() 分支拆成 20+ 讲 · 每讲一小段 · 每讲都能动手跑
  actions:
    - theme: brand
      text: 开始第 0 讲
      link: /a00-what-we-read

features:
  - title: 从零开始
    details: 不需要编程基础，每个术语第一次出现都用大白话解释。
    link: /a00-what-we-read
  - title: 每讲能动手
    details: 每讲附带可复制的命令或脚本，粘贴到终端就能看到效果。
    link: /a02-cli-6-lines
  - title: 为录视频设计
    details: 章节拆得细，一讲一个知识点，方便一节一节录制。
    link: /a04-setup-overview
---

## 这个教程怎么用

1. **按顺序读**：第 0 讲 → 第 1 讲 → ……，每讲只处理一小段代码；
2. **动手跑**：每讲的「🧪 动手跑」里是一整块命令，**整段复制**粘贴到终端，回车；
3. **对输出**：终端打印的内容应该和教程里的「预期输出」基本一致。不一样就停下来，把报错发给我；
4. **不用背**：看懂、跑通即可。忘了随时回来翻。

> 动手实验的文件都放在 `c-pi/labs/coding-agent/`（你的学习目录里，教程命令会自动建好）。整个 `labs/coding-agent/` 可以随时删掉，不影响任何正式文件。

## 完整课程表

| 章节 | 讲 | 读源码的哪一段 | 你会弄懂 |
|---|---|---|---|
| 第 0 章 | [第 0 讲 · 这七章代码是什么关系](/a00-what-we-read) | 全部分支图 | setupCli() 涉及哪些文件、谁调谁 |
| 第 0 章 | [第 1 讲 · 导入时执行 vs 调用时执行](/a01-import-vs-call) | ESM 加载规则 | 为什么 config.ts 比 setupCli() 先跑 |
| 第 1 章 | [第 2 讲 · cli.ts 只有 6 行](/a02-cli-6-lines) | cli.ts:1-6 | shebang、静态导入、setupCli/main 顺序 |
| 第 1 章 | [第 3 讲 · process.argv.slice(2)](/a03-argv-slice) | cli.ts:6 | 命令行参数怎么被切出来 |
| 第 2 章 | [第 4 讲 · setupCli() 概览](/a04-setup-overview) | setup.ts:1-13 | 五步准备总览 |
| 第 2 章 | [第 5 讲 · process.title 与 APP_NAME](/a05-process-title) | setup.ts:5 | 进程名是什么、设成什么 |
| 第 2 章 | [第 6 讲 · 两个环境变量](/a06-env-vars) | setup.ts:6-7 | PI_CODING_AGENT / AI_AGENT 是做什么的 |
| 第 2 章 | [第 7 讲 · 为什么屏蔽 process.emitWarning](/a07-emit-warning) | setup.ts:8 | 空函数替换警告输出 |
| 第 2 章 | [第 8 讲 · 配置 HTTP 总管](/a08-configure-http-dispatcher) | setup.ts:12 | configureHttpDispatcher 是干嘛的 |
| 第 3 章 | [第 9 讲 · 5 分钟空闲超时](/a09-idle-timeout) | http-dispatcher.ts | 超时怎么解析、0 是什么意思 |
| 第 3 章 | [第 10 讲 · HTTP_PROXY 与代理](/a10-proxy-settings) | http-dispatcher.ts | 代理环境变量怎么被应用 |
| 第 3 章 | [第 11 讲 · 错误监听器](/a11-error-listener) | http-dispatcher.ts | 为什么给 dispatcher 加空 error 监听 |
| 第 3 章 | [第 12 讲 · Client、Pool 与全局 dispatcher](/a12-client-pool-global) | http-dispatcher.ts | 连接怎么创建、怎么设为全局 |
| 第 4 章 | [第 13 讲 · 判断运行形态](/a13-runtime-detection) | config.ts | Bun/Node/编译二进制 |
| 第 4 章 | [第 14 讲 · 找到包根目录](/a14-find-package-dir) | config.ts | getPackageDir / findNodePackageDir |
| 第 4 章 | [第 15 讲 · 读取 package.json](/a15-read-package-json) | config.ts | 启动时同步读配置 |
| 第 4 章 | [第 16 讲 · APP_NAME 为什么是 "pi"](/a16-constants) | config.ts | 常量推导 |
| 第 5 章 | [第 17 讲 · 识别安装方式](/a17-install-method) | config.ts | npm/pnpm/yarn/bun 怎么猜出来 |
| 第 5 章 | [第 18 讲 · 构造自更新命令](/a18-command-shape) | config.ts | command / args / display 三部分 |
| 第 5 章 | [第 19 讲 · 三道安全门](/a19-three-gates) | config.ts | 为什么识别了 npm 也不自动更新 |
| 第 5 章 | [第 20 讲 · 用户自定义更新命令](/a20-custom-update-command) | config.ts | PI_SELF_UPDATE_COMMAND |
| 第 6 章 | [第 21 讲 · 内置资源路径](/a21-resource-paths) | config.ts | 主题、模板、docs、assets 的路径规则 |
| 第 6 章 | [第 22 讲 · QuickJS Wasm 与 worker](/a22-special-resources) | config.ts | 惰性解析、缓存、data URL |
| 第 6 章 | [第 23 讲 · 安装被换掉了怎么办](/a23-install-change) | config.ts | detectInstallChange 的三种结果 |
| 第 6 章 | [第 24 讲 · 用户配置路径 ~/.pi/agent](/a24-user-paths) | config.ts | 用户目录与 9 个派生路径 |
| 第 7 章 | [第 25 讲 · 启动子进程](/a25-spawn-process) | child-process.ts | spawnProcess / spawnProcessSync |
| 第 7 章 | [第 26 讲 · 等待子进程结束](/a26-wait-child-process) | child-process.ts | waitForChildProcess 的 100ms 宽限 |
| 第 8 章 | [第 27 讲 · 路径比较](/a27-path-comparison) | paths.ts | canonicalize / pathsEqual / isPathWithin |
| 第 8 章 | [第 28 讲 · 规范化与解析](/a28-normalize-resolve) | paths.ts | normalizePath / resolvePath / cwd 相对路径 |
| 第 8 章 | [第 29 讲 · 来源判断、指纹、云同步](/a29-path-misc) | paths.ts | isLocalPath / getFileRevision / 云同步标记 |
| 第 8 章 | [第 30 讲 · 去掉 JSON 开头的 BOM](/a30-text-bom) | text.ts | splitBom / stripBom |
| 第 9 章 | [第 31 讲 · 毕业总结](/a31-graduation) | 全文 | setupCli() 到底做了什么 |

> 课程表已全部发布，共 32 讲（第 0–31 讲）。

## 开始前确认一件事

Pi 的代码在：

```bash
ls /Users/admin/Desktop/pi-study/pi
```

能看到 `packages/coding-agent/src/cli.ts` 等文件，就可以开始读了。
