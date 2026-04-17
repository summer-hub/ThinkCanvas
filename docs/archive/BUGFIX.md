# 🐛 Bug 修复报告

## 问题描述

**Bug**: 创建节点后，节点会不断自动变大，无法停止。

**严重程度**: 🔴 高（影响核心功能）

**发现时间**: 2024-04-17

---

## 问题分析

### 根本原因

节点尺寸更新导致的**无限循环**：

1. 用户创建节点
2. React Flow 自动计算节点尺寸（dimensions change）
3. `handleNodesChange` 捕获尺寸变化
4. 调用 `updateNodeDimensions` 更新 store
5. Store 更新触发 `useEffect`
6. `useEffect` 重新设置节点到 React Flow
7. React Flow 再次触发尺寸变化
8. **回到步骤 3，形成无限循环** ♻️

### 问题代码

```typescript
// ❌ 错误的实现
const handleNodesChange: OnNodesChange = useCallback(
  (changes) => {
    changes.forEach(change => {
      // 每次尺寸变化都更新 store
      if (change.type === 'dimensions' && change.dimensions) {
        updateNodeDimensions(change.id, {
          width: change.dimensions.width,
          height: change.dimensions.height,
        });
      }
    });
  },
  [updateNodeDimensions]
);
```

---

## 解决方案

### 修复 1: 只在调整结束时保存尺寸

**文件**: `src/components/Canvas.tsx`

```typescript
// ✅ 正确的实现
const handleNodesChange: OnNodesChange = useCallback(
  (changes) => {
    changes.forEach(change => {
      // 只在用户完成调整时保存（resizing === false）
      if (change.type === 'dimensions' && change.dimensions) {
        const isResizing = (change as any).resizing;
        if (isResizing === false) {
          updateNodeDimensions(change.id, {
            width: change.dimensions.width,
            height: change.dimensions.height,
          });
        }
      }
    });
  },
  [updateNodeDimensions]
);
```

### 修复 2: 防止重复更新

**文件**: `src/store/canvasStore.ts`

```typescript
// ✅ 只在尺寸真正改变时更新
updateNodeDimensions: (id, dimensions) => {
  const state = get();
  const node = state.nodes.find(n => n.id === id);
  
  // 检查尺寸是否真的变化了
  if (node && (node.data.width !== dimensions.width || node.data.height !== dimensions.height)) {
    set({
      nodes: state.nodes.map(n =>
        n.id === id ? { ...n, data: { ...n.data, ...dimensions } } : n
      ),
    });
    debouncedSave(get());
  }
},
```

### 修复 3: 设置默认尺寸

**文件**: `src/store/canvasStore.ts`

```typescript
// ✅ 新节点有明确的初始尺寸
addNode: (content, position, type = 'text'): string => {
  const node: PonderNode = {
    id,
    type,
    position,
    data: {
      content,
      createdAt: new Date().toISOString(),
      width: 200,   // 默认宽度
      height: 100,  // 默认高度
    },
  };
  // ...
},
```

### 修复 4: 明确节点尺寸

**文件**: `src/components/PonderNode.tsx`

```typescript
// ✅ 使用明确的尺寸值
function PonderNodeComponent({ data, id, selected, type }: Props) {
  const nodeWidth = data.width || 200;
  const nodeHeight = data.height || 100;

  return (
    <div
      style={{
        width: `${nodeWidth}px`,
        height: `${nodeHeight}px`,
        // ...
      }}
    >
      {/* ... */}
    </div>
  );
}
```

---

## 修复效果

### 修复前 ❌
- 节点创建后不断变大
- CPU 占用率高
- 无法正常使用
- 浏览器可能卡死

### 修复后 ✅
- 节点尺寸稳定
- 只在用户手动调整时改变
- CPU 占用正常
- 流畅使用

---

## 测试验证

### 测试步骤
1. ✅ 双击画布创建节点
2. ✅ 节点保持稳定尺寸
3. ✅ 选中节点，拖动角落调整大小
4. ✅ 释放鼠标，尺寸保存成功
5. ✅ 刷新页面，尺寸保持不变

### 测试结果
- ✅ 节点不再自动变大
- ✅ 手动调整尺寸正常工作
- ✅ 尺寸持久化正常
- ✅ 无性能问题

---

## 相关文件

### 修改的文件
1. `src/components/Canvas.tsx` - 修复尺寸更新逻辑
2. `src/store/canvasStore.ts` - 添加重复检查和默认尺寸
3. `src/components/PonderNode.tsx` - 明确尺寸值

### 影响范围
- 节点创建
- 节点调整大小
- 节点持久化

---

## 经验教训

### 1. 避免无限循环
- ⚠️ 状态更新 → UI 更新 → 事件触发 → 状态更新
- ✅ 在更新前检查值是否真的改变
- ✅ 只在必要时触发更新

### 2. React Flow 的尺寸事件
- ⚠️ `dimensions` 事件会频繁触发
- ✅ 使用 `resizing` 标志判断是否完成
- ✅ 只在调整结束时保存

### 3. 默认值的重要性
- ⚠️ `undefined` 尺寸会导致自动计算
- ✅ 给节点设置明确的默认尺寸
- ✅ 避免依赖自动计算

### 4. 调试技巧
- 🔍 使用 `console.log` 追踪更新次数
- 🔍 检查 React DevTools 的渲染次数
- 🔍 观察 CPU 占用率

---

## 预防措施

### 代码审查清单
- [ ] 状态更新是否会触发自身？
- [ ] 是否有重复更新检查？
- [ ] 事件处理是否有防抖/节流？
- [ ] 默认值是否明确？

### 测试清单
- [ ] 创建节点后观察 5 秒
- [ ] 检查 CPU 占用率
- [ ] 手动调整尺寸测试
- [ ] 刷新页面验证持久化

---

## 版本信息

- **修复版本**: v0.1.2
- **修复日期**: 2024-04-17
- **修复人员**: AI Assistant
- **测试状态**: ✅ 已验证

---

## 相关 Issue

- 无（首次发现）

---

## 后续优化

### 可以改进的地方
1. 添加节点尺寸的最大/最小限制
2. 优化尺寸调整的性能
3. 添加尺寸调整的撤销/重做
4. 支持批量调整节点尺寸

### 监控建议
1. 添加性能监控
2. 记录异常的尺寸变化
3. 用户行为分析

---

**Bug 状态**: ✅ 已修复
**验证状态**: ✅ 已测试
**部署状态**: ✅ 已部署（热更新）

刷新浏览器页面即可看到修复效果！
