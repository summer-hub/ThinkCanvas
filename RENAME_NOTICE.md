# 🔄 项目重命名通知

## 原因

原项目名称 "Ponder AI" 与现有商业软件重名，为避免混淆和潜在的商标问题，我们将项目重命名为 **ThinkCanvas**。

## 新名称

**ThinkCanvas** - 思维画布

寓意：
- **Think** - 思考、思维
- **Canvas** - 画布、创作空间
- 结合起来代表"思维的画布"，一个让想法自由流动和连接的空间

## 更改内容

### 1. 项目标识
- ✅ 包名：`ponder-ai` → `thinkcanvas`
- ✅ 应用名：`Ponder AI` → `ThinkCanvas`
- ✅ App ID：`com.ponderai.app` → `com.thinkcanvas.app`

### 2. 用户界面
- ✅ Header 标题
- ✅ 欢迎屏幕
- ✅ 导出文件标题
- ✅ 浏览器标题

### 3. 文档
- ✅ README.md
- ✅ QUICKSTART.md
- ✅ TODO.md
- ✅ CHANGELOG.md
- ✅ 键盘快捷键文档
- ✅ 产品说明文档

### 4. 代码
- ✅ 国际化文件（中文/英文）
- ✅ 导出功能
- ✅ 启动脚本

## 迁移指南

### 对于开发者

如果你已经克隆了项目：

```bash
# 1. 更新远程仓库 URL（如果仓库名称也改变）
git remote set-url origin <new-repo-url>

# 2. 重新安装依赖（可选，但推荐）
rm -rf node_modules package-lock.json
npm install

# 3. 清理旧的构建文件
rm -rf dist dist-electron release

# 4. 重新构建
npm run build
```

### 对于用户

- 应用功能完全不变
- 所有数据和设置保持不变
- 只是名称和图标更新

## 版本信息

- **重命名版本**: v0.5.0+
- **重命名日期**: 2024-04-17
- **影响范围**: 仅名称和标识，功能无变化

## 常见问题

### Q: 我的数据会丢失吗？
A: 不会。所有数据存储在 IndexedDB 中，与应用名称无关。

### Q: 需要重新配置 AI 提供商吗？
A: 不需要。配置存储在 localStorage 中，会自动保留。

### Q: 旧版本的导出文件还能用吗？
A: 可以。文件格式完全兼容，只是导出时的标题会显示新名称。

### Q: 为什么选择 ThinkCanvas？
A: 
1. 避免与现有商业软件重名
2. 更直观地表达产品核心价值
3. 易于记忆和传播
4. 国际化友好

## 相关链接

- [README](./README.md) - 项目概览
- [QUICKSTART](./QUICKSTART.md) - 快速开始
- [CHANGELOG](./CHANGELOG.md) - 更新日志

---

**感谢你的理解和支持！** 🙏

如有任何问题，请提交 Issue 或联系开发团队。
