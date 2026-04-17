# 🔬 RAG 集成技术调研

> 为 Ponder AI 选择最佳的 RAG（检索增强生成）方案

## 目标

实现以下核心功能：
1. **@文件引用**：在 AI 对话中使用 `@filename` 引用文件
2. **语义搜索**：根据查询内容自动检索相关文件片段
3. **上下文注入**：将检索到的内容注入到 AI Prompt 中
4. **引用追踪**：显示 AI 回复的信息来源

---

## 方案对比

### 方案 1：纯前端方案（推荐 ⭐⭐⭐⭐⭐）

**技术栈**：
- **向量存储**：IndexedDB（已有）
- **嵌入模型**：OpenAI Embeddings API
- **检索**：前端计算余弦相似度

**优点**：
- ✅ 无需后端服务器
- ✅ 完全本地化，隐私保护
- ✅ 部署简单，用户无需配置
- ✅ 与现有架构一致
- ✅ 开发速度快

**缺点**：
- ⚠️ 依赖 OpenAI API（需要网络）
- ⚠️ 嵌入计算需要调用外部 API
- ⚠️ 大量文件时性能可能下降

**实现复杂度**：⭐⭐ (低)

**成本**：
- OpenAI Embeddings: $0.0001 / 1K tokens
- 示例：10 个文档，每个 5000 tokens = $0.005

---

### 方案 2：Chroma + 本地嵌入模型

**技术栈**：
- **向量数据库**：Chroma（Python）
- **嵌入模型**：本地 BGE 模型
- **后端**：FastAPI

**优点**：
- ✅ 完全本地化，无需外部 API
- ✅ 性能好，适合大规模数据
- ✅ 专业的向量数据库

**缺点**：
- ❌ 需要 Python 后端
- ❌ 需要用户安装依赖
- ❌ 部署复杂度高
- ❌ 跨平台兼容性问题
- ❌ 开发时间长

**实现复杂度**：⭐⭐⭐⭐⭐ (高)

---

### 方案 3：混合方案

**技术栈**：
- **向量存储**：IndexedDB
- **嵌入模型**：OpenAI API（默认）+ 本地模型（可选）
- **检索**：前端

**优点**：
- ✅ 灵活性高
- ✅ 用户可选择
- ✅ 渐进式增强

**缺点**：
- ⚠️ 实现复杂
- ⚠️ 维护成本高

**实现复杂度**：⭐⭐⭐⭐ (中高)

---

## 推荐方案：纯前端方案

### 理由

1. **符合产品定位**
   - Ponder AI 是桌面应用，强调本地存储
   - 用户已经在使用 OpenAI API
   - 无需额外配置

2. **开发效率**
   - 2-3 周可完成
   - 无需学习新技术栈
   - 与现有代码无缝集成

3. **用户体验**
   - 零配置，开箱即用
   - 与 AI 对话流程一致
   - 响应速度快

4. **可扩展性**
   - 未来可以添加本地模型支持
   - 可以迁移到 Chroma（如果需要）

---

## 技术实现方案

### 1. 文本分块策略

**目标**：将长文档分割成适合检索的小块

**策略**：
```typescript
interface TextChunk {
  id: string;
  fileId: string;
  content: string;
  embedding: number[];
  metadata: {
    chunkIndex: number;
    startChar: number;
    endChar: number;
  };
}

// 分块参数
const CHUNK_SIZE = 500; // 字符数
const CHUNK_OVERLAP = 50; // 重叠字符数
```

**分块算法**：
1. 按段落分割
2. 如果段落太长，按句子分割
3. 保持 chunk 之间有重叠，避免语义断裂

---

### 2. 嵌入生成

**使用 OpenAI Embeddings API**：
```typescript
import OpenAI from 'openai';

async function generateEmbedding(text: string): Promise<number[]> {
  const openai = new OpenAI({ apiKey: API_KEY });
  
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small', // 便宜且高效
    input: text,
  });
  
  return response.data[0].embedding;
}
```

**模型选择**：
- `text-embedding-3-small`: 1536 维，$0.00002 / 1K tokens
- `text-embedding-3-large`: 3072 维，$0.00013 / 1K tokens

**推荐**：使用 `text-embedding-3-small`，性价比最高

---

### 3. 向量存储

**使用 IndexedDB 存储嵌入向量**：
```typescript
// 存储结构
interface VectorStore {
  chunks: Map<string, TextChunk>;
  index: {
    fileId: string;
    chunkIds: string[];
  }[];
}

// 存储到 IndexedDB
await set('vector-store', vectorStore);
```

---

### 4. 相似度搜索

**余弦相似度计算**：
```typescript
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

async function searchSimilarChunks(
  query: string,
  topK: number = 3
): Promise<TextChunk[]> {
  // 1. 生成查询的嵌入
  const queryEmbedding = await generateEmbedding(query);
  
  // 2. 计算与所有 chunk 的相似度
  const chunks = await getAllChunks();
  const similarities = chunks.map(chunk => ({
    chunk,
    similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));
  
  // 3. 排序并返回 top K
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK)
    .map(item => item.chunk);
}
```

---

### 5. @文件引用语法

**解析 @文件引用**：
```typescript
// 输入：用户消息
// "请分析 @research.pdf 中的主要观点"

// 解析函数
function parseFileReferences(message: string): {
  cleanMessage: string;
  fileRefs: string[];
} {
  const fileRefRegex = /@([^\s]+\.(pdf|docx|txt|md))/gi;
  const fileRefs: string[] = [];
  
  const cleanMessage = message.replace(fileRefRegex, (match, filename) => {
    fileRefs.push(filename);
    return `[文件: ${filename}]`;
  });
  
  return { cleanMessage, fileRefs };
}
```

**检索流程**：
```typescript
async function retrieveContext(
  message: string,
  fileRefs: string[]
): Promise<string> {
  // 1. 如果有明确的文件引用，只在这些文件中搜索
  if (fileRefs.length > 0) {
    const chunks = await searchInFiles(message, fileRefs, topK: 3);
    return formatContext(chunks);
  }
  
  // 2. 否则，在所有文件中搜索
  const chunks = await searchSimilarChunks(message, topK: 3);
  return formatContext(chunks);
}

function formatContext(chunks: TextChunk[]): string {
  return chunks
    .map((chunk, i) => `[来源 ${i + 1}]\n${chunk.content}`)
    .join('\n\n---\n\n');
}
```

---

### 6. AI Prompt 增强

**注入检索到的上下文**：
```typescript
async function enhancePrompt(
  userMessage: string,
  fileRefs: string[]
): Promise<string> {
  // 1. 检索相关内容
  const context = await retrieveContext(userMessage, fileRefs);
  
  // 2. 构建增强的 Prompt
  const enhancedPrompt = `
你是一个知识助手。请基于以下参考资料回答用户的问题。

## 参考资料
${context}

## 用户问题
${userMessage}

## 回答要求
1. 基于参考资料回答
2. 如果参考资料不足，说明需要更多信息
3. 引用来源时使用 [来源 X] 标记
`;
  
  return enhancedPrompt;
}
```

---

## 实现步骤

### Phase 1: 基础设施（1 周）
1. ✅ 创建文本分块工具
2. ✅ 集成 OpenAI Embeddings API
3. ✅ 实现向量存储（IndexedDB）
4. ✅ 实现相似度搜索

### Phase 2: 文件处理（3-4 天）
1. ✅ 文件上传时自动分块
2. ✅ 生成嵌入向量
3. ✅ 存储到向量数据库
4. ✅ 后台处理，不阻塞 UI

### Phase 3: AI 集成（3-4 天）
1. ✅ 解析 @文件引用
2. ✅ 检索相关内容
3. ✅ 增强 AI Prompt
4. ✅ 显示引用来源

### Phase 4: UI 优化（2-3 天）
1. ✅ @文件自动补全
2. ✅ 引用来源高亮
3. ✅ 检索状态反馈
4. ✅ 相关性评分显示

---

## 性能优化

### 1. 嵌入缓存
```typescript
// 缓存已生成的嵌入，避免重复计算
const embeddingCache = new Map<string, number[]>();

async function getCachedEmbedding(text: string): Promise<number[]> {
  const hash = hashString(text);
  if (embeddingCache.has(hash)) {
    return embeddingCache.get(hash)!;
  }
  
  const embedding = await generateEmbedding(text);
  embeddingCache.set(hash, embedding);
  return embedding;
}
```

### 2. 批量处理
```typescript
// 批量生成嵌入，减少 API 调用
async function batchGenerateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts, // 一次最多 2048 个
  });
  
  return response.data.map(item => item.embedding);
}
```

### 3. 增量索引
```typescript
// 只为新文件生成嵌入
async function indexNewFiles() {
  const allFiles = await getAllFiles();
  const indexedFileIds = await getIndexedFileIds();
  
  const newFiles = allFiles.filter(
    file => !indexedFileIds.includes(file.id)
  );
  
  for (const file of newFiles) {
    await indexFile(file);
  }
}
```

---

## 成本估算

### OpenAI Embeddings 成本
- **模型**：text-embedding-3-small
- **价格**：$0.00002 / 1K tokens
- **示例**：
  - 10 个文档，每个 5000 tokens
  - 总 tokens：50,000
  - 成本：$0.001（不到 1 分钱）

### 结论
成本极低，完全可接受。

---

## 风险和挑战

### 1. 网络依赖
- **风险**：需要调用 OpenAI API
- **缓解**：缓存嵌入，减少 API 调用

### 2. 性能
- **风险**：大量文件时搜索变慢
- **缓解**：
  - 限制文件数量
  - 使用 Web Worker 进行计算
  - 实现增量索引

### 3. 准确性
- **风险**：检索结果不相关
- **缓解**：
  - 调整分块大小
  - 使用混合检索（关键词 + 向量）
  - 允许用户调整相关性阈值

---

## 未来扩展

### 1. 本地嵌入模型
- 使用 ONNX Runtime 在浏览器中运行模型
- 完全离线工作
- 需要下载模型文件（~100MB）

### 2. 混合检索
- 结合关键词搜索和向量搜索
- 提高检索准确性

### 3. 重排序
- 使用 Cross-Encoder 对检索结果重排序
- 提高相关性

---

## 决策

**选择方案 1：纯前端方案**

**理由**：
1. 开发速度快（2-3 周）
2. 用户体验好（零配置）
3. 成本低（几乎免费）
4. 可扩展性好（未来可添加本地模型）

**下一步**：
开始实现 Phase 1 - 基础设施

---

**技术调研完成！准备开始开发！** 🚀
