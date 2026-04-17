# 智谱 AI JWT 认证修复

## 问题

```
❌ 嵌入生成失败: Embedding generation failed: Zhipu API error: 401 - {"error":{"code":"401","message":"令牌已过期或验证不正确"}}
```

## 原因

智谱 AI 使用 **JWT token 认证**，而不是直接使用 API Key。

### 认证流程

1. **API Key 格式**: `id.secret`（用点号分隔）
2. **生成 JWT token**: 使用 secret 对 payload 进行签名
3. **发送请求**: 使用 JWT token 作为 Bearer token

## 解决方案

### 1. 安装 JWT 库

```bash
npm install jose
```

### 2. 实现 JWT 生成

```typescript
import * as jose from 'jose';

private async generateToken(): Promise<string> {
  // Split API key into id and secret
  const [id, secret] = this.apiKey.split('.');
  
  // Create JWT payload
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    api_key: id,
    exp: now + 180, // 3 minutes expiry
    timestamp: now * 1000,
  };

  // Create secret key
  const secretKey = new TextEncoder().encode(secret);

  // Sign JWT
  const token = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', sign_type: 'SIGN' })
    .sign(secretKey);

  return token;
}
```

### 3. 使用 JWT token

```typescript
async generateEmbedding(text: string): Promise<number[]> {
  // Generate JWT token
  const token = await this.generateToken();

  // Use token in Authorization header
  const response = await fetch(`${this.baseURL}/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      model: this.model,
      input: text,
    }),
  });
  
  // ...
}
```

## API Key 格式

### 正确格式

```
id.secret
```

**示例**:
```
1234567890abcdef.1234567890abcdef1234567890abcdef
```

### 如何获取

1. 访问 https://open.bigmodel.cn/
2. 登录账号
3. 进入"API Keys"页面
4. 创建新的 API Key
5. 复制完整的 Key（包含点号）

### 验证格式

```javascript
// 在浏览器控制台测试
const apiKey = 'your-api-key-here';
const parts = apiKey.split('.');
console.log('Parts:', parts.length); // 应该是 2
console.log('ID:', parts[0]);
console.log('Secret:', parts[1]);
```

## JWT Payload 结构

```json
{
  "api_key": "1234567890abcdef",
  "exp": 1234567890,
  "timestamp": 1234567890000
}
```

### 字段说明

- **api_key**: API Key 的 ID 部分
- **exp**: 过期时间（Unix 时间戳，秒）
- **timestamp**: 当前时间戳（毫秒）

### JWT Header

```json
{
  "alg": "HS256",
  "sign_type": "SIGN"
}
```

## 测试步骤

### 1. 刷新页面

```bash
Cmd + Shift + R (macOS)
Ctrl + Shift + R (Windows/Linux)
```

### 2. 配置 API Key

1. 点击 ⚙️ 按钮
2. 配置 Embeddings Provider
3. 选择 "Zhipu AI (GLM)"
4. 输入完整的 API Key（包含点号）
5. 保存

### 3. 运行测试

1. 点击 🧪 Test 按钮
2. 点击"开始测试"
3. 查看结果

### 4. 预期结果

```
[时间] 🚀 开始 RAG 功能测试...
[时间] 📝 测试 1: 文本分块
[时间] ✅ 生成了 2 个文本块
[时间] 🔑 测试 2: API Key 检查
[时间] ✅ API Key 已配置
[时间] 🧮 测试 3: 嵌入生成
[时间]    生成嵌入向量...
[时间] ✅ 嵌入维度: 1024  ← 应该成功！
[时间] 📊 测试 4: 相似度计算
[时间]    相似度: 0.8234 ✅ 高相关
...
```

## 常见问题

### Q1: API Key 格式错误

**错误**: `Invalid API key format. Expected format: id.secret`

**原因**: API Key 不包含点号或格式不正确

**解决**:
1. 检查 API Key 是否包含点号 (`.`)
2. 确保复制了完整的 Key
3. 重新从智谱 AI 控制台复制

### Q2: JWT 生成失败

**错误**: `Failed to generate authentication token`

**原因**: Secret 部分无效或格式错误

**解决**:
1. 检查 API Key 的 secret 部分
2. 确保没有多余的空格
3. 重新生成 API Key

### Q3: Token 过期

**错误**: `令牌已过期`

**原因**: JWT token 有效期为 3 分钟

**解决**:
- 系统会自动为每次请求生成新的 token
- 如果仍然失败，检查系统时间是否正确

### Q4: 聊天 API 可用但 Embeddings 失败

**原因**: 
- 聊天 API 和 Embeddings API 使用相同的认证方式
- 可能是 API Key 权限问题

**解决**:
1. 检查 API Key 是否有 embeddings 权限
2. 在智谱 AI 控制台查看 API Key 的权限设置
3. 如果需要，创建新的 API Key

## 技术细节

### JWT 签名算法

- **算法**: HMAC-SHA256 (HS256)
- **库**: jose (Web Cryptography API)
- **签名类型**: SIGN

### Token 有效期

- **默认**: 3 分钟 (180 秒)
- **自动刷新**: 每次请求生成新 token
- **缓存**: 不缓存 token（每次生成新的）

### 为什么使用 jose 库？

1. **标准实现**: 符合 JWT 规范
2. **浏览器兼容**: 使用 Web Cryptography API
3. **安全**: 正确的 HMAC-SHA256 实现
4. **轻量**: 体积小，依赖少

## 与其他 Provider 的区别

| Provider | 认证方式 | Header 格式 |
|----------|----------|-------------|
| OpenAI | API Key | `Authorization: Bearer sk-...` |
| Youdao | API Key | `Authorization: Bearer your-key` |
| **Zhipu AI** | **JWT Token** | **`Authorization: Bearer jwt-token`** |
| Qwen | API Key | `Authorization: Bearer your-key` |
| Wenxin | Access Token | `?access_token=...` |

## 调试技巧

### 1. 查看生成的 JWT

```typescript
// 在 generateToken() 中添加
console.log('Generated JWT:', token);
```

### 2. 解码 JWT

访问 https://jwt.io/ 并粘贴 token 查看内容

### 3. 检查 API 响应

```typescript
// 在 generateEmbedding() 中添加
console.log('Response status:', response.status);
console.log('Response body:', await response.text());
```

## 总结

✅ **已修复**:
- 安装了 `jose` 库
- 实现了 JWT token 生成
- 更新了智谱 AI Provider
- 添加了详细的错误处理

✅ **现在支持**:
- 正确的 JWT 认证
- 自动 token 生成
- 3 分钟有效期
- 标准 HMAC-SHA256 签名

🎯 **下一步**:
1. 刷新页面
2. 配置正确格式的 API Key（包含点号）
3. 运行测试
4. 开始使用智谱 AI embeddings！

---

**修复完成！现在应该可以正常使用智谱 AI embeddings 了！** 🎉
