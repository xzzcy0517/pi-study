# 第 30 讲 · 去掉 JSON 开头的 BOM

> **对应源码**：`pi/packages/coding-agent/src/utils/text.ts:1-9`

---

## 一句话

BOM 是部分 UTF-8 文件开头的隐形字符，肉眼看不见，却能让 `JSON.parse()` 直接报错。`text.ts` 只有两个函数：`splitBom()` 把 BOM 和正文拆开，`stripBom()` 只留正文。

## 什么是 BOM

BOM（Byte Order Mark，字节顺序标记）是文件开头的一小段标记，用来告诉读取程序“这是 UTF-8”。

问题在于：有些程序会把它当成文件内容的一部分。解码成字符串后，它就是开头的一个 `U+FEFF` 字符。

看起来像这样：

```text
（看不见的 BOM）{"name":"pi"}
```

人眼看不出区别，但 `JSON.parse()` 会认为第一个字符不是 `{`，于是报错。

## 源码

```ts
/** Split a leading UTF-8 byte order mark from decoded text. */
export function splitBom(content: string): { bom: string; text: string } {
	return content.startsWith("\uFEFF") ? { bom: "\uFEFF", text: content.slice(1) } : { bom: "", text: content };
}

/** Remove a leading UTF-8 byte order mark from decoded text. */
export function stripBom(content: string): string {
	return splitBom(content).text;
}
```

## splitBom：拆成两部分

```ts
splitBom("\uFEFFhello");
// { bom: "\uFEFF", text: "hello" }

splitBom("hello");
// { bom: "", text: "hello" }
```

- 开头有 BOM：`bom` 是那个字符，`text` 去掉它；
- 开头没有：`bom` 是空字符串，`text` 原样返回。

## stripBom：只要正文

```ts
stripBom("\uFEFF{\"a\":1}");
// '{"a":1}'
```

`stripBom()` 只是 `splitBom().text` 的快捷方式。`config.ts` 读取 `package.json` 时用的就是它：

```ts
pkg = JSON.parse(stripBom(readFileSync(packageJsonPath, "utf-8"))) as PackageJson;
```

顺序不能反：**先读文件 → 去 BOM → 再 JSON.parse**。

## 只处理开头的一个 BOM

```ts
content.startsWith("\uFEFF") ? ... : ...
```

只检查第一个字符。如果文件开头连续有两个 BOM：

```text
BOM BOM hello
```

`splitBom()` 只去掉第一个，第二个会留在 `text` 里。这不是 bug——正常的 UTF-8 文件最多只有一个 BOM。

## 动手跑：观察 BOM 的行为

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a30

cat > /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a30/bom.mts <<'EOF'
import {
	splitBom,
	stripBom,
} from "/Users/admin/Desktop/pi-study/pi/packages/coding-agent/src/utils/text.ts";

// ① 带 BOM：拆成 bom 和正文
const withBom = splitBom("\uFEFFhello");
console.log("① 带 BOM:");
console.log("  bom 的码点:", withBom.bom.codePointAt(0)?.toString(16));
console.log("  text:", JSON.stringify(withBom.text), "长度:", withBom.text.length);

// ② 不带 BOM：bom 是空字符串
const withoutBom = splitBom("hello");
console.log("\n② 无 BOM:");
console.log("  bom:", JSON.stringify(withoutBom.bom), "text:", JSON.stringify(withoutBom.text));

// ③ stripBom 只取正文
console.log("\n③ stripBom:", JSON.stringify(stripBom("\uFEFF{\"a\":1}")));

// ④ 连续两个 BOM：只去掉第一个
const twice = splitBom("\uFEFF\uFEFFhello");
console.log("\n④ 两个 BOM:");
console.log("  text 开头仍是 BOM:", twice.text.startsWith("\uFEFF"));
console.log("  text 长度:", twice.text.length);

// ⑤ 直接 JSON.parse 带 BOM 的文本会失败
try {
	JSON.parse("\uFEFF{\"a\":1}");
} catch (error) {
	console.log("\n⑤ 直接 parse 报错:", error.message);
}
EOF

node /Users/admin/Desktop/pi-study/c-pi/labs/coding-agent/a30/bom.mts
```

**预期输出**（报错措辞可能因 Node 版本略有不同）：

```text
① 带 BOM:
  bom 的码点: feff
  text: "hello" 长度: 5

② 无 BOM:
  bom: "" text: "hello"

③ stripBom: "{\"a\":1}"

④ 两个 BOM:
  text 开头仍是 BOM: true
  text 长度: 6

⑤ 直接 parse 报错: Unexpected token '﻿', "﻿{"a":1}" is not valid JSON
```

## 观察点

1. `bom` 的码点是 `feff`，这就是 `U+FEFF`；
2. 去掉 BOM 后 `hello` 长度是 5；
3. `stripBom` 之后是合法的 JSON 文本；
4. 两个 BOM 只去掉一个，长度 6 = 剩下一个 BOM + 5 个字母；
5. 不去 BOM 直接 parse 会报错。

## 为什么这个 9 行文件值得单独一讲

因为它保护的是**所有读取配置文件的入口**：

```text
package.json
settings.json
models.json
auth.json
其他用户配置
```

只要有一个文件被编辑器加上了 BOM，没有 `stripBom()` 就会启动失败。这类问题非常隐蔽——文件看起来完全正常。

## 小结

- BOM 是文件开头的 `U+FEFF`，可能让 JSON 解析失败；
- `splitBom()` 同时返回 BOM 和正文；
- `stripBom()` 只返回正文；
- 只处理开头的一个 BOM；
- `config.ts` 读取 `package.json` 时用了 `stripBom()`。

## 下一讲预告

所有文件都读完了。最后一讲把整条 `setupCli()` 链路完整复盘一遍，并回答“它到底做了什么、没做什么”。

---

## 自测

1. BOM 在字符串里对应哪个码点？
2. `splitBom()` 和 `stripBom()` 的区别是什么？
3. 开头有两个 BOM 时，`stripBom()` 会去掉几个？
4. 为什么 `JSON.parse()` 遇到 BOM 会失败？
