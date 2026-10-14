set -u
ARGS=()
echo "写法 A（带 + 条件）："
for x in ${ARGS[@]+"${ARGS[@]}"}; do echo "  [$x]"; done
echo "  没崩，安全通过 ✓"
