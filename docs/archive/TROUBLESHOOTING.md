# 🔧 故障排除指南

## 问题：页面空白

### 已解决的问题

**问题描述**：页面打开后显示空白

**原因**：`getAllFiles` 函数未定义

**解决方案**：已在 `src/lib/fileStorage.ts` 中添加 `getAllFiles` 函数

**状态**：✅ 已修复

---

## 常见问题

### 1. 页面空白或白屏

**可能原因**：
- JavaScript 错误
- 导入路径错误
- 缺少依赖

**诊断步骤**：
1. 打开浏览器开发者工具（F12）
2. 查看 Console 标签页
3. 检查是否有红色错误信息

**解决方法**：
```bash
# 重启开发服务器
npm run dev

# 清除缓存并重启
rm -rf node_modules/.vite
npm run dev
```

---

### 2. 模块导入错误

**错误信息**：
```
Cannot find module '@/lib/xxx'
```

**解决方法**：
1. 检查文件是否存在
2. 检查导出的函数名是否正确
3. 重启开发服务器

---

### 3. TypeScript 类型错误

**错误信息**：
```
Type 'xxx' is not assignable to type 'yyy'
```

**解决方法**：
1. 运行 `npm run build` 查看详细错误
2. 检查类型定义
3. 修复类型不匹配

---

### 4. API 调用失败

**错误信息**：
```
Failed to generate embedding: Invalid API key
```

**解决方法**：
1. 检查 API Key 是否正确配置
2. 访问 https://platform.openai.com/api-keys 验证 Key
3. 重新配置 API Key

---

### 5. 文件上传失败

**错误信息**：
```
Failed to parse file: xxx
```

**解决方法**：
1. 检查文件格式是否支持
2. 检查文件大小是否超过 10MB
3. 尝试其他文件

---

## 快速诊断命令

### 检查开发服务器状态
```bash
# 查看进程
ps aux | grep "npm run dev"

# 查看端口占用
lsof -i :5174
```

### 检查 TypeScript 错误
```bash
# 运行类型检查
npx tsc --noEmit

# 运行构建
npm run build
```

### 清除缓存
```bash
# 清除 Vite 缓存
rm -rf node_modules/.vite

# 清除浏览器缓存
# Chrome: Cmd+Shift+Delete
# Firefox: Cmd+Shift+Delete
```

---

## 开发服务器问题

### 端口被占用

**错误信息**：
```
Port 5174 is already in use
```

**解决方法**：
```bash
# 查找占用端口的进程
lsof -i :5174

# 杀死进程
kill -9 <PID>

# 或使用不同端口
npm run dev -- --port 5175
```

---

### 热更新不工作

**症状**：修改代码后页面不自动刷新

**解决方法**：
1. 检查文件是否保存
2. 重启开发服务器
3. 手动刷新浏览器（Cmd+R）

---

## 浏览器问题

### 推荐浏览器
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### 浏览器设置
1. 启用 JavaScript
2. 允许 localStorage
3. 允许 IndexedDB

---

## 性能问题

### 页面加载慢

**可能原因**：
- 文件过多
- 向量数据过大
- 网络慢

**解决方法**：
1. 清理不需要的文件
2. 清除向量存储
3. 检查网络连接

---

### 搜索响应慢

**可能原因**：
- 索引文件过多
- 向量计算量大

**解决方法**：
1. 减少 topK 参数
2. 提高相似度阈值
3. 使用文件引用限制搜索范围

---

## 数据问题

### 清除所有数据

**警告**：这将删除所有上传的文件和向量数据

```javascript
// 在浏览器控制台执行
localStorage.clear();
indexedDB.deleteDatabase('keyval-store');
location.reload();
```

---

### 导出数据备份

```javascript
// 在浏览器控制台执行
const data = {
  localStorage: { ...localStorage },
  timestamp: new Date().toISOString()
};
console.log(JSON.stringify(data, null, 2));
// 复制输出并保存到文件
```

---

## 获取帮助

### 检查日志

1. **浏览器控制台**：F12 → Console
2. **开发服务器**：终端输出
3. **网络请求**：F12 → Network

### 报告问题

提供以下信息：
- 错误信息（截图或文本）
- 浏览器版本
- 操作系统
- 复现步骤

---

## 当前状态检查清单

运行以下检查确保一切正常：

- [ ] 开发服务器正在运行（http://localhost:5174/）
- [ ] 页面可以正常打开
- [ ] 没有 JavaScript 错误（F12 Console）
- [ ] API Key 已配置
- [ ] 可以上传文件
- [ ] 可以创建节点
- [ ] 可以与 AI 对话

---

**如果问题仍然存在，请提供详细的错误信息！** 🔍
