# RAG Embeddings 配置说明

## 问题说明

你遇到的错误 `Embedding generation failed: Connection error` 是因为：

**DeepSeek API 不支持 embeddings 端点**

- DeepSeek 只提供聊天 API（chat completions）
- OpenAI 的 `text-embedding-3-small` 模型是 OpenAI 特有的
- RAG 功能需要使用 embeddings API 来生成文档的向量表示

## 解决方案

### 方案 1：使用 OpenAI API Key（推荐）✅

RAG 功能需要 OpenAI API Key 来生成 embeddings。你可以：

1. **获取 OpenAI API Key**
   - 访问 https://platform.openai.com/api-keys
   - 创建一个新的 API Key
   - 复制 Key（格式：`sk-...`）

2. **配置 OpenAI Provider**
   - 点击 Header 中的 ⚙️ 按钮
   - 选择 "OpenAI" provider
   - 输入你的 OpenAI API Key
   - 点击 Save

3. **混合使用**
   - **Embeddings**：使用 OpenAI（用于文档索引和搜索）
   - **Chat**：可以继续使用 DeepSeek（用于对话）
   - 两者可以独立配置

### 方案 2：使用 DeepSeek 聊天 + OpenAI Embeddings

如果你想继续使用 DeepSeek 进行聊天，但使用 OpenAI 进行文档索引：

1. **保存 OpenAI API Key**
   ```javascript
   // 在浏览器控制台执行
   localStorage.setItem('openai_api_key', 'sk-your-openai-key-here');
   ```

2. **DeepSeek 聊天配置保持不变**
   - 继续使用 DeepSeek API Key 进行聊天
   - RAG 功能会自动使用 OpenAI API Key 生成 embeddings

## 代码修改说明

我已经修改了 `src/lib/embeddings.ts`，现在它会：

1. **强制使用 OpenAI API** 进行 embeddings
   ```typescript
   const openai = new OpenAI({
     apiKey,
     baseURL: 'https://api.openai.com/v1', // 固定使用 OpenAI
     dangerouslyAllowBrowser: true,
   });
   ```

2. **从 localStorage 读取 `openai_api_key`**
   - 即使你使用 DeepSeek 聊天
   - RAG 功能也会使用 OpenAI embeddings

## 成本说明

### OpenAI Embeddings 成本

- **模型**：`text-embedding-3-small`
- **价格**：$0.00002 / 1K tokens（非常便宜）
- **示例**：
  - 索引一个 10 页的 PDF（约 5000 字）：~$0.0001（不到 1 分钱）
  - 索引 100 个文档：~$0.01（1 分钱）
  - 每次搜索查询：~$0.00001（几乎免费）

### DeepSeek Chat 成本

- **模型**：`deepseek-chat`
- **价格**：¥0.001 / 1K tokens（约 $0.00014）
- **比 OpenAI 便宜很多**

### 混合使用的优势

- ✅ **聊天使用 DeepSeek**：便宜且性能好
- ✅ **Embeddings 使用 OpenAI**：成本极低，质量高
- ✅ **总成本**：比纯 OpenAI 便宜 90%+

## 测试步骤

### 1. 配置 OpenAI API Key

```bash
# 方法 1：通过 UI
1. 点击 Header 中的 ⚙️ 按钮
2. 选择 OpenAI
3. 输入 API Key
4. 点击 Save

# 方法 2：通过控制台
localStorage.setItem('openai_api_key', 'sk-your-key-here');
```

### 2. 运行 RAG 测试

```bash
1. 点击 Header 中的 🧪 Test 按钮
2. 点击"开始测试"
3. 查看测试结果
```

### 3. 预期结果

```
[05:48:08] 🚀 开始 RAG 功能测试...
[05:48:08] 📝 测试 1: 文本分块
[05:48:08] ✅ 生成了 2 个文本块
[05:48:08] 🔑 测试 2: API Key 检查
[05:48:08] ✅ API Key 已配置
[05:48:08]    ℹ️ 使用 OpenAI embeddings API (text-embedding-3-small)
[05:48:08] 🧮 测试 3: 嵌入生成
[05:48:08]    生成嵌入向量...
[05:48:10] ✅ 嵌入维度: 1536  ← 应该成功！
[05:48:10] 📊 测试 4: 相似度计算
[05:48:10]    相似度: 0.8234 ✅ 高相关
...
```

## 常见问题

### Q1: 我必须使用 OpenAI 吗？

**A**: 目前是的。OpenAI 的 embeddings API 是行业标准，质量最好且成本极低。未来可能会支持：
- 本地 embeddings 模型（如 BGE、E5）
- 其他云服务（如 Cohere、Voyage AI）

### Q2: 我可以只用 DeepSeek 吗？

**A**: 不行。DeepSeek 不提供 embeddings API。但你可以：
- 使用 OpenAI embeddings（成本极低）
- 使用 DeepSeek 聊天（便宜且好用）
- 两者结合，获得最佳性价比

### Q3: 为什么不支持本地 embeddings？

**A**: 本地 embeddings 模型（如 BGE）需要：
- 下载大型模型文件（~500MB）
- 在浏览器中运行推理（慢且占内存）
- 复杂的 WebAssembly 或 ONNX 集成

OpenAI embeddings API 更简单、更快、成本更低。

### Q4: 我的 OpenAI API Key 会被滥用吗？

**A**: 不会。你的 API Key：
- 只存储在浏览器 localStorage 中
- 只用于 embeddings API 调用
- 每次调用成本极低（$0.00002/1K tokens）
- 你可以在 OpenAI 控制台设置使用限额

### Q5: 如何监控 API 使用情况？

**A**: 访问 https://platform.openai.com/usage
- 查看每日使用量
- 设置使用限额
- 查看成本明细

## 下一步

配置好 OpenAI API Key 后：

1. ✅ 运行 RAG 测试（应该全部通过）
2. ✅ 上传一些测试文件（PDF、Word、文本）
3. ✅ 测试文件索引功能
4. ✅ 测试语义搜索功能
5. ✅ 准备开始 v0.4.0 Phase 2 实现（RAG 集成到 AI 聊天）

## 技术细节

### Embeddings API 调用

```typescript
// src/lib/embeddings.ts
const openai = new OpenAI({
  apiKey: localStorage.getItem('openai_api_key'),
  baseURL: 'https://api.openai.com/v1', // 固定使用 OpenAI
  dangerouslyAllowBrowser: true,
});

const response = await openai.embeddings.create({
  model: 'text-embedding-3-small', // 1536 维度
  input: text,
});

const embedding = response.data[0].embedding; // number[]
```

### 为什么需要 embeddings？

1. **文档索引**：将文档分块并转换为向量
2. **语义搜索**：将查询转换为向量，找到相似文档
3. **上下文检索**：为 AI 聊天提供相关文档片段

### 向量相似度计算

```typescript
// 余弦相似度：衡量两个向量的方向相似性
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// 相似度范围：[0, 1]
// > 0.8: 高度相关
// 0.6-0.8: 中度相关
// 0.5-0.6: 低度相关
// < 0.5: 不相关（过滤掉）
```

---

**配置好 OpenAI API Key 后，重新运行测试即可！** 🚀
