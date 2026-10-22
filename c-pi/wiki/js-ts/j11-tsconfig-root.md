# 第 11 讲 · tsconfig.json 逐条：extends 的合并术

📍 **对应文件**：`pi/tsconfig.json` 全文（仓库大门口那份，翻译官第 9 讲读的就是它）

```json
{
	"extends": "./tsconfig.base.json",
	"compilerOptions": {
		"noEmit": true,
		"module": "NodeNext",
		"moduleResolution": "NodeNext",
		"paths": { "…": "…32 条花名……" }
	},
	"include": ["scripts/model-catalog-protocol.ts", "scripts/model-catalog-protocol.test.ts", "packages/*/src/**/*", "packages/*/test/**/*", "packages/coding-agent/examples/**/*", "packages/agent/examples/**/*"],
	"exclude": ["**/dist/**", "packages/coding-agent/examples/extensions/gondolin/**"]
}
```

---

## 🤔 逐条讲解

### `extends`：抄作业，只改不同的几笔

```json
"extends": "./tsconfig.base.json"
```

第 10 讲的 19 行底色，靠这一行**整个继承**过来。合并规矩很简单：

- 底稿有的、我没提 → **照抄**（`strict`、`erasableSyntaxOnly`……全继承）；
- 底稿有的、我也写了 → **听我的**（`module`/`moduleResolution` 被覆盖成 `NodeNext`）；
- 底稿没有的 → **新增**（`noEmit`、`paths`）。

`./` 老朋友了：「和本文件同一层」。

### `noEmit: true`：只检查，不烤蛋糕

`emit` = 产出编译文件。`noEmit: true` 明说：**这份配置只用来「检查」，永远不许产出 dist**。

这一行把前面几课的知识串成了环：

- 第 9 讲的悬案「`packages/ai/dist` 为什么不存在」→ 答案就是这行；
- shell 站第 8 讲「没有翻译官就报 `ERR_MODULE_NOT_FOUND`」→ 根因也是它；
- pi 的 `npm run check` 里那条 `tsc --noEmit`（命令行版同款）——**查完就走，片叶不沾身**。

### `module` / `moduleResolution`：覆盖成 `NodeNext`

底稿写的是 `Node16`，这里覆盖成 `NodeNext`。两者的差别很小：`Node16` 把规矩钉死在 Node 16 那年的版本，`NodeNext` 是「**跟随最新版 node 的规矩**」（Next = 最新）。对正在快速演进的 node（比如原生跑 TS 这种新能力），跟最新版更合拍。

### `paths`：花名册

32 条「花名 → 源码地址」，shell 站第 9–10 讲已经陪翻译官读过、加工过，不再重复。记住一句话就够：**翻译官只读这一章，其余章节是给 tsc 检查器和编辑器看的**。

### `include` / `exclude`：圈定「管辖范围」

`include` 五条 glob（第 9 讲学过的 `*`/`**`），圈出「这些文件归我检查」：

| 模式 | 圈进来什么 |
|---|---|
| `scripts/model-catalog-protocol.ts`、`….test.ts` | scripts 目录下单独点名的两个文件（它们不在 packages 体系里，得单独写） |
| `packages/*/src/**/*` | 17 个包的**全部源码**（`*` 一层 = 每个包；`**` 任意多层 = src 里所有） |
| `packages/*/test/**/*` | 各包的测试 |
| `packages/coding-agent/examples/**/*`、`packages/agent/examples/**/*` | 两个包的示例代码 |

`exclude` 两条把圈里的两块再剔出去：

- `**/dist/**` —— 任何深度的 `dist` 目录（编译产物不检查，反正也是机器生成的）；
- `packages/coding-agent/examples/extensions/gondolin/**` —— 一个特例子项目（它有自己的规矩）。

**谁来读这份配置？** 三方：`tsc --noEmit`（`npm run check` 的最后一道工序）、你编辑器里的 TS 插件（写代码时的红波浪线）、翻译官（只取 `paths` 一章）。

---

## 🧪 动手跑

### 实验一：迷你版 extends——亲眼看合并

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/j11-extends/mini/src/ignore-me
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/j11-extends/mini/dist
cd /Users/admin/Desktop/pi-study/c-pi/labs/j11-extends/mini

# 底稿：三条规矩
cat > tsconfig.base.json <<'EOF'
{
	"compilerOptions": {
		"strict": true,
		"target": "ES2024",
		"skipLibCheck": true
	}
}
EOF

# 孩子的配置：继承 + 把 target 改回 ES2023 + 圈地
cat > tsconfig.json <<'EOF'
{
	"extends": "./tsconfig.base.json",
	"compilerOptions": {
		"target": "ES2023"
	},
	"include": ["src/**/*"],
	"exclude": ["src/ignore-me/**/*"]
}
EOF

cat > src/a.ts <<'EOF'
export const a = 1;
EOF
cat > src/ignore-me/b.ts <<'EOF'
export const b = 2;
EOF
cat > dist/c.ts <<'EOF'
export const c = 3;
EOF

/Users/admin/Desktop/pi-study/pi/node_modules/.bin/tsc --showConfig -p tsconfig.json
```

> 💡 `--showConfig` = 「把合并后的**最终生效配置**打印出来」；`-p 文件` = 「按这份配置来」（p = project）。

**预期输出**：

```json
{
    "compilerOptions": {
        "skipLibCheck": true,
        "strict": true,
        "target": "es2023"
    },
    "files": [
        "./src/a.ts"
    ],
    "include": [
        "src/**/*"
    ],
    "exclude": [
        "src/ignore-me/**/*"
    ]
}
```

三个知识点一次验完：

1. **照抄**：`strict`、`skipLibCheck` 从底稿继承；
2. **听我的**：`target` 是 `es2023`（孩子覆盖赢了底稿的 ES2024）；
3. **圈地生效**：`files` 里只有 `src/a.ts`——`dist/c.ts` 没被 `include` 圈到，`src/ignore-me/b.ts` 被 `exclude` 剔除了。

### 实验二：对真正的 pi 仓库跑一次

```bash
cd /Users/admin/Desktop/pi-study/pi
./node_modules/.bin/tsc --showConfig -p tsconfig.json | head -15
./node_modules/.bin/tsc --showConfig -p tsconfig.json > /tmp/pi-showconfig.txt
node -p 'JSON.parse(require("node:fs").readFileSync("/tmp/pi-showconfig.txt","utf8")).files.length'
```

**预期输出**：

```json
{
    "compilerOptions": {
        "allowImportingTsExtensions": true,
        "declaration": true,
        "declarationMap": true,
        "erasableSyntaxOnly": true,
        "forceConsistentCasingInFileNames": true,
        "inlineSourceMap": false,
        "inlineSources": true,
        "lib": [
            "es2024"
        ],
        "module": "nodenext",
        "moduleResolution": "nodenext",
        "noEmit": true,
        "paths": { ……
```

```text
1522
```

- 前 15 行就能看出合并结果：底稿的 `erasableSyntaxOnly` 等照抄，`module`/`moduleResolution` 已变成 `nodenext`（覆盖生效），`noEmit` 是根文件新增的；
- `1522` 是 `include`/`exclude` 最终圈中的文件总数——**每次 `npm run check`，tsc 就要把这 1522 个文件全部检查一遍**。这就是「圈地」的真实规模。

---

## ✅ 小结

`tsconfig.json` 只有三个动作：**继承**（`extends` 抄 base 的 19 行底色，冲突时听自己的，比如 `module` 覆盖成 `NodeNext`）；**定性**（`noEmit: true`——只检查不产出，这也是 dist 目录不存在、翻译官必须存在的总根源）；**圈地**（`include` 五条 glob 圈进 1522 个文件，`exclude` 剔除 dist 和特例）。花名册 `paths` 一章同时服务三方：tsc 检查、编辑器提示、翻译官运行。

---

[← 上一讲](/j10-tsconfig-base) · [下一讲 · 毕业：符号速查表 →](/j12-cheatsheet)
