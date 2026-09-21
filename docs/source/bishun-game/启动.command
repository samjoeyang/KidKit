#!/bin/bash
# 笔顺小屋 · 启动脚本（macOS 双击即可运行）
cd "$(dirname "$0")" || exit 1

# 找一个可用的 node
NODE_BIN=""
for p in \
  "$HOME/.workbuddy/binaries/node/versions/22.22.2-3/bin/node" \
  "$(command -v node 2>/dev/null)" \
  "/opt/homebrew/bin/node" \
  "/usr/local/bin/node"; do
  if [ -n "$p" ] && [ -x "$p" ]; then NODE_BIN="$p"; break; fi
done

if [ -z "$NODE_BIN" ]; then
  echo "未找到 Node.js，请先安装 Node 18+：https://nodejs.org"
  read -r -p "按回车键退出…"
  exit 1
fi

PORT=4175
if lsof -ti tcp:$PORT >/dev/null 2>&1; then
  echo "端口 $PORT 已被占用，可能服务已在运行。"
  echo "直接打开： http://localhost:$PORT"
  open "http://localhost:$PORT"
  exit 0
fi

echo "正在启动笔顺小屋…"
"$NODE_BIN" server.js &
SERVER_PID=$!
sleep 1.5
open "http://localhost:$PORT"
echo ""
echo "服务已启动： http://localhost:$PORT"
echo "关闭此窗口或按 Ctrl+C 即停止服务。"
wait $SERVER_PID
