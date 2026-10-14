# 第 2 讲 · 找到自己的家（第 4 行）

📍 **位置**：`pi/pi-test.sh` 第 4 行

```bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
```

---

## 🤔 它是干什么的？

用一个变量 `SCRIPT_DIR` 记下**这个脚本自己住在哪个目录**，写成完整地址（绝对路径），存起来以后用。

为什么非要这一行？因为脚本后面要启动两个**住在它隔壁**的文件：`source-resolver.ts` 和 `src/cli.ts`（都在同一个 `pi/` 仓库里）。找你隔壁的人，得先知道自己住哪。

麻烦在于：你**可能在任何地方运行这个脚本**——在 `pi/` 里、在桌面上、在下载文件夹里。脚本只知道「你从哪里把我叫起来的」，这个信息常常是**相对地址**（比如 `r2-home/find-me.sh`），一搬家、一换地方就失效了。所以这行代码把它换算成**绝对地址**：`/Users/admin/Desktop/pi-study/c-pi/labs/r2-home` 这种从根目录写全的地址，写到纸上（存进变量），以后谁也别想赖账。

---

## 🧪 动手跑

实验里我们造一个「会搬家的脚本」，它运行到一半故意搬一次家，然后分别用「相对地址」和「绝对地址」去找自己的邻居文件。看哪种找得到：

```bash
mkdir -p /Users/admin/Desktop/pi-study/c-pi/labs/r2-home/子目录
cd /Users/admin/Desktop/pi-study/c-pi/labs/r2-home
echo "邻居文件" > neighbor.txt

cat > find-me.sh <<'EOF'
#!/usr/bin/env bash
DIR_A="$(dirname "$0")"                                  # 取法 A：相对地址
DIR_B="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"    # 取法 B：绝对地址（pi-test.sh 同款）

echo "脚本运行途中搬家……"
cd /Users/admin/Desktop/pi-study/c-pi/labs/r2-home/子目录

echo "取法 A（相对地址）：$DIR_A"
echo "取法 B（绝对地址）：$DIR_B"

if [ -f "$DIR_A/neighbor.txt" ]; then echo "取法 A → 找到邻居 ✓"; else echo "取法 A → 找不到邻居 ✗"; fi
if [ -f "$DIR_B/neighbor.txt" ]; then echo "取法 B → 找到邻居 ✓"; else echo "取法 B → 找不到邻居 ✗"; fi
EOF
chmod +x find-me.sh

echo "=== 在自己家里运行 ==="
./find-me.sh

echo "=== 从外面回来运行 ==="
cd /Users/admin/Desktop/pi-study/c-pi/labs && bash r2-home/find-me.sh
```

**预期输出**（两种方式的结果一样）：

```text
=== 在自己家里运行 ===
脚本运行途中搬家……
取法 A（相对地址）：.
取法 B（绝对地址）：/Users/admin/Desktop/pi-study/c-pi/labs/r2-home
取法 A → 找不到邻居 ✗
取法 B → 找到邻居 ✓
=== 从外面回来运行 ===
脚本运行途中搬家……
取法 A（相对地址）：r2-home
取法 B（绝对地址）：/Users/admin/Desktop/pi-study/c-pi/labs/r2-home
取法 A → 找不到邻居 ✗
取法 B → 找到邻居 ✓
```

结论：**相对地址会迷路，绝对地址永远找得到**。`pi-test.sh` 用的是取法 B，所以它无论被谁、从哪里调用，都能准确找到自己的两个邻居文件。

---

## 🔍 拆开看这行（选读）

```text
SCRIPT_DIR = "$( cd " $( dirname " ${BASH_SOURCE[0]} " ) " && pwd )"
                 │     │          │
                 │     │          └─ “启动我的那个文件名”（比如 r2-home/find-me.sh）
                 │     └─ 砍掉文件名，留下目录部分（r2-home）
                 └─ 进入这个目录，打印完整地址（/Users/admin/Desktop/pi-study/c-pi/labs/r2-home）
最外层的 $( ... ) 把打印出来的地址，存进变量 SCRIPT_DIR
```

里面的引号一个都不能少——路径里带空格时少一个引号就会裂开。

---

## ✅ 小结

第 4 行做一件事：**把自己的住址换算成绝对地址并记下来**。后面所有「找隔壁文件」的操作，都靠这个记下来的地址。

---

[← 上一讲](/r1-shebang-strict) · [下一讲 · 收参数与分拣 →](/r3-collect-args)
