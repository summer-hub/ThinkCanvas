# 🌐 浏览器模式支持

## 问题说明

之前的版本只能在 Electron 桌面应用中使用 AI 功能，在浏览器中会报错：
```
Error: Electron IPC not available. Please run in Electron.
```

## ✅ 已修复

现在 Ponder AI 支持**两种运行模式**：

### 1. 浏览器模式（Web）
- 直接在浏览器中运行
- AI 功能通过 HTTP API 直接调用
- 无需安装 Electron
- 适合快速开发和测试

### 2. Electron 模式（桌面应用）
- 完整的桌面应用体验
- 通过 IPC 通信调用 AI
- 更好的性能和集成
- 适合生产使用

---

## 🚀 如何使用

### 浏览器模式（当前）

**启动命令**：
```bash
npm run dev
```

**访问地址**：
- http://localhost:5174/

**特点**：
- ✅ 快速启动
- ✅ 热更新
- ✅ 开发者工具
- ✅ AI 功能完全可用
- ⚠️ 需要网络连接（调用 AI API）

---

### Electron 模式

**启动命令**：
```bash
npm run electron:dev
```

**特点**：
- ✅ 桌面应用体验
- ✅ 原生窗口
- ✅ 系统集成
- ✅ 更好的性能
- ⚠️ 启动稍慢

---

## 🔧 技术实现

### 自动检测运行环境

```typescript
// 检查是否在 Electron 中
if (window.electron?.ai) {
  // 使用 Electron IPC
  await window.electron.ai.chat(params);
} else {
  // 直接调用 HTTP API
  await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
}
```

### 配置存储

**浏览器模式**：
- API Key: `localStorage.getItem('openai_api_key')`
- 提供商配置: `localStorage.getItem('ai_provider_config')`

**Electron 模式**：
- 通过 IPC 存储在主进程
- 更安全的密钥管理

---

## 📝 配置说明

### 自动配置（已完成）

应用启动时会自动从 `public/config.json` 加载配置：

```json
{
  "defaultProvider": "deepseek",
  "apiKey": "sk-b929a2e72349465c851c6c56dc69ce5a"
}
```

### 手动配置

1. 点击右上角 ⚙️ 设置按钮
2. 选择 AI 提供商
3. 输入 API Key
4. 点击保存

---

## 🌍 支持的 AI 提供商

### 浏览器模式支持
- ✅ DeepSeek (推荐)
- ✅ DeepSeek Chat
- ✅ OpenAI GPT-4o-mini
- ✅ OpenAI GPT-4o
- ✅ 任何 OpenAI 兼容的 API

### Electron 模式额外支持
- ✅ Ollama (本地模型)
- ✅ Groq
- ✅ Anthropic Claude
- ✅ 自定义提供商

---

## 🔒 安全性

### 浏览器模式
- ⚠️ API Key 存储在 localStorage
- ⚠️ 明文存储（浏览器标准）
- ✅ 不会发送到我们的服务器
- ✅ 只发送到你选择的 AI 提供商

### Electron 模式
- ✅ 更安全的密钥存储
- ✅ 系统级加密（可选）
- ✅ 不暴露给网页环境

### 建议
- 🔐 不要在公共电脑上使用
- 🔐 定期更换 API Key
- 🔐 使用环境变量（生产环境）

---

## 🐛 故障排除

### 问题 1: API 调用失败

**错误信息**：
```
Failed to communicate with AI service
```

**解决方案**：
1. 检查 API Key 是否正确
2. 检查网络连接
3. 检查 API 提供商状态
4. 打开浏览器控制台查看详细错误

---

### 问题 2: CORS 错误

**错误信息**：
```
Access to fetch at 'https://api.xxx.com' from origin 'http://localhost:5174' has been blocked by CORS policy
```

**原因**：
某些 AI 提供商不允许浏览器直接调用

**解决方案**：
1. 使用支持 CORS 的提供商（DeepSeek、OpenAI）
2. 或使用 Electron 模式
3. 或配置代理服务器

---

### 问题 3: API Key 未保存

**症状**：
刷新页面后需要重新配置

**解决方案**：
1. 检查浏览器是否禁用了 localStorage
2. 检查是否在隐私模式下
3. 清除浏览器缓存后重新配置

---

## 📊 性能对比

| 特性 | 浏览器模式 | Electron 模式 |
|------|-----------|--------------|
| 启动速度 | ⚡ 快 | 🐢 较慢 |
| 热更新 | ✅ 支持 | ⚠️ 需重启 |
| AI 调用 | 🌐 HTTP | 🔌 IPC |
| 内存占用 | 💚 低 | 💛 中等 |
| 安全性 | ⚠️ 一般 | ✅ 更好 |
| 本地模型 | ❌ 不支持 | ✅ 支持 |

---

## 🎯 推荐使用场景

### 使用浏览器模式
- ✅ 开发和调试
- ✅ 快速测试功能
- ✅ 演示和分享
- ✅ 不需要本地模型

### 使用 Electron 模式
- ✅ 日常使用
- ✅ 需要本地模型
- ✅ 需要更好的性能
- ✅ 需要系统集成

---

## 🔮 未来计划

### 浏览器模式改进
- [ ] Service Worker 支持（离线功能）
- [ ] IndexedDB 加密存储
- [ ] WebRTC 点对点通信
- [ ] PWA 支持（安装到桌面）

### Electron 模式改进
- [ ] 自动更新
- [ ] 系统托盘
- [ ] 全局快捷键
- [ ] 更好的窗口管理

---

## 📚 相关文档

- [QUICKSTART.md](./QUICKSTART.md) - 快速开始
- [SETUP_COMPLETE.md](./SETUP_COMPLETE.md) - 配置说明
- [README.md](./README.md) - 项目概览

---

**现在你可以在浏览器中正常使用 AI 功能了！** ✨

刷新页面后，创建一个节点并与 AI 对话试试吧！
