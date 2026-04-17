# 🚀 ThinkCanvas - 快速开始指南

## 第一次运行

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 AI 提供商

你有三个选择：

#### 选项 A：使用 DeepSeek（推荐，性价比高）

1. 访问 [platform.deepseek.com](https://platform.deepseek.com)
2. 注册并获取 API Key
3. 启动应用后，点击右上角 ⚙️ 设置
4. 选择 "DeepSeek" 或 "DeepSeek Chat"
5. 输入你的 API Key

#### 选项 B：使用 OpenAI

1. 访问 [platform.openai.com](https://platform.openai.com)
2. 获取 API Key
3. 在应用设置中选择 "OpenAI"
4. 输入 API Key

#### 选项 C：使用本地 Ollama（完全免费，隐私最佳）

1. 安装 Ollama：
   ```bash
   # macOS
   brew install ollama
   
   # 或访问 https://ollama.com 下载
   ```

2. 启动 Ollama 并下载模型：
   ```bash
   ollama serve
   ollama pull llama3
   ```

3. 在应用设置中选择 "Ollama (Local)"
4. API Key 可以留空

### 3. 启动应用

#### Web 开发模式（推荐用于开发）
```bash
npm run dev
```
然后在浏览器打开 http://localhost:5173

#### Electron 模式（完整桌面体验）
```bash
npm run electron:dev
```

## 基础使用教程

### 创建你的第一个思维网络

1. **创建节点**
   - 双击画布空白处
   - 输入你的想法，比如 "如何提高工作效率"
   - 按 Enter 确认

2. **添加更多想法**
   - 继续双击创建更多节点
   - 比如 "时间管理"、"工具选择"、"习惯养成"

3. **连接想法**
   - 从一个节点的底部圆点拖动到另一个节点的顶部圆点
   - 建立想法之间的关联

4. **与 AI 对话**
   - 点击任意节点选中它
   - 右侧会打开 AI 对话面板
   - 输入问题，比如 "帮我分析这个想法的可行性"
   - AI 的回复会自动创建为新节点并连接

### 快捷键速查

| 快捷键 | 功能 |
|--------|------|
| 双击画布 | 创建新节点 |
| 双击节点 | 编辑节点内容 |
| Delete/Backspace | 删除选中的节点 |
| Escape | 取消选择 |
| 右键节点 | 打开上下文菜单 |
| Ctrl/Cmd + Enter | 在导入框中快速创建 |

### 导入大段文本

1. 点击右上角 "+ Import" 按钮
2. 粘贴你的文本内容
3. 用空行分隔段落，会自动创建多个节点
4. 按 Ctrl/Cmd + Enter 或点击 "Create Node"

### 自定义节点

1. **改变颜色**
   - 选中节点
   - 点击 Header 中的 "Color" 按钮
   - 或右键节点选择 "Change Color"
   - 选择你喜欢的颜色

2. **调整大小**
   - 选中节点
   - 拖动四个角的控制点
   - 调整到合适的尺寸

## 常见问题

### Q: AI 不响应怎么办？

**A:** 检查以下几点：
1. 确认已配置 API Key（点击 ⚙️ 设置查看）
2. 检查网络连接
3. 如果使用 Ollama，确认服务正在运行：`ollama serve`
4. 查看浏览器控制台是否有错误信息

### Q: 数据存储在哪里？

**A:** 所有数据都存储在本地浏览器的 IndexedDB 中，完全私密。
- 不会上传到任何服务器
- 只有 AI 对话内容会发送到 AI 提供商
- 可以随时导出数据（功能开发中）

### Q: 如何备份我的数据？

**A:** 当前版本数据存储在 IndexedDB 中，建议：
1. 定期截图保存重要内容
2. 使用浏览器的开发者工具导出 IndexedDB
3. 等待即将推出的导出功能

### Q: 可以离线使用吗？

**A:** 
- 画布功能完全离线可用
- AI 对话需要网络连接（除非使用本地 Ollama）
- 使用 Ollama 可以实现完全离线

### Q: 支持哪些 AI 模型？

**A:** 当前支持：
- DeepSeek Reasoner（推理能力强）
- DeepSeek Chat（响应快）
- OpenAI GPT-4o-mini
- OpenAI GPT-4o
- Groq（免费快速）
- Ollama 本地模型（Llama 3, Mistral 等）
- 任何 OpenAI 兼容的 API

## 进阶技巧

### 1. 构建知识体系

```
主题节点
  ├─ 子主题 1
  │   ├─ 细节 A
  │   └─ 细节 B
  ├─ 子主题 2
  └─ 子主题 3
```

用颜色区分不同层级或类别。

### 2. 头脑风暴模式

1. 快速创建多个节点（不用想太多）
2. 用 AI 帮助扩展每个想法
3. 连接相关的想法
4. 用颜色标记优先级

### 3. 研究笔记

1. 导入文章摘要或关键段落
2. 为每个段落创建节点
3. 用 AI 提问深入理解
4. 建立概念之间的连接

### 4. 项目规划

1. 创建项目目标节点
2. 分解为子任务
3. 用 AI 评估可行性
4. 用颜色标记状态（计划/进行中/完成）

## 开发相关

### 项目结构

```
thinkcanvas/
├── src/              # React 前端代码
├── electron/         # Electron 主进程
├── dist/             # 构建输出（Web）
├── dist-electron/    # Electron 构建输出
└── release/          # 打包的应用
```

### 开发命令

```bash
# 安装依赖
npm install

# Web 开发模式
npm run dev

# Electron 开发模式
npm run electron:dev

# 构建 Electron 主进程
npm run build:electron

# 完整构建
npm run build

# 预览生产构建
npm run preview
```

### 调试技巧

1. **Web 模式调试**
   - 使用浏览器开发者工具
   - React DevTools 扩展
   - 查看 Console 和 Network

2. **Electron 模式调试**
   - 主进程：在 `electron/main.ts` 中使用 `console.log`
   - 渲染进程：自动打开 DevTools
   - IPC 通信：在 preload 和 IPC handlers 中添加日志

## 下一步

- 查看 [PROGRESS.md](./PROGRESS.md) 了解开发进度
- 查看 [SPEC.md](./SPEC.md) 了解完整规格
- 查看 [README.md](./README.md) 了解项目概览

## 获取帮助

- 查看项目文档
- 提交 GitHub Issue
- 查看代码注释

---

**开始你的思考之旅吧！🌱**
