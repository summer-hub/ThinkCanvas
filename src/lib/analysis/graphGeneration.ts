/**
 * 知识图谱生成模块
 * 根据文档结构自动生成节点和连接
 */

import type { DocumentStructure, Section } from './documentAnalysis';
import type { PonderNode, PonderEdge } from '@/types';

export interface GraphLayout {
  nodes: PonderNode[];
  edges: PonderEdge[];
}

/**
 * 根据文档结构生成知识图谱（增强版 - 多角度分析）
 */
export function generateKnowledgeGraph(
  structure: DocumentStructure,
  fileId: string
): GraphLayout {
  console.log('🎨 生成知识图谱:', structure.title);
  
  const nodes: PonderNode[] = [];
  const edges: PonderEdge[] = [];
  
  // 1. 创建中心节点（文档标题）
  const rootNode: PonderNode = {
    id: `root_${fileId}`,
    type: 'text',
    position: { x: 400, y: 300 },
    data: {
      content: `🎯 ${structure.title}\n\n${structure.summary}`,
      createdAt: new Date().toISOString(),
      width: 350,
      height: 200,
      color: '#9333ea', // 紫色
    },
  };
  nodes.push(rootNode);
  
  // 2. 创建章节节点（环绕中心）
  const sectionCount = structure.sections.length;
  const radius = 450; // 章节节点距离中心的半径
  
  structure.sections.forEach((section, index) => {
    // 计算圆形布局位置
    const angle = (index / sectionCount) * 2 * Math.PI - Math.PI / 2; // 从顶部开始
    const x = rootNode.position.x + radius * Math.cos(angle);
    const y = rootNode.position.y + radius * Math.sin(angle);
    
    // 创建章节节点
    const perspectiveText = section.perspective ? `\n\n📐 角度: ${section.perspective}` : '';
    const sectionNode: PonderNode = {
      id: `section_${fileId}_${index}`,
      type: 'text',
      position: { x, y },
      data: {
        content: `📑 ${section.title}\n\n${section.summary}${perspectiveText}\n\n占比: ${Math.round(section.weight * 100)}%`,
        createdAt: new Date().toISOString(),
        width: 300,
        height: 200,
        color: '#3b82f6', // 蓝色
      },
    };
    nodes.push(sectionNode);
    
    // 连接到中心节点
    edges.push({
      id: `edge_root_section_${index}`,
      source: rootNode.id,
      target: sectionNode.id,
    });
    
    // 3. 创建要点节点（围绕章节节点）
    if (section.keyPoints.length > 0) {
      const pointRadius = 280; // 要点节点距离章节节点的半径
      const maxPoints = Math.min(section.keyPoints.length, 5); // 最多显示 5 个要点
      
      section.keyPoints.slice(0, maxPoints).forEach((point, pointIndex) => {
        const pointAngle = (pointIndex / maxPoints) * 2 * Math.PI + angle;
        const pointX = x + pointRadius * Math.cos(pointAngle);
        const pointY = y + pointRadius * Math.sin(pointAngle);
        
        const pointNode: PonderNode = {
          id: `point_${fileId}_${index}_${pointIndex}`,
          type: 'text',
          position: { x: pointX, y: pointY },
          data: {
            content: `📝 ${point}`,
            createdAt: new Date().toISOString(),
            width: 220,
            height: 120,
            color: '#10b981', // 绿色
          },
        };
        nodes.push(pointNode);
        
        // 连接到章节节点
        edges.push({
          id: `edge_section_point_${index}_${pointIndex}`,
          source: sectionNode.id,
          target: pointNode.id,
        });
      });
    }
  });
  
  // 4. 创建洞察节点（在顶部）
  if (structure.insights.length > 0) {
    const insightSpacing = 380;
    const startX = rootNode.position.x - ((structure.insights.length - 1) * insightSpacing) / 2;
    
    structure.insights.forEach((insight, index) => {
      const insightNode: PonderNode = {
        id: `insight_${fileId}_${index}`,
        type: 'text',
        position: {
          x: startX + index * insightSpacing,
          y: rootNode.position.y - 550, // 在中心节点上方
        },
        data: {
          content: `💡 核心洞察 ${index + 1}\n\n${insight}`,
          createdAt: new Date().toISOString(),
          width: 320,
          height: 160,
          color: '#f59e0b', // 橙色
        },
      };
      nodes.push(insightNode);
      
      // 连接到中心节点
      edges.push({
        id: `edge_root_insight_${index}`,
        source: rootNode.id,
        target: insightNode.id,
      });
    });
  }
  
  // 5. 创建多角度分析节点（在底部）
  if (structure.perspectives && structure.perspectives.length > 0) {
    const perspectiveSpacing = 380;
    const startX = rootNode.position.x - ((structure.perspectives.length - 1) * perspectiveSpacing) / 2;
    
    structure.perspectives.forEach((perspective, index) => {
      const findingsText = perspective.keyFindings.slice(0, 3).map((f, i) => `${i + 1}. ${f}`).join('\n');
      const perspectiveNode: PonderNode = {
        id: `perspective_${fileId}_${index}`,
        type: 'text',
        position: {
          x: startX + index * perspectiveSpacing,
          y: rootNode.position.y + 550, // 在中心节点下方
        },
        data: {
          content: `🔍 ${perspective.name}\n\n${perspective.description}\n\n${findingsText}`,
          createdAt: new Date().toISOString(),
          width: 320,
          height: 180,
          color: '#8b5cf6', // 紫罗兰色
        },
      };
      nodes.push(perspectiveNode);
      
      // 连接到中心节点
      edges.push({
        id: `edge_root_perspective_${index}`,
        source: rootNode.id,
        target: perspectiveNode.id,
      });
    });
  }
  
  // 6. 创建关系连接（如果有）
  if (structure.relationships && structure.relationships.length > 0) {
    structure.relationships.forEach((rel, index) => {
      // 查找相关节点
      const fromNode = nodes.find(n => n.data.content.includes(rel.from));
      const toNode = nodes.find(n => n.data.content.includes(rel.to));
      
      if (fromNode && toNode && fromNode.id !== toNode.id) {
        edges.push({
          id: `edge_relationship_${index}`,
          source: fromNode.id,
          target: toNode.id,
        });
      }
    });
  }
  
  console.log(`✅ 生成了 ${nodes.length} 个节点和 ${edges.length} 条连接`);
  
  return { nodes, edges };
}

/**
 * 生成简化版知识图谱（只有中心节点和章节节点）
 */
export function generateSimpleGraph(
  structure: DocumentStructure,
  fileId: string
): GraphLayout {
  const nodes: PonderNode[] = [];
  const edges: PonderEdge[] = [];
  
  // 中心节点
  const rootNode: PonderNode = {
    id: `root_${fileId}`,
    type: 'text',
    position: { x: 400, y: 300 },
    data: {
      content: `🎯 ${structure.title}\n\n${structure.summary}`,
      createdAt: new Date().toISOString(),
      width: 350,
      height: 200,
      color: '#9333ea',
    },
  };
  nodes.push(rootNode);
  
  // 章节节点（网格布局）
  const cols = Math.ceil(Math.sqrt(structure.sections.length));
  const spacing = 400;
  
  structure.sections.forEach((section, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    
    const sectionNode: PonderNode = {
      id: `section_${fileId}_${index}`,
      type: 'text',
      position: {
        x: rootNode.position.x + (col - cols / 2) * spacing,
        y: rootNode.position.y + (row + 1) * spacing,
      },
      data: {
        content: `📑 ${section.title}\n\n${section.summary}`,
        createdAt: new Date().toISOString(),
        width: 280,
        height: 150,
        color: '#3b82f6',
      },
    };
    nodes.push(sectionNode);
    
    edges.push({
      id: `edge_root_section_${index}`,
      source: rootNode.id,
      target: sectionNode.id,
    });
  });
  
  return { nodes, edges };
}

/**
 * 优化节点布局（避免重叠）
 */
export function optimizeLayout(layout: GraphLayout): GraphLayout {
  // TODO: 实现力导向布局算法或其他优化算法
  // 目前使用简单的圆形布局，已经避免了大部分重叠
  return layout;
}
