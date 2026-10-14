#!/usr/bin/env bash
if [[ "$1" == "--no-env" ]]; then
  unset MY_NAME
fi
node -e 'console.log("node 看到 MY_NAME =", process.env.MY_NAME ?? "(没有)")'
