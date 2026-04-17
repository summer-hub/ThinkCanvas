# 🔑 API Key 存储问题修复

## 问题描述

用户在前端设置中配置了 API Key 并保存，但是 RAG 测试面板显示"未找到 OpenAI API Key"。

## 原因分析

**不一致的 localStorage key 名称**：

- ProviderSettings 保存：`openai_api_key`（下划线）
- RAG 测试面板读取：`openai-api-key`（连字符）❌
- FileUploadModal 读取：`openai-api-key`（连字符）❌

## 解决方案

### 统一使用 `openai_api_key`（下划线）

**修改的文件**：

1. ✅ `src/components/RAGTestPanel.tsx`
2. ✅ `src/components/FileUploadModal.tsx`

**修改内容**：
```typescript
// 之前（错误）
const apiKey = localStorage.getItem('openai-api-key');

// 现在（正确）
const apiKey = localStorage.getItem('openai_api_key');
```

---

## localStorage Key 规范

### 标准命名

项目中所有 localStorage key 应使用**下划线**命名：

| Key 名称 | 用途 | 示例值 |
|---------|------|--------|
| `openai_api_key` | OpenAI API Key | `sk-...` |
| `ai_provider_config` | AI 提供商配置 | `{"providerId":"openai",...}` |
| `embedding-cache` | 嵌入缓存 | `[[hash, embedding],...]` |

### 使用方法

```typescript
// ✅ 正确：使用下划线
localStorage.setItem('openai_api_key', apiKey);
localStorage.getItem('openai_api_key');

// ❌ 错误：使用连字符
localStorage.setItem('openai-api-key', apiKey);
localStorage.getItem('openai-api-key');
```

---

## 验证修复

### 步骤 1: 清除旧数据（可选）

如果之前保存过错误的 key，可以清除：

```javascript
// 在浏览器控制台执行
localStorage.removeItem('openai-api-key');
console.log('Cleared old API key');
```

### 步骤 2: 重新配置 API Key

1. 刷新页面
2. 点击 Header 中的 ⚙️ 按钮
3. 选择 OpenAI 或 DeepSeek
4. 输入 API Key
5. 点击 Save

### 步骤 3: 验证保存

在浏览器控制台执行：
```javascript
console.log('API Key:', localStorage.getItem('openai_api_key'));
// 应该显示你的 API Key
```

### 步骤 4: 测试 RAG 功能

1. 点击 Header 中的 🧪 Test 按钮
2. 点击"开始测试"
3. 应该看到：
   ```
   🔑 测试 2: API Key 检查
   ✅ API Key 已配置
   ```

---

## 相关代码位置

### API Key 保存

**文件**：`src/components/ProviderSettings.tsx`

```typescript
async function handleSave() {
  // ...
  localStorage.setItem('openai_api_key', apiKey.trim());
  // ...
}
```

### API Key 读取

**文件 1**：`src/lib/ai.ts`
```typescript
const apiKey = localStorage.getItem('openai_api_key') || '';
```

**文件 2**：`src/components/RAGTestPanel.tsx`
```typescript
const apiKey = localStorage.getItem('openai_api_key');
```

**文件 3**：`src/components/FileUploadModal.tsx`
```typescript
const apiKey = localStorage.getItem('openai_api_key') || '';
```

---

## 测试清单

- [ ] 配置 API Key 并保存
- [ ] 检查 localStorage 中的 key 名称
- [ ] 运行 RAG 测试，验证 API Key 检查通过
- [ ] 上传文件，验证自动索引功能
- [ ] 与 AI 对话，验证 API 调用正常

---

## 常见问题

### Q1: 为什么我的 API Key 还是找不到？

**检查步骤**：

1. **打开浏览器控制台**（F12）
2. **执行**：
   ```javascript
   console.log('API Key:', localStorage.getItem('openai_api_key'));
   ```
3. **结果**：
   - 如果显示 `null`：API Key 未保存
   - 如果显示 Key：已保存，可能是其他问题

**解决方法**：
- 重新配置并保存 API Key
- 确保点击了"Save"按钮
- 刷新页面后重试

---

### Q2: 我之前保存的 API Key 还能用吗？

**情况 1**：如果使用了错误的 key 名称（`openai-api-key`）

- ❌ 不能自动识别
- ✅ 需要重新配置

**情况 2**：如果使用了正确的 key 名称（`openai_api_key`）

- ✅ 可以继续使用
- ✅ 无需重新配置

---

### Q3: 如何迁移旧的 API Key？

如果之前使用了错误的 key 名称，可以手动迁移：

```javascript
// 在浏览器控制台执行
const oldKey = localStorage.getItem('openai-api-key');
if (oldKey) {
  localStorage.setItem('openai_api_key', oldKey);
  localStorage.removeItem('openai-api-key');
  console.log('API Key migrated successfully');
} else {
  console.log('No old API Key found');
}
```

---

### Q4: 为什么选择下划线而不是连字符？

**原因**：

1. **一致性**：项目中其他 key 使用下划线
2. **可读性**：下划线在代码中更清晰
3. **避免混淆**：连字符容易与减号混淆

**示例**：
```typescript
// 清晰
openai_api_key
ai_provider_config

// 容易混淆
openai-api-key
ai-provider-config
```

---

## 预防措施

### 代码审查清单

在添加新的 localStorage 操作时，检查：

- [ ] Key 名称使用下划线
- [ ] 与现有 key 命名一致
- [ ] 读取和保存使用相同的 key
- [ ] 添加了类型注释

### 示例代码

```typescript
// ✅ 好的实践
const API_KEY_STORAGE_KEY = 'openai_api_key';

function saveApiKey(key: string): void {
  localStorage.setItem(API_KEY_STORAGE_KEY, key);
}

function getApiKey(): string | null {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
}

// ❌ 避免硬编码
localStorage.setItem('openai-api-key', key); // 错误的 key 名称
localStorage.getItem('openai_api_key'); // 不一致
```

---

## 总结

**问题**：localStorage key 名称不一致

**影响**：
- RAG 测试无法找到 API Key
- 文件上传无法自动索引
- 用户体验差

**解决**：
- ✅ 统一使用 `openai_api_key`
- ✅ 修复所有读取位置
- ✅ 添加文档说明

**状态**：✅ 已修复

---

**修复完成！刷新页面后重新配置 API Key，然后运行测试！** 🎉
