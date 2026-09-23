#!/usr/bin/env bash
# Render 生产环境启动脚本
# 功能：首次部署时，如果持久磁盘为空，把初始数据（题库、真题、配置等）复制到磁盘
# 这样磁盘挂载后不会盖住项目自带的静态数据

set -e

cd "$(dirname "$0")"

# 检查 data 目录是否为空（首次挂载持久磁盘时为空）
# 只检查 data 根目录下的 .json 文件，空子目录不算
if [ -z "$(find data -maxdepth 1 -name '*.json' 2>/dev/null | head -1)" ]; then
  echo "[init] 持久磁盘为空，从 data-seed 复制初始数据..."
  if [ -d "data-seed" ]; then
    # 复制所有内容到 data/（包括子目录）
    cp -r data-seed/. data/
    echo "[init] 初始数据复制完成"
  else
    echo "[init] 警告：未找到 data-seed 目录，跳过初始化"
  fi
else
  echo "[init] data 目录已有数据，跳过初始化"
fi

# 启动应用服务器
exec python dev_server.py --no-build --no-watch
