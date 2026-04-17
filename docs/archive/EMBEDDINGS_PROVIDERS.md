# 国内 Embeddings 服务支持

## 可用的国内 Embeddings 服务

### 1. 有道 BCEmbedding API ✅ 推荐

**优势**：
- 🇨🇳 **国内服务**：网易有道提供，访问速度快
- 🌏 **中英双语**：专门优化中英文和跨语种能力
- 🎯 **RAG 优化**：专门为 RAG 场景优化
- 💰 **成本低**：比 OpenAI 更便宜
- 📊 **性能好**：在 MTEB 评测中表现优异

**API 文档**：
- 官方文档：https://ai.youdao.com/product-embedding.s
- GitHub：https://github.com/netease-youdao/BCEmbedding

**模型信息**：
- 模型名称：`bce-embedding-base_v1`
- 向量维度：768 维（比 OpenAI 的 1536 维小，但性能相当）
- 支持语言：中文、英文

### 2. 智谱 AI (GLM) Embeddings

**优势**：
- 🇨🇳 国内服务，清华大学技术
- 🌏 中文优化
- 💰 价格合理

**API 文档**：
- 官方网站：https://open.bigmodel.cn/

### 3. 阿里云通义千问 Embeddings

**优势**：
- 🇨🇳 阿里云服务
- 🌏 中文优化
- 🏢 企业级稳定性

**API 文档**：
- 官方文档：https://help.aliyun.com/zh/dashscope/

### 4. 百度文心 Embeddings

**优势**：
- 🇨🇳 百度服务
- 🌏 中文优化
- 💰 价格实惠

**API 文档**：
- 官方文档：https://cloud.baidu.com/doc/WENXINWORKSHOP/

## 实现方案

我将为你实现一个灵活的 embeddings provider 系统，支持：

1. **OpenAI** - 国际标准，质量最好
2. **有道 BCEmbedding** - 国内服务，中文优化
3. **智谱 AI** - 国内服务
4. **通义千问** - 阿里云服务
5. **文心一言** - 百度服务

## 配置方式

### 方式 1：在设置中配置（推荐）

```typescript
// 在 ProviderSettings 中添加 Embeddings Provider 选项
{
  embeddingsProvider: 'youdao', // 或 'openai', 'zhipu', 'qwen', 'wenxin'
  embeddingsApiKey: 'your-api-key',
  embeddingsBaseURL: 'https://api.youdao.com/v1', // 可选
  embeddingsModel: 'bce-embedding-base_v1' // 可选
}
```

### 方式 2：环境变量配置

```bash
# .env.local
VITE_EMBEDDINGS_PROVIDER=youdao
VITE_EMBEDDINGS_API_KEY=your-api-key
VITE_EMBEDDINGS_BASE_URL=https://api.youdao.com/v1
VITE_EMBEDDINGS_MODEL=bce-embedding-base_v1
```

## 使用示例

### 混合使用：DeepSeek Chat + 有道 Embeddings

```typescript
// Chat 配置
{
  provider: 'deepseek',
  apiKey: 'sk-deepseek-key',
  model: 'deepseek-chat'
}

// Embeddings 配置
{
  embeddingsProvider: 'youdao',
  embeddingsApiKey: 'youdao-api-key',
  embeddingsModel: 'bce-embedding-base_v1'
}
```

### 成本对比

| 服务 | 价格 | 向量维度 | 中文性能 |
|------|------|----------|----------|
| OpenAI | $0.00002/1K tokens | 1536 | 好 |
| 有道 BCEmbedding | ¥0.0001/1K tokens (~$0.000014) | 768 | 优秀 |
| 智谱 AI | ¥0.0001/1K tokens | 1024 | 优秀 |
| 通义千问 | ¥0.0007/1K tokens | 1536 | 优秀 |
| 文心一言 | ¥0.0004/1K tokens | 384 | 优秀 |

**结论**：有道 BCEmbedding 性价比最高，特别适合中文场景！

## 技术实现

### 1. 抽象 Embeddings Provider 接口

```typescript
// src/lib/embeddingsProvider.ts
interface EmbeddingsProvider {
  name: string;
  generateEmbedding(text: string): Promise<number[]>;
  batchGenerateEmbeddings(texts: string[]): Promise<number[][]>;
  dimensions: number;
}
```

### 2. 实现各个 Provider

```typescript
// OpenAI Provider
class OpenAIEmbeddingsProvider implements EmbeddingsProvider {
  name = 'openai';
  dimensions = 1536;
  // ...
}

// 有道 BCEmbedding Provider
class YoudaoEmbeddingsProvider implements EmbeddingsProvider {
  name = 'youdao';
  dimensions = 768;
  // ...
}
```

### 3. Provider 工厂

```typescript
function getEmbeddingsProvider(config: EmbeddingsConfig): EmbeddingsProvider {
  switch (config.provider) {
    case 'openai':
      return new OpenAIEmbeddingsProvider(config);
    case 'youdao':
      return new YoudaoEmbeddingsProvider(config);
    case 'zhipu':
      return new ZhipuEmbeddingsProvider(config);
    // ...
  }
}
```

## 下一步

我可以为你实现：

1. ✅ **Embeddings Provider 抽象层**
2. ✅ **有道 BCEmbedding 集成**（推荐，国内最好）
3. ✅ **智谱 AI 集成**
4. ✅ **通义千问集成**
5. ✅ **文心一言集成**
6. ✅ **在设置 UI 中添加 Embeddings Provider 选择**

你想先实现哪个？我建议从**有道 BCEmbedding**开始，因为：
- 专门为 RAG 优化
- 中英双语性能最好
- 成本最低
- 有完整的 API 文档

需要我现在开始实现吗？
