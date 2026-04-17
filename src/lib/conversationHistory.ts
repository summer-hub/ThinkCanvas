/**
 * Conversation History Management
 * 
 * Manages conversation history with token limits and context preservation
 */

import type { AIMessage } from '@/types';

export interface HistoryOptions {
  maxMessages?: number;        // Default: 10
  maxTokens?: number;          // Default: 4000
  preserveSystemMessages?: boolean; // Default: true
}

/**
 * Estimate token count for a message
 * Rough approximation: 1 token ≈ 4 characters for English, 1.5 characters for Chinese
 */
export function estimateMessageTokens(message: AIMessage): number {
  const text = message.content;
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const otherChars = text.length - chineseChars;
  
  return Math.ceil(chineseChars / 1.5 + otherChars / 4);
}

/**
 * Estimate total tokens for an array of messages
 */
export function estimateTotalTokens(messages: AIMessage[]): number {
  return messages.reduce((sum, msg) => sum + estimateMessageTokens(msg), 0);
}

/**
 * Manage conversation history with limits
 * Returns a trimmed history that fits within constraints
 */
export function manageConversationHistory(
  messages: AIMessage[],
  options: HistoryOptions = {}
): AIMessage[] {
  const {
    maxMessages = 10,
    maxTokens = 4000,
    preserveSystemMessages = true,
  } = options;

  if (messages.length === 0) {
    return [];
  }

  // Separate system messages (warnings, errors) from conversation
  const systemMessages = preserveSystemMessages
    ? messages.filter(m => 
        m.content.startsWith('⚠️') || 
        m.content.startsWith('❌') ||
        m.content.startsWith('✅')
      )
    : [];
  
  const conversationMessages = messages.filter(m => 
    !m.content.startsWith('⚠️') && 
    !m.content.startsWith('❌') &&
    !m.content.startsWith('✅')
  );

  // Step 1: Limit by message count (keep most recent)
  let trimmedMessages = conversationMessages.slice(-maxMessages);

  // Step 2: Limit by token count
  let totalTokens = estimateTotalTokens(trimmedMessages);
  
  while (totalTokens > maxTokens && trimmedMessages.length > 1) {
    // Remove oldest message (but keep at least 1 message)
    trimmedMessages = trimmedMessages.slice(1);
    totalTokens = estimateTotalTokens(trimmedMessages);
  }

  // Step 3: Add back recent system messages (last 3)
  const recentSystemMessages = systemMessages.slice(-3);
  
  return [...trimmedMessages, ...recentSystemMessages];
}

/**
 * Format conversation history for AI API
 * Converts AIMessage[] to the format expected by AI providers
 */
export function formatHistoryForAPI(
  messages: AIMessage[]
): Array<{ role: 'user' | 'assistant' | 'system'; content: string }> {
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));
}

/**
 * Get conversation summary statistics
 */
export function getHistoryStats(messages: AIMessage[]): {
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
  systemMessages: number;
  totalTokens: number;
  hasRAGContext: boolean;
} {
  const userMessages = messages.filter(m => m.role === 'user').length;
  const assistantMessages = messages.filter(m => m.role === 'assistant').length;
  const systemMessages = messages.filter(m => 
    m.content.startsWith('⚠️') || 
    m.content.startsWith('❌') ||
    m.content.startsWith('✅')
  ).length;
  
  const hasRAGContext = messages.some(m => m.ragMetadata !== undefined);
  const totalTokens = estimateTotalTokens(messages);

  return {
    totalMessages: messages.length,
    userMessages,
    assistantMessages,
    systemMessages,
    totalTokens,
    hasRAGContext,
  };
}

/**
 * Preserve RAG context in conversation history
 * Ensures that messages with RAG metadata are kept together
 */
export function preserveRAGContext(messages: AIMessage[]): AIMessage[] {
  const result: AIMessage[] = [];
  
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    result.push(msg);
    
    // If this is a user message with file references, keep the next assistant message
    if (msg.role === 'user' && msg.content.includes('@')) {
      const nextMsg = messages[i + 1];
      if (nextMsg && nextMsg.role === 'assistant' && nextMsg.ragMetadata) {
        result.push(nextMsg);
        i++; // Skip the next message since we already added it
      }
    }
  }
  
  return result;
}

/**
 * Clear old conversation history
 * Useful for starting a fresh conversation
 */
export function clearOldHistory(
  messages: AIMessage[],
  keepRecent: number = 2
): AIMessage[] {
  return messages.slice(-keepRecent);
}

/**
 * Get context window usage percentage
 */
export function getContextUsage(
  messages: AIMessage[],
  maxTokens: number = 4000
): number {
  const totalTokens = estimateTotalTokens(messages);
  return Math.min(100, (totalTokens / maxTokens) * 100);
}
