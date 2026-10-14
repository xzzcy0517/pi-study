# 第 5 讲 · 把地址翻译成网址（第 57–58 行）

📍 **位置**：`pi/pi-test.sh` 第 57–58 行

```bash
# --import takes a module specifier, so pass the resolver as a file URL (raw paths break on #, ?, %).
RESOLVER_URL="$(node -p 'require("node:url").pathToFileURL(process.argv[1]).href' "$SCRIPT_DIR/packages/coding-agent/src/experimental/source-resolver.ts")"
```

---

## 🤔 它是干什么的？

第 58 行用一个小 node 命令，把一个**文件地址**（比如 `/Users/admin/Desktop/pi-study/c-pi/labs/r5-url/文件夹#1/greet.mjs`）翻译成**网址格式**（`file:///…%231/greet.mjs`），存进 `RESOLVER_URL`。

为什么要翻译？因为下一行要用 `node --import` 去加载一个模块，而 `--import` 只认**网址格式**的地址。直接塞文件地址，遇到目录名里带 `#`、`?`、`%` 这类字符就会**解析错乱**——`#` 在网址里有特殊含义（后面的内容会被当成「锚点」丢掉）。

上面的注释（第 57 行）说的就是这个意思：

> `--import` takes a module specifier, so pass the resolver as a file URL (raw paths break on `#`, `?`, `%`).
>
> （`--import` 接收的是模块标识符，所以要传网址；裸路径遇到 `#`、`?`、`%` 会坏。）

被加载的这个 `source-resolver.ts` 是干嘛的？它是个「翻译官」，Pi 启动时要靠它把包名（`@earendil-works/xxx`）指向各包的源码。它必须在主程序之前加载——这就是下一讲 `--import` 的任务。

---

## 🧪 动手跑

我们故意造一个**名字里带 `#`** 的目录，看看直接给路径和先翻译再给，结果差多少：

```bash
mkdir -p "/Users/admin/Desktop/pi-study/c-pi/labs/r5-url/文件夹#1"
cat > "/Users/admin/Desktop/pi-study/c-pi/labs/r5-url/文件夹#1/greet.mjs" <<'EOF'
console.log("greet 模块加载成功");
EOF

echo "--- 把路径直接塞给 node --import（含 #）---"
node --import "/Users/admin/Desktop/pi-study/c-pi/labs/r5-url/文件夹#1/greet.mjs" -e 'console.log("主程序")' 2>&1 | head -2

echo "--- 先转成 file:// 网址 ---"
URL=$(node -p 'require("node:url").pathToFileURL(process.argv[1]).href' "/Users/admin/Desktop/pi-study/c-pi/labs/r5-url/文件夹#1/greet.mjs")
echo "转换结果：$URL"
node --import "$URL" -e 'console.log("主程序")'
```

> 💡 **`-e` 是什么？** node 有两种用法：
>
> | 用法 | 含义 |
> |---|---|
> | `node 文件名` | 运行一个写好的 .js/.mjs 文件（第 6 讲的主程序就是这种） |
> | `node -e '代码'` | **不写文件，直接运行引号里这段代码**（e = evaluate，「求值/执行」） |
>
> 这个实验里我们只是临时需要一个「主程序」来配合 `--import`，不值得专门建个文件，所以用 `-e` 现场编了一行。注意外面用**单引号**：把这段代码原封不动交给 node，别让 bash 先拆散它。
>
> 随手试一下：

```bash
node -e 'console.log("你好，我没有文件也能跑")'
node -e 'console.log("1 + 1 =", 1 + 1)'
```

> **预期输出**：
>
> ```text
> 你好，我没有文件也能跑
> 1 + 1 = 2
> ```
>
> 💡 **`node -p` 又是什么？** 上面讲的是 `-e`（执行）。`-p` 是它的「打印版」——**执行代码，并把结果直接打印出来**（p = print）。适合「帮我算个东西给我看」的场合，相当于 node 自带的计算器。
>
> | 写法 | 效果 |
> |---|---|
> | `node -e '代码'` | 只执行，想看得自己写 `console.log(...)` |
> | `node -p '代码'` | 执行 + **自动打印最后一行的结果** |
>
> ```bash
> node -p '1 + 1'          # 算个加法
> node -p '"你好" + "世界"'  # 拼个字符串
> node -e '1 + 1'          # 对比：-e 不打印，屏幕什么都没有
> ```
>
> **预期输出**：
>
> ```text
> 2
> 你好世界
> （屏幕什么都没多出来——-e 不会自动打印）
> ```
>
> 现在回看第 58 行整句就通了：`node -p '…把路径翻译成网址…'`，**算完直接打印**出网址；外层再用 `$( )`（第 2 讲讲过）把这个打印结果接住，存进 `RESOLVER_URL`。


**预期输出**：

```text
--- 把路径直接塞给 node --import（含 #）---
node:internal/modules/esm/resolve:272
    throw new ERR_MODULE_NOT_FOUND(
--- 先转成 file:// 网址 ---
转换结果：file:///Users/admin/Desktop/pi-study/c-pi/labs/r5-url/%E6%96%87%E4%BB%B6%E5%A4%B9%231/greet.mjs
greet 模块加载成功
主程序
```

- 第一次直接给路径：node 报错了（它把 `#` 后面的内容当锚点丢掉了，找不到文件）。
- 第二次先翻译：`#` 被编码成了 `%23`，中文也被安全编码，模块顺利加载，主程序跑了起来。

`pi-test.sh` 第 58 行做的事和第二次一模一样——借 node 自带的翻译函数，把地址转成网址，保证万无一失。

---

## ✅ 小结

第 57–58 行：用 node 把「翻译官文件」的地址转成网址格式存好，为下一行的正式加载做准备。翻译的原因是 `--import` 只认网址，而网址格式能安全处理 `#`、`?`、`%` 这些特殊字符。

---

[← 上一讲](/r4-no-env) · [下一讲 · 点火发射 →](/r6-launch)
