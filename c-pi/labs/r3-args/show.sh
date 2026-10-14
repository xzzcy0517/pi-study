#!/usr/bin/env bash
echo "一共收到 $# 个参数："
n=1
for arg in "$@"; do
  echo "  第 $n 个：[$arg]"
  n=$((n+1))
done
