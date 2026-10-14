#!/usr/bin/env bash
DIR_A="$(dirname "$0")"
DIR_B="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "脚本运行途中搬家……"
cd /Users/admin/Desktop/pi-study/c-pi/labs/r2-home/子目录
echo "取法 A（相对地址）：$DIR_A"
echo "取法 B（绝对地址）：$DIR_B"
if [ -f "$DIR_A/neighbor.txt" ]; then echo "取法 A → 找到邻居 ✓"; else echo "取法 A → 找不到邻居 ✗"; fi
if [ -f "$DIR_B/neighbor.txt" ]; then echo "取法 B → 找到邻居 ✓"; else echo "取法 B → 找不到邻居 ✗"; fi
