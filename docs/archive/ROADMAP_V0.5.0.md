# Ponder AI v0.5.0 开发路线图

## 🎯 目标：智能文档分析与知识图谱

基于 `ponderai介绍.md` 的功能描述，将 Ponder AI 升级为完整的知识工作区。

---

## 📊 功能差距分析

### 当前状态 (v0.4.2)

**已有功能**:
- ✅ 无限画布 + 节点编辑
- ✅ AI 对话 + RAG 文档引用
- ✅ 文件上传（PDF/Word/Markdown）
- ✅ 基础文件解析（提取文本）
- ✅ 语义搜索
- ✅ 中英文界面

**缺失功能**:
- ❌ 智能文档结构分析
- ❌ 自动生成知识图谱
- ❌ 文档统计面板
- ❌ AI 洞察提取
- ❌ Agent/Inspire 模式
- ❌ 左侧资源管理面板
- ❌ 右侧分析面板

---

## 🚀 Phase 1: 智能文档解析 (2-3 天)

### 1.1 AI 文档结构分析

**功能描述**:
- 上传文档后，AI 自动分析文档结构
- 识别章节、标题、关键段落
- 提取核心信息和关键词
- 计算各部分权重占比

**技术实现**:
```typescript
// src/lib/documentAnalysis.ts
interface DocumentStructure {
  title: string;
  sections: Section[];
  statistics: {
    totalWords: number;
    sectionCount: number;
    sectionWeights: Record<string, number>;
  };
  keyPoints: string[];
  insights: string[];
}

async function analyzeDocument(
  content: string,
  fileName: string
): Promise<DocumentStructure>
```

**AI Prompt 设计**:
```
分析以下文档，提取：
1. 文档标题和主题
2. 章节结构（标题、内容摘要、字数占比）
3. 每个章节的核心要点（3-5 条）
4. 跨章节的深层洞察（3 条）
5. 关键词和标签

文档内容：
{content}
```

**新增文件**:
- `src/lib/documentAnalysis.ts` - 文档分析核心
- `src/lib/structureExtraction.ts` - 结构提取
- `src/lib/insightGeneration.ts` - 洞察生成

---

### 1.2 自动生成知识图谱

**功能描述**:
- 根据文档结构自动创建节点
- 中心节点：文档标题
- 子节点：各个章节
- 孙节点：章节要点
- 自动布局和连接

**技术实现**:
```typescript
// src/lib/graphGeneration.ts
interface GraphNode {
  id: string;
  type: 'root' | 'section' | 'point' | 'insight';
  content: string;
  metadata: {
    source: string;
    weight?: number;
    keywords?: string[];
  };
  position: { x: number; y: number };
}

function generateKnowledgeGraph(
  structure: DocumentStructure
): { nodes: GraphNode[]; edges: Edge[] }
```

**布局算法**:
- 中心节点在画布中心
- 章节节点环绕中心（圆形布局）
- 要点节点在章节节点周围
- 洞察节点在顶部/底部

**新增文件**:
- `src/lib/graphGeneration.ts` - 图谱生成
- `src/lib/layoutAlgorithm.ts` - 布局算法

---

### 1.3 文档上传流程改进

**当前流程**:
```
上传 → 解析文本 → 索引 → 创建简单节点
```

**新流程**:
```
上传 → 解析文本 → AI 分析结构 → 生成知识图谱 → 索引 → 显示分析结果
```

**UI 改进**:
- 显示分析进度（解析 → 分析 → 生成图谱）
- 分析完成后显示预览
- 允许用户调整生成的图谱

**修改文件**:
- `src/components/FileUploadModal.tsx` - 添加分析流程
- `src/components/AnalysisPreview.tsx` - 新增预览组件

---

## 🎨 Phase 2: 三栏布局 (1-2 天)

### 2.1 左侧资源管理面板

**功能描述**:
- 显示项目中的所有文档
- 文档分类（PDF、Markdown、Word）
- 快速预览和搜索
- 拖拽到画布创建节点

**UI 设计**:
```
┌─────────────────┐
│ 📁 项目资料     │
├─────────────────┤
│ 📄 research.pdf │
│ 📝 notes.md     │
│ 📊 data.docx    │
├─────────────────┤
│ 🔍 搜索...      │
└─────────────────┘
```

**新增组件**:
- `src/components/ResourcePanel.tsx` - 资源面板
- `src/components/DocumentCard.tsx` - 文档卡片

---

### 2.2 右侧分析面板

**功能描述**:
- 文档结构统计表格
- 章节占比可视化
- AI 洞察列表
- Agent/Inspire 模式切换

**UI 设计**:
```
┌─────────────────────┐
│ 📊 文档统计         │
├─────────────────────┤
│ 章节    | 占比      │
│ FAQ     | 80%       │
│ 指令    | 11%       │
│ 指南    | 9%        │
├─────────────────────┤
│ 💡 核心洞察         │
│ 1. FAQ 被动性问题   │
│ 2. 工具链兼容性     │
│ 3. 版本升级应急     │
├─────────────────────┤
│ 🤖 Agent | Inspire  │
└─────────────────────┘
```

**新增组件**:
- `src/components/AnalysisPanel.tsx` - 分析面板
- `src/components/StatisticsTable.tsx` - 统计表格
- `src/components/InsightsList.tsx` - 洞察列表
- `src/components/ModeSwitch.tsx` - 模式切换

---

### 2.3 三栏布局实现

**布局结构**:
```
┌──────┬────────────────┬──────┐
│      │                │      │
│ 资源 │   画布区域     │ 分析 │
│ 面板 │                │ 面板 │
│      │                │      │
│ 300px│   flex-1       │ 350px│
└──────┴────────────────┴──────┘
```

**可折叠**:
- 左右面板可以折叠
- 折叠后显示图标按钮
- 保存折叠状态到 localStorage

**修改文件**:
- `src/components/Canvas.tsx` - 更新布局
- `src/store/canvasStore.ts` - 添加面板状态

---

## 🤖 Phase 3: Agent/Inspire 模式 (2-3 天)

### 3.1 Agent 模式（任务执行）

**特点**:
- 适合明确的任务
- 结构化输出
- 快速执行

**使用场景**:
- 文档分析
- 信息提取
- 结构化写作
- 数据整理

**Prompt 模板**:
```
你是一个任务执行助手。
用户任务：{task}
相关文档：{documents}

请按以下格式输出：
1. 任务理解
2. 执行步骤
3. 结果输出
4. 建议行动
```

---

### 3.2 Inspire 模式（思维启发）

**特点**:
- 适合探索性任务
- 提问式引导
- 共同推进

**使用场景**:
- 方案设计
- 研究规划
- 创意构思
- 问题分析

**Prompt 模板**:
```
你是一个思维启发助手。
用户想法：{idea}
当前进展：{progress}

请通过提问和建议帮助用户：
1. 提出 3 个深入问题
2. 建议 2-3 个探索方向
3. 提供框架或模板
4. 指出潜在盲点
```

---

### 3.3 模式切换实现

**UI 设计**:
```
┌─────────────────────┐
│ 🤖 Agent  | Inspire │
├─────────────────────┤
│ 当前模式：Agent     │
│                     │
│ 适用场景：          │
│ • 文档分析          │
│ • 信息提取          │
│ • 结构化写作        │
└─────────────────────┘
```

**实现**:
- 在 AI Panel 添加模式切换
- 不同模式使用不同的 system prompt
- 保存用户偏好

**新增文件**:
- `src/lib/agentMode.ts` - Agent 模式逻辑
- `src/lib/inspireMode.ts` - Inspire 模式逻辑

---

## 📊 Phase 4: 文档统计与洞察 (1-2 天)

### 4.1 统计分析

**指标**:
- 总字数
- 章节数量
- 各章节字数和占比
- 关键词频率
- 段落数量

**可视化**:
- 饼图：章节占比
- 柱状图：字数分布
- 词云：关键词

**新增组件**:
- `src/components/StatisticsChart.tsx` - 图表组件
- `src/lib/statistics.ts` - 统计计算

---

### 4.2 AI 洞察生成

**洞察类型**:
1. **结构性洞察** - 文档组织问题
2. **内容性洞察** - 信息缺失或冗余
3. **用户体验洞察** - 可读性和可用性

**生成方法**:
```typescript
async function generateInsights(
  structure: DocumentStructure,
  content: string
): Promise<Insight[]> {
  // 使用 AI 分析
  const prompt = `
    分析以下文档，提供 3 个跨章节的深层洞察：
    
    文档结构：${JSON.stringify(structure)}
    
    要求：
    1. 发现结构性问题
    2. 指出内容盲点
    3. 提供优化建议
  `;
  
  return await callAI(prompt);
}
```

---

## 🎨 Phase 5: UI/UX 优化 (1-2 天)

### 5.1 节点样式优化

**节点类型**:
- 🎯 根节点（文档标题）- 大号、醒目
- 📑 章节节点 - 中号、带图标
- 📝 要点节点 - 小号、简洁
- 💡 洞察节点 - 特殊样式、高亮

**颜色方案**:
- 根节点：紫色
- 章节节点：蓝色
- 要点节点：绿色
- 洞察节点：橙色

---

### 5.2 交互优化

**画布操作**:
- 双击节点展开/折叠子节点
- 右键菜单：编辑、删除、展开全部
- 拖拽节点重新布局
- 框选多个节点

**快捷键**:
- `Space + 拖拽` - 平移画布
- `Ctrl + 滚轮` - 缩放
- `F` - 聚焦选中节点
- `E` - 展开/折叠节点

---

## 📅 开发时间表

| 阶段 | 功能 | 预计时间 | 优先级 |
|------|------|----------|--------|
| Phase 1 | 智能文档解析 | 2-3 天 | 🔴 高 |
| Phase 2 | 三栏布局 | 1-2 天 | 🔴 高 |
| Phase 3 | Agent/Inspire 模式 | 2-3 天 | 🟡 中 |
| Phase 4 | 统计与洞察 | 1-2 天 | 🟡 中 |
| Phase 5 | UI/UX 优化 | 1-2 天 | 🟢 低 |

**总计**: 7-12 天

---

## 🎯 MVP 功能（最小可行产品）

如果时间有限，优先实现：

### Week 1: 核心功能
1. ✅ 智能文档解析（AI 分析结构）
2. ✅ 自动生成知识图谱
3. ✅ 三栏布局（资源 + 画布 + 分析）

### Week 2: 增强功能
4. ✅ 文档统计面板
5. ✅ AI 洞察生成
6. ✅ Agent/Inspire 模式

---

## 📊 技术栈

### 新增依赖

```json
{
  "dependencies": {
    "recharts": "^2.10.0",        // 图表库
    "d3": "^7.8.5",                // 布局算法
    "react-markdown": "^9.0.0",    // Markdown 渲染
    "react-syntax-highlighter": "^15.5.0"  // 代码高亮
  }
}
```

---

## 🎨 设计参考

### 布局示例

```
┌────────────────────────────────────────────────────────────┐
│  🌱 Ponder AI    [搜索] [导入] [上传] [设置] 🇺🇸 English  │
├──────┬────────────────────────────────────────┬────────────┤
│      │                                        │            │
│ 📁   │         🎯 SDK README 深度分析         │  📊 统计   │
│ 资料 │                                        │            │
│      │    📑 仓库说明 ─┐                      │  章节占比  │
│ 📄   │                 │                      │  FAQ: 80%  │
│ PDF  │    📑 开发指南 ─┤─ 💡 洞察1            │  指令: 11% │
│      │                 │                      │  指南: 9%  │
│ 📝   │    📑 FAQ ──────┘                      │            │
│ MD   │                                        │  💡 洞察   │
│      │    📑 支持指令                         │  1. ...    │
│ 🔍   │                                        │  2. ...    │
│ 搜索 │                                        │  3. ...    │
│      │                                        │            │
│      │                                        │  🤖 Agent  │
└──────┴────────────────────────────────────────┴────────────┘
```

---

## 🚀 下一步行动

### 立即开始（今天）

1. **创建 Phase 1 基础文件**
   ```bash
   mkdir -p src/lib/analysis
   touch src/lib/analysis/documentAnalysis.ts
   touch src/lib/analysis/structureExtraction.ts
   touch src/lib/analysis/insightGeneration.ts
   touch src/lib/analysis/graphGeneration.ts
   ```

2. **实现文档结构分析**
   - AI Prompt 设计
   - 结构提取逻辑
   - 测试用例

3. **更新文件上传流程**
   - 添加分析步骤
   - 显示进度
   - 生成知识图谱

### 本周目标

- ✅ 完成 Phase 1（智能文档解析）
- ✅ 完成 Phase 2（三栏布局）
- ✅ 基础的统计显示

---

## 📚 参考资料

- [React Flow 文档](https://reactflow.dev)
- [D3.js 布局算法](https://d3js.org)
- [Recharts 图表库](https://recharts.org)
- [思维导图布局算法](https://github.com/topics/mind-map)

---

**版本**: v0.5.0 Roadmap  
**创建日期**: 2026-04-17  
**状态**: 📋 规划中

让我们开始构建真正的知识工作区！🚀
