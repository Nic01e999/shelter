#!/bin/bash
cd "$(dirname "$0")"

# 设置虚拟环境变量
export VIRTUAL_ENV="$(pwd)/backend/.venv"
export PATH="$VIRTUAL_ENV/bin:$PATH"

# 启动后端服务器（使用虚拟环境的 Python）
backend/.venv/bin/python3 server.py &
BACKEND_PID=$!

# 启动前端服务器
python3 -m http.server 9998 &
FRONTEND_PID=$!

echo "后端服务器: http://localhost:9999"
echo "前端服务器: http://localhost:9998"
echo ""
echo "按 Ctrl+C 停止服务器"

# 捕获退出信号
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM

wait
