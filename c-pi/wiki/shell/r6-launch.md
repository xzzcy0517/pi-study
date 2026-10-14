# 第 6 讲 · 点火发射（第 59 行）

📍 **位置**：`pi/pi-test.sh` 第 59 行（最后一行）

```bash
node --import "$RESOLVER_URL" "$SCRIPT_DIR/packages/coding-agent/src/cli.ts" ${ARGS[@]+"${ARGS[@]}"}
```

---

## 🤔 它是干什么的？

全脚本的高潮：**叫 node 起来干活**。前面五讲的所有准备，都是为了这一行。

拆开看这一行让 node 做的三件事：

```text
node --import "翻译官的网址"   "Pi 主程序的地址"    你传过来的参数们
     │                      │                   │
     │                      │                   └─ 第 3 讲分好装的 ARGS 筐，原样递过去
     │                      └─ 入口文件 cli.ts（TypeScript 源码，node 直接读懂）
     └─ 在启动主程序之前，先加载“翻译官” source-resolver
```

三件依次发生的事：

1. **先加载翻译官**（`--import`）：在主程序开口说话之前，把「包名 → 源码」的翻译规则装好。装晚了就来不及了——所以必须用 `--import` 这种「抢跑」机制。
2. **启动主程序**：node 直接运行 `cli.ts` 这个 TypeScript 文件（不需要事先编译——新版 node 天生看得懂 TypeScript）。
3. **把参数递过去**：筐里的参数一字排开，跟在命令末尾。主程序一睁眼就能看到它们。

这一行执行完，bash 脚本就**全部下班**了——屏幕上接下来出现的一切（交互界面、模型回复）都是 node 里的 Pi 在表演。

---

## 🧪 动手跑

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/r6-launch
cd /Users/admin/Desktop/pi-study/c-pi/labs/r6-launch

# 实验 1：--import 的“抢跑”——翻译官先于主程序执行
cat > pre.mjs <<'EOF'
console.log("[翻译官] 我先到，给主程序铺路");
globalThis.MARK = true;
EOF
cat > main.mjs <<'EOF'
console.log("[主程序] 后启动；看到翻译官的标记了吗：", globalThis.MARK ? "看到了 ✓" : "没有 ✗");
EOF
node --import /Users/admin/Desktop/pi-study/c-pi/labs/r6-launch/pre.mjs /Users/admin/Desktop/pi-study/c-pi/labs/r6-launch/main.mjs
```

**预期输出**：

```text
[翻译官] 我先到，给主程序铺路
[主程序] 后启动；看到翻译官的标记了吗： 看到了 ✓
```

顺序是铁律：翻译官先跑完，主程序才启动，而且能看到翻译官留下的东西（这里是 `MARK` 标记；在 `pi-test.sh` 里，是「包名翻译规则」）。

```bash
# 实验 2：参数是怎么被“递过去”的
cat > final.mjs <<'EOF'
const args = process.argv.slice(2);
console.log("pi 收到了", args.length, "个参数：");
for (const a of args) console.log("  →", a);
EOF
```

> 💡 **`process.argv.slice(2)` 为什么从第 3 个开始切？**
>
> `process.argv` 是「整条命令的清单」，但**前两个位置被占用了**：
>
> | 位置 | 内容 |
> |---|---|
> | `[0]` | node 这个程序自己的地址 |
> | `[1]` | 正在运行的脚本文件（这里即 `final.mjs`） |
> | `[2]` 起 | **你真正传的参数** |
>
> `slice(2)` 就是「从第 3 个位置切一刀，留后面的」——把前两个内部占用项扔掉。自己看一眼最直观：

```bash
cat > show-argv.mjs <<'EOF'
console.log("argv 完整内容：");
process.argv.forEach((x, i) => console.log(`  [${i}] ${x}`));
console.log("slice(2) 之后（真正的参数）：", process.argv.slice(2));
EOF
node show-argv.mjs 参数甲 "参数 乙"
```

**预期输出**：

```text
argv 完整内容：
  [0] /Users/admin/.nvm/versions/node/v24.20.0/bin/node
  [1] /Users/admin/Desktop/pi-study/c-pi/labs/r6-launch/show-argv.mjs
  [2] 参数甲
  [3] 参数 乙
slice(2) 之后（真正的参数）： [ '参数甲', '参数 乙' ]
```

前两位是 node 自己和脚本文件，从 `[2]` 开始才是你传的——所以代码里写 `slice(2)`。

```bash
ARGS=("--model" "kimi" "你好 世界")
node /Users/admin/Desktop/pi-study/c-pi/labs/r6-launch/final.mjs ${ARGS[@]+"${ARGS[@]}"}
```

> 💡 这行末尾的 `${ARGS[@]+"${ARGS[@]}"}` 就是第 3 讲那个「条件展开」写法：筐里有货就把参数一个个递给 node，空筐也不崩。

**预期输出**：

```text
pi 收到了 3 个参数：
  → --model
  → kimi
  → 你好 世界
```

```bash
# 实验 3（真枪实弹）：回到 pi-test.sh 自己
cd /Users/admin/Desktop/pi-study/pi
./pi-test.sh --version
```

**预期输出**：

```text
1.1.0
```

看——打印出 Pi 的版本号，而不是脚本的。这正说明第 59 行的效果：脚本把控制权完整地交给了 Pi 本体。

再试两条，感受第 3 讲和第 4 讲的效果：

```bash
./pi-test.sh --no-env --version
```

```text
Running without API keys...
1.1.0
```

第一行是脚本打印的（第 4 讲的 `--no-env` 生效了），第二行是 Pi 打印的。

```bash
./pi-test.sh --help
```

出来的 Usage 帮助是 **Pi 的**帮助——`--help` 被脚本原样转交（第 3 讲的分拣）。

不带任何参数，就是真的启动 Pi 了：`./pi-test.sh` 回车，稍等片刻进入交互界面（退出：输入框为空时按 `Ctrl+D`，或连按两次 `Ctrl+C`）。

---

## ✅ 小结

第 59 行是发射按钮：`node --import 翻译官 主程序 参数`——先装翻译规则，再启动 Pi 主程序，同时把你筛好的参数递过去。脚本的任务到此 100% 完成。

---

[← 上一讲](/r5-path-to-url) · [毕业总结 →](/r7-summary)
