# 🚀 GitHub 推送指南

## 当前状态

✅ 代码已提交到本地 Git 仓库
- 提交: `99ca7f2` - feat: v0.5.0 完整功能更新
- 分支: `main`
- 文件: 146 个文件更改，29,845 行新增

## 推送到 GitHub 的步骤

### 方法 1: 创建新仓库（推荐）

#### 1. 在 GitHub 上创建新仓库

访问 https://github.com/new 创建新仓库：

- **仓库名称**: `thinkcanvas` 或 `ThinkCanvas`
- **描述**: An infinite canvas for thinking with AI
- **可见性**: Public 或 Private（根据需要选择）
- **不要**勾选 "Initialize this repository with a README"（我们已经有了）

#### 2. 添加远程仓库并推送

创建仓库后，GitHub 会显示推送命令。在终端执行：

```bash
# 添加远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/thinkcanvas.git

# 推送到 GitHub
git push -u origin main
```

或者使用 SSH（如果已配置 SSH key）：

```bash
git remote add origin git@github.com:YOUR_USERNAME/thinkcanvas.git
git push -u origin main
```

### 方法 2: 推送到现有仓库

如果你已经有一个仓库：

```bash
# 添加远程仓库
git remote add origin <你的仓库URL>

# 推送（可能需要强制推送）
git push -u origin main --force
```

## 验证推送

推送成功后，访问你的 GitHub 仓库页面，应该能看到：

- ✅ 所有文件和文件夹
- ✅ README.md 显示在首页
- ✅ 提交历史
- ✅ 最新提交信息

## 后续操作

### 1. 设置仓库描述和主题

在 GitHub 仓库页面：
- 点击 "About" 旁边的齿轮图标
- 添加描述: "An infinite canvas for thinking with AI"
- 添加主题标签: `ai`, `canvas`, `knowledge-management`, `electron`, `react`, `typescript`

### 2. 创建 Release（可选）

```bash
# 创建标签
git tag -a v0.5.0 -m "Release v0.5.0: 智能文档分析、三栏布局、Agent/Inspire模式"

# 推送标签
git push origin v0.5.0
```

然后在 GitHub 上创建 Release：
- 访问仓库的 "Releases" 页面
- 点击 "Create a new release"
- 选择标签 `v0.5.0`
- 填写 Release 说明（可以从 CHANGELOG.md 复制）
- 上传构建好的 DMG 文件（可选）

### 3. 更新 README 中的链接

如果需要，更新 README.md 中的仓库链接：

```bash
# 编辑 README.md，更新链接
git add README.md
git commit -m "docs: update repository links"
git push
```

## 常见问题

### Q: 推送时要求输入用户名和密码？

A: GitHub 已不再支持密码认证，需要使用 Personal Access Token (PAT)：

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 选择权限（至少需要 `repo`）
4. 生成并复制 token
5. 推送时使用 token 作为密码

或者配置 SSH key（推荐）：
https://docs.github.com/en/authentication/connecting-to-github-with-ssh

### Q: 推送失败，提示 "rejected"？

A: 可能是远程仓库有不同的历史。使用强制推送：

```bash
git push -u origin main --force
```

⚠️ 注意：强制推送会覆盖远程仓库的历史，确保这是你想要的。

### Q: 如何更改远程仓库地址？

```bash
# 查看当前远程仓库
git remote -v

# 更改远程仓库地址
git remote set-url origin <新的仓库URL>
```

## 项目信息

- **项目名称**: ThinkCanvas
- **版本**: v0.5.0
- **许可证**: 未指定（建议添加 LICENSE 文件）
- **技术栈**: Electron, React, TypeScript, Zustand, React Flow

## 下一步

推送成功后，你可以：

1. 📝 添加 LICENSE 文件
2. 🏷️ 添加 GitHub Topics
3. 📦 设置 GitHub Actions（自动构建）
4. 📊 启用 GitHub Pages（文档站点）
5. 🐛 设置 Issue 模板
6. 🤝 添加 CONTRIBUTING.md

---

**需要帮助？** 查看 [GitHub 文档](https://docs.github.com/) 或提交 Issue。
