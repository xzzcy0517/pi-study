---
layout: home

hero:
  name: JS/TS 语法扫盲
  text: 零基础的语法急救站
  tagline: source-resolver.ts 与 tsconfig.json 用到的每一个符号，都讲清楚
  actions:
    - theme: brand
      text: 开始第 1 讲
      link: /j1-four-languages

features:
  - title: 只为两个文件服务
    details: 不追求「学完 JS」，只把 pi/packages/coding-agent/src/experimental/source-resolver.ts 和 pi/tsconfig.json 用到的语法点讲透。
    link: /j12-cheatsheet
  - title: 每讲都能动手
    details: 每讲一组可复制命令，终端跑一遍，和预期输出对上就算学会。
    link: /j1-four-languages
  - title: 和 shell 站联动
    details: 读 pi-test.sh 陪读第二季（翻译官）时撞到不认识的符号，就来这里查。
---

## 这个站怎么用

1. **两种情况来这儿**：正在读 shell 站第二季、撞到不懂的语法 → 按「速查表」([第 12 讲](/j12-cheatsheet)) 反查；或者想把基础打一遍 → 从第 1 讲顺序读；
2. **动手跑**：每讲的「🧪 动手跑」整段复制到终端，回车；
3. **对输出**：和「预期输出」一致就继续，不一致就停下来问。

预计总时长：顺序读完约 60–90 分钟；纯查表则随用随走。

## 课程表

| 讲 | 你会弄懂 |
|---|---|
| [第 1 讲 · 先认识四种「语言」](/j1-four-languages) | JS / TS / Node / JSON 的分工，文件后缀，`import` 怎么搬工具 |
| [第 2 讲 · 变量与常量](/j2-variables) | `const` / `let`，`import.meta.url` 是哪来的 |
| [第 3 讲 · 字符串与模板字符串](/j3-strings) | 三种引号、`length`/`slice`/`indexOf` 等小工具 |
| [第 4 讲 · 对象与数组](/j4-objects-arrays) | 格子柜与编号抽屉、`Object.entries`、解构、链式调用 |
| [第 5 讲 · 函数与箭头函数](/j5-functions) | `function` 与 `=>`、`filter`/`map`/`sort`、`return` 提前下班 |
| [第 6 讲 · 判断与逻辑符号](/j6-logic) | `if`、`===`、`!`、`&&`/`||`、三元、「空不空」 |
| [第 7 讲 · 循环与出错处理](/j7-loops-errors) | `for...of`、`continue`、`throw` 与 fail fast |
| [第 8 讲 · TypeScript 加的那层料](/j8-typescript) | 类型批注、`interface`、`?.`、`??=`、为什么 node 只撕不查 |
| [第 9 讲 · JSON 与 tsconfig.json](/j9-json-tsconfig) | JSON 五条规矩、`JSON.parse`、花名册的结构与 `*`/`**` |
| [第 10 讲 · tsconfig.base.json 逐条](/j10-tsconfig-base) | 19 行底色分四组：定方言 / 立护栏 / 管产物 / 开方便之门 |
| [第 11 讲 · tsconfig.json 逐条](/j11-tsconfig-root) | `extends` 合并术、`noEmit` 的蝴蝶效应、include/exclude 圈 1522 个文件 |
| [第 12 讲 · 毕业：符号速查表](/j12-cheatsheet) | 所有符号一页收齐，随用随查 |

> 动手实验的文件都放在 `c-pi/labs/j1-…`～`j9-…`（教程命令会自动建好）。整个 `labs` 可以随时删掉，不影响任何正式文件。
