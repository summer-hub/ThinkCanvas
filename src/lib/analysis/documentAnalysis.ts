/**
 * 智能文档分析模块
 * 使用 AI 分析文档结构、提取关键信息、生成洞察
 */

import { sendToAI } from '@/lib/ai';

export interface Section {
  id: string;
  title: string;
  content: string;
  summary: string;
  keyPoints: string[];
  wordCount: number;
  weight: number; // 占比（0-1）
  level: number; // 层级（1=一级标题，2=二级标题）
  perspective?: string; // 分析角度
}

export interface Perspective {
  name: string;
  description: string;
  keyFindings: string[];
}

export interface Relationship {
  from: string;
  to: string;
  type: string;
}

export interface DocumentStructure {
  title: string;
  summary: string;
  sections: Section[];
  statistics: {
    totalWords: number;
    sectionCount: number;
    sectionWeights: Record<string, number>; // 章节名 -> 占比
  };
  keyPoints: string[];
  insights: string[];
  keywords: string[];
  perspectives?: Perspective[]; // 多角度分析
  relationships?: Relationship[]; // 概念关系
}

/**
 * 使用 AI 分析文档结构（多角度深度分析）
 */
export async function analyzeDocument(
  content: string,
  fileName: string,
  onProgress?: (step: string, detail: string) => void
): Promise<DocumentStructure> {
  console.log(`📊 开始分析文档: ${fileName}`);
  
  // 步骤 1: 整体理解
  onProgress?.('understanding', '正在理解文档整体结构 | Understanding document structure');
  
  // 构建增强的分析 Prompt - 多角度分析
  const analysisPrompt = `你是一个专业的文档分析助手。请从多个角度深度分析以下文档，提取结构化信息。

文档名称：${fileName}

文档内容：
${content.substring(0, 8000)} ${content.length > 8000 ? '\n\n[内容过长，已截断...]' : ''}

请按照以下 JSON 格式输出分析结果（只输出 JSON，不要其他文字）：

{
  "title": "文档标题",
  "summary": "文档整体摘要（100-200字）",
  "sections": [
    {
      "title": "章节标题",
      "summary": "章节摘要（50-100字）",
      "keyPoints": ["要点1", "要点2", "要点3"],
      "level": 1,
      "perspective": "分析角度（如：技术架构、业务流程、用户体验等）"
    }
  ],
  "perspectives": [
    {
      "name": "分析角度名称",
      "description": "从这个角度看到的核心内容",
      "keyFindings": ["发现1", "发现2", "发现3"]
    }
  ],
  "keyPoints": ["文档核心要点1", "文档核心要点2", "文档核心要点3"],
  "insights": ["深层洞察1", "深层洞察2", "深层洞察3"],
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "relationships": [
    {
      "from": "概念A",
      "to": "概念B",
      "type": "关系类型（如：依赖、包含、对比等）"
    }
  ]
}

分析要求：
1. **结构识别**：识别文档的主要章节（根据标题、段落结构）
2. **多角度分析**：从不同角度分析文档（如技术、业务、用户、流程等）
3. **要点提取**：每个章节提取 3-5 个核心要点
4. **关系发现**：识别概念之间的关系（依赖、包含、对比等）
5. **深层洞察**：生成 3-5 个跨章节的深层洞察（发现问题、提出建议）
6. **关键词提取**：提取 5-10 个关键词
7. 确保输出是有效的 JSON 格式`;

  try {
    // 步骤 2: AI 分析
    onProgress?.('analyzing', '正在进行 AI 深度分析 | Performing AI deep analysis');
    
    // 调用 AI 分析
    const response = await sendToAI(analysisPrompt);
    
    // 步骤 3: 解析结果
    onProgress?.('parsing', '正在解析分析结果 | Parsing analysis results');
    
    // 解析 JSON 响应
    let parsedData: any;
    try {
      // 尝试提取 JSON（可能包含在 markdown 代码块中）
      const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : response;
      parsedData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('❌ JSON 解析失败:', parseError);
      console.log('原始响应:', response);
      throw new Error('AI 返回的数据格式无效');
    }

    // 步骤 4: 提取章节内容
    onProgress?.('extracting', '正在提取章节内容 | Extracting section content');
    
    // 计算统计信息
    const totalWords = content.split(/\s+/).length;
    const sections: Section[] = parsedData.sections.map((s: any, index: number) => {
      // 尝试从原文中提取章节内容
      const sectionContent = extractSectionContent(content, s.title, index);
      const wordCount = sectionContent.split(/\s+/).length;
      
      return {
        id: `section_${index}`,
        title: s.title,
        content: sectionContent,
        summary: s.summary || '',
        keyPoints: s.keyPoints || [],
        wordCount,
        weight: totalWords > 0 ? wordCount / totalWords : 0,
        level: s.level || 1,
        perspective: s.perspective || '',
      };
    });

    // 步骤 5: 计算权重
    onProgress?.('calculating', '正在计算章节权重 | Calculating section weights');
    
    // 计算章节权重
    const sectionWeights: Record<string, number> = {};
    sections.forEach(section => {
      sectionWeights[section.title] = Math.round(section.weight * 100);
    });

    // 步骤 6: 完成
    onProgress?.('completed', '分析完成 | Analysis completed');
    
    const structure: DocumentStructure = {
      title: parsedData.title || fileName,
      summary: parsedData.summary || '',
      sections,
      statistics: {
        totalWords,
        sectionCount: sections.length,
        sectionWeights,
      },
      keyPoints: parsedData.keyPoints || [],
      insights: parsedData.insights || [],
      keywords: parsedData.keywords || [],
      perspectives: parsedData.perspectives || [],
      relationships: parsedData.relationships || [],
    };

    console.log('✅ 文档分析完成:', structure.title);
    return structure;
  } catch (error) {
    console.error('❌ 文档分析失败:', error);
    onProgress?.('error', `分析失败: ${error instanceof Error ? error.message : '未知错误'} | Analysis failed`);
    throw new Error(`文档分析失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 从原文中提取章节内容（简单实现）
 */
function extractSectionContent(
  fullContent: string,
  sectionTitle: string,
  sectionIndex: number
): string {
  // 尝试找到章节标题在原文中的位置
  const lines = fullContent.split('\n');
  let startIndex = -1;
  let endIndex = lines.length;

  // 查找章节开始位置
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes(sectionTitle) || 
        line.toLowerCase().includes(sectionTitle.toLowerCase())) {
      startIndex = i;
      break;
    }
  }

  // 如果找不到，返回部分内容
  if (startIndex === -1) {
    const chunkSize = Math.floor(lines.length / (sectionIndex + 1));
    startIndex = sectionIndex * chunkSize;
    endIndex = Math.min(startIndex + chunkSize, lines.length);
  } else {
    // 查找下一个章节标题（作为结束位置）
    for (let i = startIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      // 检测是否是标题（以 # 开头或全大写）
      if (line.startsWith('#') || (line.length > 0 && line === line.toUpperCase())) {
        endIndex = i;
        break;
      }
    }
  }

  return lines.slice(startIndex, endIndex).join('\n').trim();
}

/**
 * 快速分析（不使用 AI，用于预览）
 */
export function quickAnalyze(content: string, fileName: string): DocumentStructure {
  const lines = content.split('\n');
  const totalWords = content.split(/\s+/).length;
  
  // 简单的章节识别（基于 Markdown 标题）
  const sections: Section[] = [];
  let currentSection: Partial<Section> | null = null;
  let sectionContent: string[] = [];
  
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // 检测标题
    const h1Match = trimmed.match(/^#\s+(.+)$/);
    const h2Match = trimmed.match(/^##\s+(.+)$/);
    
    if (h1Match || h2Match) {
      // 保存上一个章节
      if (currentSection) {
        const content = sectionContent.join('\n');
        const wordCount = content.split(/\s+/).length;
        sections.push({
          id: `section_${sections.length}`,
          title: currentSection.title!,
          content,
          summary: content.substring(0, 100) + '...',
          keyPoints: [],
          wordCount,
          weight: totalWords > 0 ? wordCount / totalWords : 0,
          level: currentSection.level!,
        });
      }
      
      // 开始新章节
      currentSection = {
        title: (h1Match || h2Match)![1],
        level: h1Match ? 1 : 2,
      };
      sectionContent = [];
    } else if (currentSection) {
      sectionContent.push(line);
    }
  });
  
  // 保存最后一个章节
  if (currentSection) {
    const content = sectionContent.join('\n');
    const wordCount = content.split(/\s+/).length;
    sections.push({
      id: `section_${sections.length}`,
      title: currentSection.title!,
      content,
      summary: content.substring(0, 100) + '...',
      keyPoints: [],
      wordCount,
      weight: totalWords > 0 ? wordCount / totalWords : 0,
      level: currentSection.level!,
    });
  }
  
  // 如果没有识别到章节，创建一个默认章节
  if (sections.length === 0) {
    sections.push({
      id: 'section_0',
      title: '文档内容',
      content: content.substring(0, 1000),
      summary: content.substring(0, 200) + '...',
      keyPoints: [],
      wordCount: totalWords,
      weight: 1,
      level: 1,
    });
  }
  
  // 计算章节权重
  const sectionWeights: Record<string, number> = {};
  sections.forEach(section => {
    sectionWeights[section.title] = Math.round(section.weight * 100);
  });
  
  return {
    title: fileName,
    summary: content.substring(0, 200) + '...',
    sections,
    statistics: {
      totalWords,
      sectionCount: sections.length,
      sectionWeights,
    },
    keyPoints: [],
    insights: [],
    keywords: [],
  };
}
