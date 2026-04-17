#!/bin/bash

# ThinkCanvas - 启动脚本

echo "🌱 ThinkCanvas - 启动中..."
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未找到 Node.js"
    echo "请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"
echo "✅ npm 版本: $(npm -v)"
echo ""

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
    echo ""
fi

# 显示配置信息
echo "🔧 配置信息："
echo "   - API 提供商: DeepSeek"
echo "   - API Key: sk-b929...ce5a (已配置)"
echo "   - 自动配置: 已启用"
echo ""

# 启动开发服务器
echo "🚀 启动开发服务器..."
echo ""
echo "📝 访问地址将在下方显示"
echo "💡 按 Ctrl+C 停止服务器"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm run dev
