# 第 3 讲 · 收参数与分拣（第 7–15 行）

📍 **位置**：`pi/pi-test.sh` 第 7–15 行

```bash
NO_ENV=false
ARGS=()
for arg in "$@"; do
  if [[ "$arg" == "--no-env" ]]; then
    NO_ENV=true
  else
    ARGS+=("$arg")
  fi
done
```

---

## 🤔 它是干什么的？

想象快递分拣：**你敲的一串参数是快递**，脚本站在传送带前逐个检查——

- 写着 `--no-env` 的包裹，**脚本自己留下**（放进 `NO_ENV` 这个标记）；
- 其余的，**原封不动转交给 Pi**（放进 `ARGS` 这个筐）。

所以脚本本身只认**一个**参数 `--no-env`；你传的其他东西（`--help`、`--model`、"你好"……）它看都不看内容，直接转交。Pi 主程序里有专门的部门负责解析那几十个参数。

为什么要分拣？因为 `--no-env` 是**脚本层**的开关（跟 bash 有关），而 `--model` 之类是 **Pi 层**的开关。混在一筐里会互相干扰，所以先分好。

---

## 🧪 动手跑

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/r3-args
cd /Users/admin/Desktop/pi-study/c-pi/labs/r3-args

# 实验 1：脚本是怎么“看到”你传的参数的
cat > show.sh <<'EOF'
#!/usr/bin/env bash
echo "一共收到 $# 个参数："
n=1
for arg in "$@"; do
  echo "  第 $n 个：[$arg]"
  n=$((n+1))
done
EOF
bash show.sh 苹果 香蕉 "大西瓜 半个"
```

**预期输出**：

```text
一共收到 3 个参数：
  第 1 个：[苹果]
  第 2 个：[香蕉]
  第 3 个：[大西瓜 半个]
```

注意第 3 个参数：我们打引号传的是**一个**东西（"大西瓜 半个"），脚本收到的也是**一个**（中括号里完整保留）。**引号就是给参数加的「保鲜膜」，保证它不被拆散。**

```bash
# 实验 2：分拣——留下 --no-env，其余转交
cat > filter.sh <<'EOF'
#!/usr/bin/env bash
ARGS=()
for arg in "$@"; do
  if [[ "$arg" == "--no-env" ]]; then
    echo "（--no-env 被脚本自己留下了）"
  else
    ARGS+=("$arg")
  fi
done
echo "剩下的转交给 pi："
for x in ${ARGS[@]+"${ARGS[@]}"}; do
  echo "  [$x]"
done
echo "（转交完毕，共 ${#ARGS[@]} 个）"
EOF

echo "=== 带参数 ==="
bash filter.sh --no-env --model kimi-k2.6 "你好 世界"

echo "=== 一个参数都不给 ==="
bash filter.sh
```

> 💡 **`${ARGS[@]+"${ARGS[@]}"}` 为什么写了两遍 `ARGS[@]`？**
>
> 这是一套「**条件展开**」写法，两遍 `ARGS[@]` 分工完全不同：
>
> ```text
> ${ ARGS[@] + "${ARGS[@]}" }
>   └─┬─┘   └──────┬──────┘
>     │            └─ 后半截：条件成立时，真正拿出来的值（全部元素，带引号防拆散）
>     └─ 前半截：条件本身——「这个数组存在吗？」
> ```
>
> 整句读作：**如果 `ARGS` 数组存在，就把它的全部元素放这儿；不存在，就什么都别放**（连空字符串都不留）。
>
> 为什么非要多此一举？因为 macOS 自带的 bash 是老版本（3.2，2007 年的），再配上第 1 讲的纪律 `set -u`：空数组直接写 `"${ARGS[@]}"` 会被当成「使用了没定义的东西」**当场报错崩掉**。`pi-test.sh` 要兼容 macOS 的老 bash，所以用这个写法换取「空数组也不崩」。新一点的 bash 没这个毛病，但为了兼容就必须这么写。
>
> 内层引号 `"${ARGS[@]}"` 也少不了：它保证 `"你好 世界"` 这种带空格的元素**完整地**作为一个，不被拆成两个。
>
> 跑一组对比就懂了（你的机器就是 bash 3.2，可以直接复现）：

```bash
cd /Users/admin/Desktop/pi-study/c-pi/labs/r3-args

printf 'set -u\nARGS=()\necho "写法 A（带 + 条件）："\nfor x in ${ARGS[@]+"${ARGS[@]}"}; do echo "  [$x]"; done\necho "  没崩，安全通过 ✓"\n' > plus-ok.sh
printf 'set -u\nARGS=()\necho "写法 B（直接展开）："\nfor x in "${ARGS[@]}"; do echo "  [$x]"; done\necho "  你看到我说明没崩（新 bash 不会崩）"\n' > plain-bad.sh

echo "=== 写法 A ==="; bash plus-ok.sh
echo "=== 写法 B ==="; bash plain-bad.sh 2>&1; echo "  退出码 $?"
```

**预期输出**：

```text
=== 写法 A ===
写法 A（带 + 条件）：
  没崩，安全通过 ✓
=== 写法 B ===
写法 B（直接展开）：
plain-bad.sh: line 4: ARGS[@]: unbound variable
  退出码 1
```

写法 A 平安全通过；写法 B 在 bash 3.2 上直接报错退出。`pi-test.sh` 第 59 行用的就是写法 A——筐里有没有货，它都不出事。

**预期输出**：

```text
=== 带参数 ===
（--no-env 被脚本自己留下了）
剩下的转交给 pi：
  [--model]
  [kimi-k2.6]
  [你好 世界]
（转交完毕，共 3 个）
=== 一个参数都不给 ===
剩下的转交给 pi：
（转交完毕，共 0 个）
```

看：带参数时，`--no-env` 被留下，剩下 3 个原样进筐；一个参数都不给时，筐是空的，也安然无恙。

---

## ✅ 小结

第 7–15 行是一个分拣台：逐个查看你传的参数，`--no-env` 留下，其余装进 `ARGS` 筐里，等启动 Pi 时一并递过去。到这里，脚本已经做好了准备，只差最后一步「点火」。

---

[← 上一讲](/r2-find-my-home) · [下一讲 · --no-env 与环境变量 →](/r4-no-env)
