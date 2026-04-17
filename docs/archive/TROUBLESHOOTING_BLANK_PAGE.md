# 页面空白问题排查指南

## 问题：页面打开是空白的

### 常见原因

1. **TypeScript 编译错误**
2. **导入/导出错误**
3. **浏览器缓存问题**
4. **开发服务器未启动**

## 解决步骤

### 1. 检查编译错误

```bash
# 停止开发服务器 (Ctrl+C)

# 重新构建
npm run build

# 查看是否有错误
```

**如果有错误**：
- 查看错误信息
- 修复代码
- 重新构建

### 2. 清除缓存并重启

```bash
# 停止开发服务器 (Ctrl+C)

# 清除缓存
rm -rf dist dist-electron node_modules/.vite

# 重新安装依赖（如果需要）
npm install

# 重新启动
npm run dev
```

### 3. 检查浏览器控制台

1. 打开浏览器开发者工具 (F12 或 Cmd+Option+I)
2. 查看 Console 标签
3. 查看是否有错误信息

**常见错误**：
- `Module not found` - 导入路径错误
- `Unexpected token` - 语法错误
- `Cannot read property` - 运行时错误

### 4. 强制刷新浏览器

```bash
# macOS
Cmd + Shift + R

# Windows/Linux
Ctrl + Shift + R
```

### 5. 检查开发服务器

```bash
# 确保服务器正在运行
npm run dev

# 应该看到类似输出：
# VITE v6.4.2  ready in XXX ms
# ➜  Local:   http://localhost:5173/
```

## 本次问题的原因

### 问题
```
"resetEmbeddingsProvider" is not exported by "src/lib/embeddingsProvider.ts"
```

### 原因
- `resetEmbeddingsProvider` 函数在 `embeddings.ts` 中定义
- 但 `ProviderSettings.tsx` 尝试从 `embeddingsProvider.ts` 导入
- 导致编译错误，页面无法加载

### 解决方案
```typescript
// 修改前（错误）
import { ..., resetEmbeddingsProvider } from '@/lib/embeddingsProvider';

// 修改后（正确）
import { ... } from '@/lib/embeddingsProvider';
import { resetEmbeddingsProvider } from '@/lib/embeddings';
```

## 预防措施

### 1. 使用 TypeScript 严格模式

确保 `tsconfig.json` 中启用严格模式：
```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

### 2. 定期检查编译

```bash
# 开发时定期运行
npm run build

# 或使用 watch 模式
npm run dev
```

### 3. 使用 ESLint

```bash
# 安装 ESLint（如果未安装）
npm install -D eslint

# 运行检查
npx eslint src/
```

## 快速修复清单

遇到空白页面时，按顺序尝试：

- [ ] 1. 检查浏览器控制台错误
- [ ] 2. 强制刷新浏览器 (Cmd+Shift+R)
- [ ] 3. 重启开发服务器
- [ ] 4. 清除缓存 (`rm -rf dist dist-electron`)
- [ ] 5. 运行 `npm run build` 检查编译错误
- [ ] 6. 检查最近的代码更改
- [ ] 7. 回滚到上一个工作版本

## 常见错误模式

### 1. 导入错误

```typescript
// ❌ 错误：从错误的文件导入
import { func } from './wrong-file';

// ✅ 正确：从正确的文件导入
import { func } from './correct-file';
```

### 2. 循环依赖

```typescript
// ❌ 错误：A 导入 B，B 导入 A
// fileA.ts
import { funcB } from './fileB';

// fileB.ts
import { funcA } from './fileA';

// ✅ 正确：提取共享代码到第三个文件
// shared.ts
export const sharedFunc = () => {};
```

### 3. 未导出的函数

```typescript
// ❌ 错误：函数未导出
function myFunc() {}

// ✅ 正确：导出函数
export function myFunc() {}
```

## 调试技巧

### 1. 逐步注释代码

```typescript
// 注释掉最近添加的代码
// const newFeature = ...;

// 如果页面恢复，说明问题在这段代码中
```

### 2. 使用 console.log

```typescript
console.log('Component mounted');
console.log('Config:', config);
```

### 3. 检查网络请求

1. 打开开发者工具
2. 切换到 Network 标签
3. 刷新页面
4. 查看是否有失败的请求

## 获取帮助

如果以上方法都无法解决：

1. **查看完整错误信息**
   ```bash
   npm run build 2>&1 | tee build-error.log
   ```

2. **检查 Git 差异**
   ```bash
   git diff
   ```

3. **回滚到上一个工作版本**
   ```bash
   git stash
   # 或
   git reset --hard HEAD~1
   ```

---

**现在页面应该可以正常显示了！** 🎉

刷新浏览器 (Cmd+Shift+R) 并检查是否正常。
