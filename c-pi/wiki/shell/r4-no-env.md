# 第 4 讲 · --no-env 与环境变量（第 17–55 行）

📍 **位置**：`pi/pi-test.sh` 第 17–55 行

```bash
if [[ "$NO_ENV" == "true" ]; then
  # Unset API keys (see packages/ai/src/env-api-keys.ts)
  unset ANTHROPIC_API_KEY
  unset ANTHROPIC_OAUTH_TOKEN
  unset OPENAI_API_KEY
  unset GEMINI_API_KEY
  …（一共 35 个 unset，全是各家 AI 的密钥变量名）…
  unset AZURE_OPENAI_RESOURCE_NAME
  echo "Running without API keys..."
fi
```

---

## 🤔 它是干什么的？

先纠正一个最常见的误会：**这一大串 `unset` 不是 Pi 内置的「套餐」**。

每一个名字（`ANTHROPIC_API_KEY`、`OPENAI_API_KEY`……）都只是**变量名**——可以理解成一排「储物柜的编号」。Pi 启动时会挨个查看这些柜子，里面放着钥匙（API key），就用钥匙去连接对应的 AI 服务。

`--no-env` 的作用是：启动之前，**把这 35 个柜子里的东西全部清空**。用来干嘛？测试「一个钥匙都不带」时 Pi 的表现（比如验证它会不会正确提示你去登录）。

三个关键事实：

1. **只在你带 `--no-env` 时才执行**。不带的话，这整段直接跳过。
2. **清空只影响这次启动**：它删的是「脚本和它启动的程序」能看到的柜子，**你终端里自己设置的变量不受影响**。
3. **删不存在的柜子不报错**，所以敢一口气删 35 个。

---

## 🧪 动手跑

环境变量可以理解成「每个程序出生时自带的行李清单」——父程序有的，子程序全都能看到。

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/r4-env
cd /Users/admin/Desktop/pi-study/c-pi/labs/r4-env

# 实验 1：行李会传给子程序
export MY_NAME=小明
node -e 'console.log("子程序看到 MY_NAME =", process.env.MY_NAME)'
```

**预期输出**：

```text
子程序看到 MY_NAME = 小明
```

我们在终端里设置的 `MY_NAME`，node 程序（作为终端的子程序）一启动就能看到。

```bash
# 实验 2：--no-env 的同款逻辑——带它就清空，不带就保留
cat > noenv.sh <<'EOF'
#!/usr/bin/env bash
if [[ "$1" == "--no-env" ]]; then
  unset MY_NAME
fi
node -e 'console.log("node 看到 MY_NAME =", process.env.MY_NAME ?? "(没有)")'
EOF

bash noenv.sh
bash noenv.sh --no-env
echo "我自己终端里的 MY_NAME 还在：$MY_NAME"
```

**预期输出**：

```text
node 看到 MY_NAME = 小明
node 看到 MY_NAME = (没有)
我自己终端里的 MY_NAME 还在：小明
```

三次输出讲了一个完整的故事：

- 不带参数：行李原样传递，node 看到 `小明`；
- 带 `--no-env`：脚本先把 `MY_NAME` 从行李里拿掉，node 就看到 `(没有)`；
- 实验结束后，**你自己的终端里 `MY_NAME` 安然无恙**——`unset` 只动脚本自己的行李，不碰你的。

`pi-test.sh` 里的 35 个 `unset`，做的事和上面一模一样，只是清的是 `OPENAI_API_KEY` 这些钥匙柜子。

---

## ✅ 小结

第 17–55 行是可选的「清空行李」步骤：只有带 `--no-env` 才执行；把 35 个密钥变量从环境里删掉，让这次启动「没带任何钥匙」；删完还会打印一句 `Running without API keys...` 提醒你。

---

[← 上一讲](/r3-collect-args) · [下一讲 · 把地址翻译成网址 →](/r5-path-to-url)
