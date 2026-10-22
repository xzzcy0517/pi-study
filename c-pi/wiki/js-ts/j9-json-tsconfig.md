# 第 9 讲 · JSON 与 tsconfig.json：数据的登记表

📍 **对应文件**：`pi/tsconfig.json` 全文；`source-resolver.ts` 第 24–25 行（读它、解析它）

---

## 🤔 它们是干什么的？

### JSON：一种「写数据」的格式

JSON 不是编程语言，不会「做事」——它只是**一种把数据写成文字的统一格式**，方便人和程序互相传。能装的东西就五样：

| 种类 | 长这样 |
|---|---|
| 字符串 | `"hello"`（**必须双引号**） |
| 数字 | `42`、`1.5` |
| 布尔 | `true`、`false` |
| 数组 | `[…, …]` |
| 对象 | `{"键": 值, …}`（键必须双引号） |

三条铁律（和 JS 的对象写法很像，但更严）：

1. **键必须包双引号**；
2. **不许写注释**（没有 `//`）；
3. **最后一项后面不许多逗号**（尾随逗号报错）。

> 💡 冷知识：tsconfig.json 官方其实**特许写注释**（它用的是 JSON 的宽松表亲 JSONC），但 Pi 这份文件一行注释也没用——所以拿它当标准 JSON 学完全没问题。

### 程序怎么用它：`readFileSync` + `JSON.parse`

翻译官第 24–25 行是 JSON 文件的标准打开方式：

```ts
const tsconfig = JSON.parse(readFileSync(tsconfigPath, "utf8")) as TsConfig;
```

两步：`readFileSync(地址, "utf8")` 把文件**原样读成一大段文字**（`"utf8"` 是文字的编码格式，写上它才能正确读出中文等多字节字符）；`JSON.parse(文字)` 把这段文字**变成可以按格子取的数据**（对象）。一个「读进来」，一个「能查户口」。

### 打开 tsconfig.json 逛逛

`pi/tsconfig.json` 的结构，一层层看：

```json
{
	"extends": "./tsconfig.base.json",          ← 继承：先抄另一份配置的作业
	"compilerOptions": {                         ← 编译选项：TS 检查工具的行为规矩
		"noEmit": true,                           ← 只检查，不产出编译文件（所以 dist 才不存在！）
		"module": "NodeNext",
		"moduleResolution": "NodeNext",
		"paths": {                                ← 花名册本体：花名 → 地址清单
			"@earendil-works/pi-ai": ["./packages/ai/src/index.ts"],
			"@earendil-works/pi-ai/*": ["./packages/ai/src/*.ts", "…第二个候补…"]
		}
	},
	"include": ["packages/*/src/**/*", …],       ← 哪些文件归这份配置管
	"exclude": ["**/dist/**", …]                 ← 哪些文件除外
}
```

- **`extends`**：「在 `./tsconfig.base.json` 的基础上再补充」——`./` 表示「和本文件同一层」。第 9 讲的 `repositoryRoot` 正是为了找到它。
- **`noEmit: true`**：一个布尔值，顺手解释了 shell 站第 8 讲的悬案——为什么 `dist/` 目录不存在？因为这份配置明说「不产出编译文件」。
- **`paths`**：值是「对象套数组」——每个花名对应**一串**候补地址（所以翻译官要挨个试）。
- **`include` / `exclude` 里的 `*` 与 `**`**：和翻译卡片同款的**通配符**，但规矩多一点——`*` 匹配**一层**里的任意名字，`**` 匹配**任意多层**。`packages/*/src/**/*` 读作：「packages 下任意一个包 / 它的 src / 里面任意多层的所有东西」。

---

## 🧪 动手跑

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/j9-json

# ① 造一份五样俱全的 JSON，读成数据
cat > /Users/admin/Desktop/pi-study/c-pi/labs/j9-json/data.json <<'EOF'
{
	"name": "pi-ai",
	"version": "1.2.0",
	"stable": true,
	"entries": ["index.ts", "models.ts"],
	"address": {
		"dir": "packages/ai/src"
	}
}
EOF

cat > /Users/admin/Desktop/pi-study/c-pi/labs/j9-json/read-json.mjs <<'EOF'
// 把 data.json 从「文字」读成「数据」
import { readFileSync } from "node:fs";

const text = readFileSync(
	"/Users/admin/Desktop/pi-study/c-pi/labs/j9-json/data.json",
	"utf8",
);
console.log("① 读出来的原样是一大段文字，前 20 个字符:");
console.log("  ", JSON.stringify(text.slice(0, 20)));

const data = JSON.parse(text);
console.log("② JSON.parse 之后可以按格子取:");
console.log("   name =", data.name);
console.log("   stable =", data.stable);
console.log("   entries 有几个 =", data.entries.length);
console.log("   嵌套格子 address.dir =", data.address.dir);
EOF
node /Users/admin/Desktop/pi-study/c-pi/labs/j9-json/read-json.mjs

# ② 铁律验证：注释和尾随逗号都会被拒
node -e 'console.log(JSON.parse(`{"a": 1 // 注释}`))'
node -e 'console.log(JSON.parse(`{"a": 1,}`))'

# ③ 通配符 * 的真实效果：一句话列出所有包的 src 目录
ls -d /Users/admin/Desktop/pi-study/pi/packages/*/src | head -4
```

**预期输出**：

```text
① 读出来的原样是一大段文字，前 20 个字符:
   "{\n\t\"name\": \"pi-ai\",\n"
② JSON.parse 之后可以按格子取:
   name = pi-ai
   stable = true
   entries 有几个 = 2
   嵌套格子 address.dir = packages/ai/src
（② 的两条命令都报错：）
SyntaxError: Expected ',' or '}' after property value in JSON at position 8 …
SyntaxError: Expected double-quoted property name in JSON at position 8 …
（③ 列出真实目录：）
/Users/admin/Desktop/pi-study/pi/packages/agent/src
/Users/admin/Desktop/pi-study/pi/packages/ai/src
/Users/admin/Desktop/pi-study/pi/packages/chord/src
/Users/admin/Desktop/pi-study/pi/packages/codemode/src
```

- ① 里 `"\n\t\"name\"…"` 那些 `\n`、`\t` 是文字里的「换行」「缩进」的显示方式——说明读进来的确实只是**一大段生文字**；`JSON.parse` 之后才变成能 `data.name` 这样按格子取的数据。
- ② 两条报错各对应一条铁律：写注释不行、尾随逗号也不行。
- ③ 终端自己就会用 `*`：一条 `packages/*/src` 就把 17 个包的 src 全列出来了——和花名册里 `pi-ai/*` 的 `*` 是同一个思想。

---

## ✅ 小结

JSON 是写数据的格式：字符串、数字、布尔、数组、对象五样，键必须双引号、不许注释、不许尾随逗号。程序用 `readFileSync(地址, "utf8")` 读成文字、再 `JSON.parse` 变成可按格子取的数据。`tsconfig.json` 就是 JSON 格式的登记表：`extends` 继承别家、`compilerOptions.paths` 是翻译官的花名册、`include`/`exclude` 用 `*`（一层）和 `**`（任意多层）圈定管辖范围。

---

[← 上一讲](/j8-typescript) · [下一讲 · tsconfig.base.json 逐条 →](/j10-tsconfig-base)
