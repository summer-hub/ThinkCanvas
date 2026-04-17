/**
 * Prompt Enhancement Engine
 * 
 * Formats context chunks and creates enhanced prompts for AI
 */

import type { ContextChunk } from './ragIntegration';
import type { AIMessage } from '@/types';

export interface EnhancedPrompt {
  systemPrompt: string;
  userPrompt: string;
  contextSection: string;
  totalChars: number;
  truncated: boolean;
}

/**
 * Enhance prompt with context chunks
 */
export function enhancePrompt(
  userMessage: string,
  chunks: ContextChunk[],
  conversationHistory: AIMessage[] = []
): EnhancedPrompt {
  // Format context section
  const contextSection = chunks.length > 0
    ? chunks
        .map((chunk, i) => `[来源 ${i + 1}: ${chunk.fileName}]\n${chunk.content}`)
        .join('\n\n---\n\n')
    : '';

  // Create system prompt
  const systemPrompt = chunks.length > 0
    ? `你是一个知识助手。请基于提供的文档上下文回答用户的问题。

## 回答要求
1. 基于提供的上下文回答问题
2. 引用来源时使用 [来源 X] 标记
3. 如果上下文不足以回答问题，请说明需要更多信息
4. 保持回答简洁明了且有洞察力`
    : `你是一个有帮助的 AI 助手。请回答用户的问题。`;

  // Create user prompt with context
  let userPrompt = userMessage;
  
  if (contextSection) {
    userPrompt = `## 参考文档

${contextSection}

## 用户问题

${userMessage}`;
  }

  // Calculate total characters
  const totalChars = systemPrompt.length + userPrompt.length;

  return {
    systemPrompt,
    userPrompt,
    contextSection,
    totalChars,
    truncated: false, // Will be set by caller if truncation occurred
  };
}

/**
 * Format conversation history for context
 */
export function formatConversationHistory(
  messages: AIMessage[],
  maxMessages: number = 10
): AIMessage[] {
  // Take the most recent messages
  return messages.slice(-maxMessages);
}

/**
 * Truncate context to fit within character limit
 */
export function truncateContext(
  chunks: ContextChunk[],
  maxChars: number
): { chunks: ContextChunk[]; truncated: boolean } {
  const totalChars = chunks.reduce((sum, chunk) => sum + chunk.content.length, 0);
  
  if (totalChars <= maxChars) {
    return { chunks, truncated: false };
  }

  // Sort by similarity (descending)
  const sortedChunks = [...chunks].sort((a, b) => b.similarity - a.similarity);
  
  let currentChars = 0;
  const truncatedChunks: ContextChunk[] = [];
  
  for (const chunk of sortedChunks) {
    if (currentChars + chunk.content.length <= maxChars) {
      truncatedChunks.push(chunk);
      currentChars += chunk.content.length;
    } else {
      break;
    }
  }

  return { chunks: truncatedChunks, truncated: true };
}

/**
 * Create a simple prompt without RAG context
 */
export function createSimplePrompt(userMessage: string): EnhancedPrompt {
  return {
    systemPrompt: '你是一个有帮助的 AI 助手。',
    userPrompt: userMessage,
    contextSection: '',
    totalChars: userMessage.length,
    truncated: false,
  };
}

/**
 * Estimate token count for prompt
 * Rough approximation: 1 token ≈ 4 characters for English, 1.5 characters for Chinese
 */
export function estimatePromptTokens(prompt: EnhancedPrompt): number {
  const text = prompt.systemPrompt + prompt.userPrompt;
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const otherChars = text.length - chineseChars;
  
  return Math.ceil(chineseChars / 1.5 + otherChars / 4);
}
