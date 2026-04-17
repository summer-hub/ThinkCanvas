# 智谱 AI Embeddings 配置指南

## 1. 获取 API Key

### 访问智谱 AI 开放平台
1. 打开 https://open.bigmodel.cn/
2. 注册/登录账号
3. 进入控制台
4. 创建 API Key

### API Key 格式
```
格式：id.secret（用点号分隔）
示例：1234567890abcdef.1234567890abcdef1234567890abcdef
```

**重要**：
- API Key 由两部分组成，用点号 (`.`) 分隔
- 第一部分是 API Key ID
- 第二部分是 Secret
- 系统会自动将其转换为 JWT token 进行认证

## 2. 配置步骤

### 在 Ponder AI 中配置

1. **刷新页面** (Cmd+R / Ctrl+R)

2. **打开设置** 
   - 点击 Header 右侧的 ⚙️ 按钮

3. **配置 Chat Provider**（可选，如果想用智谱 AI 聊天）
   - Provider: 选择其他（如 DeepSeek）
   - API Key: 你的聊天 API Key
   - 或者继续使用 DeepSeek

4. **配置 Embeddings Provider**（重要）
   - 向下滚动到 "Embeddings Provider (for RAG)" 部分
   - Embeddings Provider: 选择 **"Zhipu AI (GLM)"**
   - Embeddings API Key: 粘贴你的智谱 AI API Key
   - 其他字段保持默认即可

5. **保存配置**
   - 点击 "Save" 按钮

## 3. 测试配置

### 运行 RAG 测试

1. **打开测试面板**
   - 点击 Header 右侧的 🧪 Test 按钮

2. **开始测试**
   - 点击"开始测试"按钮

3. **查看结果**

预期输出：
```
[时间] 🚀 开始 RAG 功能测试...
[时间] 📝 测试 1: 文本分块
[时间] ✅ 生成了 2 个文本块
[时间] 🔑 测试 2: API Key 检查
[时间] ✅ API Key 已配置
[时间]    ℹ️ 使用 Zhipu AI embeddings (embedding-2)
[时间] 🧮 测试 3: 嵌入生成
[时间]    生成嵌入向量...
[时间] ✅ 嵌入维度: 1024  ← 应该成功！
[时间] 📊 测试 4: 相似度计算
[时间]    相似度: 0.8234 ✅ 高相关
...
```

## 4. API 详细信息

### 端点
```
https://open.bigmodel.cn/api/paas/v4/embeddings
```

### 请求格式
```json
POST /api/paas/v4/embeddings
Headers:
  Content-Type: application/json
  Authorization: Bearer YOUR_API_KEY

Body:
{
  "model": "embedding-2",
  "input": "要生成向量的文本"
}
```

### 响应格式
```json
{
  "object": "list",
  "data": [
    {
      "object": "embedding",
      "embedding": [0.123, 0.456, ...],  // 1024 维向量
      "index": 0
    }
  ],
  "model": "embedding-2",
  "usage": {
    "prompt_tokens": 5,
    "total_tokens": 5
  }
}
```

## 5. 模型信息

### embedding-2
- **维度**: 1024
- **最大输入**: 512 tokens
- **语言**: 中文、英文
- **价格**: ¥0.0001/1K tokens
- **特点**: 
  - 中文优化
  - 语义理解能力强
  - 适合 RAG 场景

## 6. 成本估算

### 示例计算
- **索引 1 个 PDF**（10 页，约 5000 字）
  - Tokens: ~5000
  - 成本: ¥0.0005（约 $0.00007）

- **索引 100 个文档**
  - Tokens: ~500,000
  - 成本: ¥0.05（约 $0.007）

- **每次搜索查询**
  - Tokens: ~10
  - 成本: ¥0.000001（几乎免费）

### 与其他服务对比

| 服务 | 价格 | 维度 | 中文性能 |
|------|------|------|----------|
| OpenAI | $0.00002/1K | 1536 | 好 |
| **Zhipu AI** | ¥0.0001/1K (~$0.000014) | 1024 | 优秀 |
| Youdao | ¥0.0001/1K | 768 | 优秀 |
| Qwen | ¥0.0007/1K | 1536 | 优秀 |

**结论**: 智谱 AI 性价比高，中文性能优秀！

## 7. 常见问题

### Q1: API Key 格式错误

**错误信息**: `Zhipu API error: 401 Unauthorized`

**解决方法**:
1. 检查 API Key 是否正确复制（包含完整的格式）
2. 确认 API Key 没有过期
3. 检查账户余额是否充足

### Q2: 网络连接失败

**错误信息**: `Zhipu API error: Connection error`

**解决方法**:
1. 检查网络连接
2. 确认可以访问 https://open.bigmodel.cn/
3. 检查防火墙设置

### Q3: 嵌入维度不匹配

**错误信息**: `Vector dimensions mismatch`

**解决方法**:
1. 切换 embeddings provider 后需要重新索引所有文件
2. 清除旧的向量数据
3. 重新上传和索引文件

### Q4: 请求频率限制

**错误信息**: `Rate limit exceeded`

**解决方法**:
1. 等待几分钟后重试
2. 检查账户的 QPS 限制
3. 考虑升级账户套餐

## 8. 混合使用方案

### 推荐配置：DeepSeek Chat + 智谱 AI Embeddings

**优势**:
- ✅ **聊天**: DeepSeek 便宜且性能好
- ✅ **Embeddings**: 智谱 AI 中文优化
- ✅ **总成本**: 比纯 OpenAI 便宜 90%+
- ✅ **国内访问**: 速度快，稳定

**配置**:
```
Chat Provider:
  - Provider: DeepSeek
  - API Key: sk-b929a2e72349465c851c6c56dc69ce5a
  - Model: deepseek-chat

Embeddings Provider:
  - Provider: Zhipu AI (GLM)
  - API Key: your-zhipu-api-key
  - Model: embedding-2 (默认)
```

## 9. 下一步

配置完成后：

1. ✅ 运行 RAG 测试（应该全部通过）
2. ✅ 上传测试文件（PDF、Word、文本）
3. ✅ 测试文件索引功能
4. ✅ 测试语义搜索功能
5. ✅ 准备开始 v0.4.0 Phase 2（RAG 集成到 AI 聊天）

## 10. 技术支持

### 官方资源
- **官网**: https://open.bigmodel.cn/
- **文档**: https://open.bigmodel.cn/dev/api
- **SDK**: https://github.com/MetaGLM/zhipuai-sdk-java-v4
- **社区**: https://github.com/THUDM/GLM-4

### 问题反馈
如果遇到问题，可以：
1. 查看浏览器控制台错误信息
2. 检查 API 响应内容
3. 参考官方文档
4. 联系智谱 AI 技术支持

---

**准备好了吗？开始配置智谱 AI embeddings 吧！** 🚀

1. 获取 API Key: https://open.bigmodel.cn/
2. 刷新页面
3. 打开设置 (⚙️)
4. 配置 Embeddings Provider
5. 保存并测试 (🧪)
