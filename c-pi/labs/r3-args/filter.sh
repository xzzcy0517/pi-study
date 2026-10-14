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
