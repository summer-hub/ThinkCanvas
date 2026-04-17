#!/bin/bash

# ThinkCanvas - GitHub 推送脚本

echo "🚀 ThinkCanvas - GitHub 推送助手"
echo ""

# 检查是否已配置远程仓库
if git remote | grep -q "origin"; then
    echo "✅ 远程仓库已配置"
    git remote -v
    echo ""
    read -p "是否要推送到现有仓库？(y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📤 正在推送..."
        git push -u origin main
        if [ $? -eq 0 ]; then
            echo "✅ 推送成功！"
        else
            echo "❌ 推送失败，可能需要强制推送"
            read -p "是否要强制推送？(y/n) " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                git push -u origin main --force
                echo "✅ 强制推送完成"
            fi
        fi
    fi
else
    echo "⚠️  未配置远程仓库"
    echo ""
    echo "请按照以下步骤操作："
    echo ""
    echo "1. 在 GitHub 上创建新仓库: https://github.com/new"
    echo "   - 仓库名称: thinkcanvas"
    echo "   - 不要勾选 'Initialize with README'"
    echo ""
    echo "2. 创建后，复制仓库 URL"
    echo ""
    read -p "请输入仓库 URL (例如: https://github.com/username/thinkcanvas.git): " repo_url
    
    if [ -n "$repo_url" ]; then
        echo ""
        echo "📝 添加远程仓库..."
        git remote add origin "$repo_url"
        
        echo "📤 推送到 GitHub..."
        git push -u origin main
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ 推送成功！"
            echo ""
            echo "🎉 你的代码已经在 GitHub 上了！"
            echo "访问: $repo_url"
        else
            echo ""
            echo "❌ 推送失败"
            echo ""
            echo "可能的原因："
            echo "1. 仓库 URL 不正确"
            echo "2. 没有权限（需要配置 SSH key 或 Personal Access Token）"
            echo "3. 远程仓库已有内容"
            echo ""
            echo "请查看 GITHUB_SETUP.md 获取详细帮助"
        fi
    else
        echo "❌ 未输入仓库 URL，操作取消"
    fi
fi

echo ""
echo "📚 更多帮助请查看: GITHUB_SETUP.md"
