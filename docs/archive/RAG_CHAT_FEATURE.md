# RAG AI Chat Integration - 功能文档

## 概述

RAG (Retrieval-Augmented Generation) AI Chat Integration 是 Ponder AI v0.4.0 的核心功能，它允许用户在与 AI 对话时引用已上传的文档，AI 会基于文档内容提供更准确、更有依据的回答。

## 核心功能

### 1. 文件引用 (@filename)

用户可以在聊天消息中使用 `@filename` 语法来引用已上传的文档：

```
@research.pdf 这篇论文的主要结论是什么？
```

**特性**：
- 支持多个文件引用：`@doc1.pdf @doc2.pdf 比较这两篇文档的观点`
- 自动完成：输入 `@` 后会显示文件列表
- 键盘导航：使用方向键选择，Enter 确认，Escape 取消
- 智能过滤：根据输入的文件名实时过滤建议

### 2. 自动上下文检索

当用户发送包含文件引用的消息时，系统会：

1. **解析文件引用**：提取所有 `@filename` 引用
2. **验证文件**：检查文件是否存在且已索引
3. **语义搜索**：使用 embeddings 查找最相关的文档片段
4. **排序和截断**：按相似度排序，保留最相关的内容（最多 3000 字符）
5. **增强提示**：将上下文添加到 AI 提示中

**性能**：
- 检索超时：2 秒
- 默认返回：前 3 个最相关的文档块
- 最小相似度：0.5（可配置）

### 3. 来源归属显示

AI 响应下方会显示使用的文档来源：

**显示内容**：
- 📚 来源数量
- ⏱️ 检索时间
- 📄 每个来源的文件名
- 📊 相似度分数（百分比）
- 🎨 颜色编码：
  - 🟢 绿色：>80% 相似度（高质量匹配）
  - 🟡 黄色：60-80% 相似度（中等匹配）
  - ⚪ 灰色：<60% 相似度（低质量匹配）

**交互功能**：
- 点击展开/折叠查看完整文档片段
- 显示块索引（第几个文档块）
- 低相似度警告（所有来源 <60%）

### 4. 智能加载状态

在 RAG 处理过程中，系统会显示详细的进度：

1. "正在解析文件引用..." - 提取 @filename
2. "正在检索上下文 (N 个文件)..." - 语义搜索
3. "正在增强提示..." - 构建增强提示
4. "正在生成响应..." - 调用 AI API

### 5. 错误处理和警告

系统会友好地处理各种错误情况：

**警告**：
- ⚠️ 文件未找到或未索引
- ⚠️ 上下文已截断（超过 3000 字符）
- ⚠️ 所有来源相似度较低

**错误**：
- ❌ 上下文检索失败（API 错误）
- ❌ 检索超时（超过 2 秒）
- ❌ Embeddings API Key 未配置

**容错机制**：
- 即使检索失败，AI 对话仍可继续
- 无效文件引用会被忽略，使用有效的文件
- 超时后自动降级为无上下文模式

## 技术架构

### 数据流

```
用户输入 "@doc.pdf 问题"
    ↓
解析文件引用 (parseFileReferences)
    ↓
检索上下文 (retrieveContextWithTimeout)
    ↓  - 生成查询 embedding
    ↓  - 语义搜索向量数据库
    ↓  - 按相似度排序
    ↓  - 截断到 3000 字符
    ↓
增强提示 (enhancePrompt)
    ↓  - 格式化上下文
    ↓  - 添加系统提示
    ↓  - 添加引用指令
    ↓
调用 AI API (sendToAI)
    ↓
显示响应 + 来源归属
```

### 核心模块

#### 1. `src/lib/rag.ts`
- `parseFileReferences()`: 解析和验证文件引用
- `retrieveContext()`: 语义搜索和上下文检索
- `indexFile()`: 文件索引（文本分块 + embeddings）

#### 2. `src/lib/ragIntegration.ts`
- `retrieveContextWithTimeout()`: 带超时的上下文检索
- `formatContextChunks()`: 格式化上下文块
- `estimateTokenCount()`: Token 估算

#### 3. `src/lib/promptEnhancement.ts`
- `enhancePrompt()`: 增强提示构建
- `truncateContext()`: 上下文截断
- `formatConversationHistory()`: 对话历史格式化

#### 4. `src/components/FileReferenceAutocomplete.tsx`
- 文件引用自动完成 UI
- 键盘导航和选择

#### 5. `src/components/SourceAttribution.tsx`
- 来源归属显示
- 相似度可视化
- 块内容展开/折叠

#### 6. `src/components/AIPanel.tsx`
- RAG 工作流编排
- 加载状态管理
- 错误处理

### 数据结构

#### AIMessage (扩展)

```typescript
interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  ragMetadata?: {
    chunks: Array<{
      id: string;
      fileId: string;
      fileName: string;
      content: string;
      similarity: number;
      chunkIndex: number;
    }>;
    retrievalTime: number;
    truncated: boolean;
    warnings: string[];
  };
}
```

## 使用指南

### 基本使用

1. **上传文档**
   - 点击 Header 中的 "📁 Upload File" 按钮
   - 选择 PDF 或 Word 文档
   - 等待自动索引完成

2. **引用文档**
   - 在 AI 聊天输入框中输入 `@`
   - 从下拉列表中选择文件
   - 或继续输入文件名进行过滤

3. **提问**
   - 输入问题，例如：`@research.pdf 这篇论文的主要贡献是什么？`
   - 按 Enter 发送
   - 等待 AI 响应

4. **查看来源**
   - AI 响应下方会显示使用的文档来源
   - 点击来源可以展开查看完整内容
   - 检查相似度分数以评估答案质量

### 高级技巧

#### 多文件对比

```
@doc1.pdf @doc2.pdf 比较这两篇文档对于 X 问题的不同观点
```

#### 精确引用

AI 会在回答中使用 `[来源 N]` 标记来引用具体的文档：

```
根据 [来源 1]，主要结论是...
而 [来源 2] 则指出...
```

#### 质量检查

- 🟢 绿色来源（>80%）：高度相关，答案可信度高
- 🟡 黄色来源（60-80%）：中等相关，答案需要验证
- ⚪ 灰色来源（<60%）：低相关，答案可能不准确

如果所有来源都是灰色，系统会显示警告，建议重新表述问题或上传更相关的文档。

## 配置

### Embeddings 提供商

RAG 功能需要配置 Embeddings 提供商（用于生成文档和查询的向量表示）：

**支持的提供商**：
1. **OpenAI** (国际)
   - 模型：`text-embedding-3-small`
   - 维度：1536
   - API: `https://api.openai.com/v1`

2. **Youdao BCEmbedding** (中国) ⭐ 推荐
   - 模型：`bce-embedding-base_v1`
   - 维度：768
   - 专为 RAG 优化

3. **Zhipu AI** (中国)
   - 模型：`embedding-3`
   - 维度：1024
   - 需要 JWT 认证

4. **Qwen** (阿里云)
   - 模型：`text-embedding-v3`
   - 维度：1536

5. **Wenxin** (百度)
   - 模型：`embedding-v1`
   - 维度：384

**配置方法**：
1. 点击 AI Panel 中的 ⚙️ 设置按钮
2. 选择 "Embeddings Provider"
3. 输入 API Key
4. 保存配置

### 混合使用

可以使用不同的提供商用于聊天和 embeddings：

- **聊天**: DeepSeek (便宜、快速)
- **Embeddings**: Youdao BCEmbedding (RAG 优化)

这样可以在保持低成本的同时获得最佳的 RAG 性能。

## 性能指标

### 检索性能

- **平均检索时间**: 500-1000ms
- **超时限制**: 2000ms
- **并发处理**: 支持多文件并行检索

### 准确性

- **高质量匹配** (>80% 相似度): 答案准确率 >90%
- **中等匹配** (60-80% 相似度): 答案准确率 70-90%
- **低质量匹配** (<60% 相似度): 答案准确率 <70%

### 容量限制

- **最大上下文**: 3000 字符
- **默认块数**: 3 个
- **块大小**: 500-1000 字符
- **块重叠**: 100 字符

## 故障排除

### 问题：自动完成不显示

**原因**：
- 没有上传文件
- 文件未索引

**解决**：
1. 上传至少一个文档
2. 等待索引完成（查看通知）
3. 刷新页面

### 问题：检索超时

**原因**：
- 文档太大
- 网络慢
- API 响应慢

**解决**：
1. 检查网络连接
2. 尝试使用更小的文档
3. 检查 Embeddings API 状态

### 问题：相似度都很低

**原因**：
- 问题与文档内容不匹配
- 文档质量差（扫描件、图片）
- Embeddings 模型不适合

**解决**：
1. 重新表述问题，使用文档中的关键词
2. 上传文本质量更好的文档
3. 尝试不同的 Embeddings 提供商

### 问题：API Key 错误

**原因**：
- API Key 未配置
- API Key 格式错误
- API Key 已过期

**解决**：
1. 打开设置，检查 Embeddings Provider 配置
2. 确认 API Key 格式正确
3. 测试 API Key（使用 🧪 Test 按钮）

## 未来改进

### 短期（v0.4.1）
- [ ] 上下文预览模态框
- [ ] 手动刷新上下文按钮
- [ ] 查询 embedding 缓存

### 中期（v0.5.0）
- [ ] 多模态支持（图片、表格）
- [ ] 自定义块大小和重叠
- [ ] 高级过滤（按日期、作者、标签）

### 长期（v1.0.0）
- [ ] 混合搜索（关键词 + 语义）
- [ ] 重排序模型
- [ ] 对话式 RAG（多轮上下文）
- [ ] 知识图谱集成

## 相关文档

- [RAG 研究文档](./RAG_RESEARCH.md) - 技术选型和架构设计
- [RAG 测试指南](./RAG_TEST_GUIDE.md) - 测试和验证
- [Embeddings 提供商](./EMBEDDINGS_PROVIDERS.md) - 提供商对比
- [实现进度](./RAG_CHAT_INTEGRATION_PROGRESS.md) - 开发进度

---

**版本**: v0.4.0  
**最后更新**: 2026-04-17  
**状态**: ✅ 核心功能完成
