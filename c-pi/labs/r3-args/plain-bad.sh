set -u
ARGS=()
echo "写法 B（直接展开）："
for x in "${ARGS[@]}"; do echo "  [$x]"; done
echo "  你看到我说明没崩（新 bash 不会崩）"
