import type { PonderNode, PonderEdge } from '@/types';

/**
 * Export canvas to Markdown format
 */
export function exportToMarkdown(nodes: PonderNode[], edges: PonderEdge[]): string {
  let markdown = '# ThinkCanvas - Canvas Export\n\n';
  markdown += `*Exported on ${new Date().toLocaleString()}*\n\n`;
  markdown += `**Statistics**: ${nodes.length} nodes, ${edges.length} connections\n\n`;
  markdown += '---\n\n';

  // Group nodes by type
  const textNodes = nodes.filter(n => n.type === 'text');
  const aiNodes = nodes.filter(n => n.type === 'ai-response');

  // Export text nodes
  if (textNodes.length > 0) {
    markdown += '## 💭 Your Ideas\n\n';
    textNodes.forEach((node, index) => {
      markdown += `### ${index + 1}. ${node.data.content.split('\n')[0]}\n\n`;
      if (node.data.content.includes('\n')) {
        markdown += `${node.data.content}\n\n`;
      }
      markdown += `*Created: ${new Date(node.data.createdAt).toLocaleString()}*\n\n`;
      
      // Find connected AI responses
      const connectedAI = edges
        .filter(e => e.source === node.id)
        .map(e => nodes.find(n => n.id === e.target && n.type === 'ai-response'))
        .filter(Boolean);
      
      if (connectedAI.length > 0) {
        markdown += '**AI Responses:**\n\n';
        connectedAI.forEach(aiNode => {
          if (aiNode) {
            markdown += `> ${aiNode.data.content}\n\n`;
          }
        });
      }
      
      markdown += '---\n\n';
    });
  }

  // Export AI nodes separately if any are not connected
  const unconnectedAI = aiNodes.filter(ai => 
    !edges.some(e => e.target === ai.id)
  );
  
  if (unconnectedAI.length > 0) {
    markdown += '## 🤖 AI Responses\n\n';
    unconnectedAI.forEach((node, index) => {
      markdown += `### ${index + 1}. ${node.data.content.substring(0, 50)}...\n\n`;
      markdown += `${node.data.content}\n\n`;
      markdown += `*Created: ${new Date(node.data.createdAt).toLocaleString()}*\n\n`;
      markdown += '---\n\n';
    });
  }

  // Export connections
  if (edges.length > 0) {
    markdown += '## 🔗 Connections\n\n';
    edges.forEach(edge => {
      const source = nodes.find(n => n.id === edge.source);
      const target = nodes.find(n => n.id === edge.target);
      if (source && target) {
        markdown += `- "${source.data.content.substring(0, 30)}..." → "${target.data.content.substring(0, 30)}..."\n`;
      }
    });
    markdown += '\n';
  }

  return markdown;
}

/**
 * Export canvas to JSON format
 */
export function exportToJSON(nodes: PonderNode[], edges: PonderEdge[]): string {
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    statistics: {
      totalNodes: nodes.length,
      textNodes: nodes.filter(n => n.type === 'text').length,
      aiNodes: nodes.filter(n => n.type === 'ai-response').length,
      connections: edges.length,
    },
    nodes: nodes.map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      content: node.data.content,
      createdAt: node.data.createdAt,
      color: node.data.color,
      width: node.data.width,
      height: node.data.height,
    })),
    edges: edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
    })),
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Download file to user's computer
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(prefix: string, extension: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${prefix}-${timestamp}.${extension}`;
}

/**
 * Export canvas as PNG image
 * Uses html2canvas to capture the canvas
 */
export async function exportToPNG(canvasElement: HTMLElement): Promise<void> {
  try {
    // Dynamically import html2canvas to reduce bundle size
    const html2canvas = (await import('html2canvas')).default;
    
    const canvas = await html2canvas(canvasElement, {
      backgroundColor: '#1a1a2e',
      scale: 2, // Higher quality
      logging: false,
    });

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = generateFilename('ponder-canvas', 'png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    });
  } catch (error) {
    console.error('Failed to export PNG:', error);
    throw new Error('Failed to export canvas as image');
  }
}
