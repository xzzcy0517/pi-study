# 第 9 讲 · 两张说明书与找花名册（第 10–27 行）

📍 **位置**：`pi/packages/coding-agent/src/experimental/source-resolver.ts` 第 10–27 行

```ts
interface TsConfig {
	readonly compilerOptions?: {
		readonly paths?: Readonly<Record<string, readonly string[]>>;
	};
}

interface SourceAlias {
	readonly pattern: string;
	readonly prefix: string;
	readonly suffix: string;
	readonly replacements: readonly string[];
}

const repositoryRoot = fileURLToPath(new URL("../../../..", import.meta.url));
const tsconfigPath = resolve(repositoryRoot, "tsconfig.json");
const tsconfig = JSON.parse(readFileSync(tsconfigPath, "utf8")) as TsConfig;
const paths = tsconfig.compilerOptions?.paths;
if (!paths) throw new Error(`Source runtime requires compilerOptions.paths in ${tsconfigPath}`);
```

---

## 🤔 它是干什么的？

这一段做一件事：**出门办事前，先把「花名册」拿到手**。分三小步：立两张说明书 → 算出仓库在哪 → 把 tsconfig.json 读进来。

### 第 10–21 行：两张「说明书」（interface）

`interface`（接口）是 TypeScript 特有的写法，作用是**给数据画一张登记表模板**：「这份数据应该有哪些格子、每个格子填什么类型的东西」。

- `TsConfig`：描述 tsconfig.json 读进来长什么样——里面有个 `compilerOptions`，它里面有个 `paths`，`paths` 是「花名 → 地址清单」的对照表。
- `SourceAlias`：描述一会儿要加工的「翻译卡片」长什么样——`pattern`（花名暗号）、`prefix`/`suffix`（暗号被 `*` 劈成的前后两半）、`replacements`（对应的地址清单）。

两个词顺带认识一下（不用背）：

| 写法 | 意思 |
|---|---|
| `readonly` | 这个格子**只许看、不许改**（防止手滑改坏） |
| `格子名?` | 这个格子**可以有也可以没有** |

最重要的一条冷知识：**`interface` 在程序真正运行时会被整个撕掉**。它只在「写代码 / 做检查」阶段起作用，帮编辑器和检查工具挑错；node 跑起来之后，就当这两张纸从没存在过。所以零基础读代码时，看到 `interface` 不用紧张——它不干任何「活」，只是一份约定。

### 第 23 行：算出「仓库大门口」在哪

```ts
const repositoryRoot = fileURLToPath(new URL("../../../..", import.meta.url));
```

这行是全场最「绕」的一行，从右往左读：

1. **`import.meta.url`** = 「我自己这个文件的网址」。对翻译官来说，就是 `file:///…/pi/packages/coding-agent/src/experimental/source-resolver.ts`。
2. **`new URL("../../../..", 我的网址)`** = 以我为起点，**往上爬 4 层楼**：

```text
experimental/   ← 翻译官自己住这层
   ↑ 第 1 个 ..
src/
   ↑ 第 2 个 ..
coding-agent/
   ↑ 第 3 个 ..
packages/
   ↑ 第 4 个 ..
pi/             ← 仓库大门口（tsconfig.json 就躺在这）
```

3. **`fileURLToPath(...)`** = 把网址**翻译回普通地址**——正好是第 5 讲 `pathToFileURL` 的反方向操作。一个把地址变网址，一个把网址变地址，一对反义词。

为什么费这个劲？因为翻译官**不能假设别人从哪个目录启动它**（第 2 讲那个「先找到自己的家」的道理，一模一样的思想）。从自己的位置反推 4 层，无论谁、在哪、怎么启动，都能准确找到仓库根目录。

### 第 24–27 行：把花名册读进手里

```ts
const tsconfigPath = resolve(repositoryRoot, "tsconfig.json");   // 拼出花名册的完整地址
const tsconfig = JSON.parse(readFileSync(tsconfigPath, "utf8")); // 读出来、从文字变成数据
const paths = tsconfig.compilerOptions?.paths;                   // 取出 paths 那一章
if (!paths) throw new Error(`…`);                                // 没有？宁可当场罢工
```

- `resolve(甲, 乙)`：把两段地址**拼**成一段（`node:path` 工具第一次上岗）。
- `readFileSync(地址, "utf8")`：把文件**原样读成一大段文字**。
- `JSON.parse(...)`：JSON 文件本质上是「按特定格式写的文字」，`JSON.parse` 把这段文字**变成程序能直接查询的数据**——就像把一纸名单变成一本可以按名字检索的通讯录。
- 最后一行是「**宁可报错，也不将就**」：花名册里没有 `paths` 这一章，翻译官就没法干活，与其将错就错，不如当场喊停。这种写法叫 **fail fast**（快速失败），是好程序员的共同习惯。

---

## 🧪 动手跑

先用最笨的办法「爬楼」，验证 4 个 `..` 为什么正好到仓库根：

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/r9-tsconfig

p=/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/experimental/source-resolver.ts
echo "起点: $p"
for i in 1 2 3 4 5; do p=$(dirname "$p"); echo "爬 $i 层: $p"; done
```

> 💡 `dirname` 是「去掉地址的最后一段」。注意它**爬 5 次**才到仓库根：第 1 次只是去掉文件名、回到文件所在的文件夹，之后 4 次才真正对应 4 个 `..`。

**预期输出**：

```text
起点: /Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/experimental/source-resolver.ts
爬 1 层: /Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/experimental
爬 2 层: /Users/admin/Desktop/pi-study/pi/packages/coding-agent/src
爬 3 层: /Users/admin/Desktop/pi-study/pi/packages/coding-agent
爬 4 层: /Users/admin/Desktop/pi-study/pi/packages
爬 5 层: /Users/admin/Desktop/pi-study/pi
```

再用翻译官同款算法一行验证，并真的把花名册读出来数一数：

```bash
node -p 'require("node:url").fileURLToPath(new URL("../../../..", "file:///Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/experimental/source-resolver.ts"))'

node -p 'const p=JSON.parse(require("node:fs").readFileSync("/Users/admin/Desktop/pi-study/pi/tsconfig.json","utf8")).compilerOptions.paths; "花名册共 "+Object.keys(p).length+" 条，其中 @earendil-works/ 开头 "+Object.keys(p).filter(k=>k.startsWith("@earendil-works/")).length+" 条"'

node -p 'Object.keys(JSON.parse(require("node:fs").readFileSync("/Users/admin/Desktop/pi-study/pi/tsconfig.json","utf8")).compilerOptions.paths).slice(0,3)'
```

**预期输出**：

```text
/Users/admin/Desktop/pi-study/pi/
花名册共 32 条，其中 @earendil-works/ 开头 31 条
[ '@earendil-works/chord', '@earendil-works/chord/context', '@earendil-works/chord/delta' ]
```

和爬楼实验殊途同归：`../../../..` 正好落在 `pi/`（输出末尾的 `/` 表示「这是个目录」）。花名册 32 条里，31 条是自家花名——剩下那 1 条是谁、为什么被筛掉，下一讲揭晓。

---

## ✅ 小结

第 10–27 行是翻译官的「出门准备」：先用两张 `interface` 说明书约定数据形状（运行时会被撕掉，只是约定）；再从自身位置 `import.meta.url` 上爬 4 层，算出仓库根目录；最后把根目录下的 `tsconfig.json` 读成数据、取出 `paths` 花名册——读不到宁可立刻报错，也不带着残缺的花名册上岗。

---

[← 上一讲](/r8-why-resolver) · [下一讲 · 把花名册加工成翻译卡片 →](/r10-alias-cards)
