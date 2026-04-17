/**
 * AI 模式定义和管理
 * Agent 模式：任务执行，结构化输出
 * Inspire 模式：思维启发，提问引导
 */

export type AIMode = 'agent' | 'inspire';

export interface ModeConfig {
  id: AIMode;
  name: string;
  nameCn: string;
  icon: string;
  description: string;
  descriptionCn: string;
  systemPrompt: string;
  useCases: string[];
  useCasesCn: string[];
}

/**
 * Agent 模式配置
 * 适合明确的任务执行
 */
export const AGENT_MODE: ModeConfig = {
  id: 'agent',
  name: 'Agent',
  nameCn: 'Agent 模式',
  icon: '🤖',
  description: 'Task execution mode for clear, structured outputs',
  descriptionCn: '任务执行模式，适合明确的任务和结构化输出',
  systemPrompt: `You are a task execution assistant. Your role is to help users complete specific tasks efficiently and accurately.

When responding:
1. **Understand the task**: Clearly identify what the user wants to accomplish
2. **Break it down**: If complex, break the task into clear steps
3. **Execute systematically**: Provide structured, actionable outputs
4. **Be precise**: Give specific answers, not vague suggestions
5. **Suggest next actions**: Recommend concrete next steps

Output format:
- Use clear headings and bullet points
- Provide step-by-step instructions when needed
- Include examples or templates if helpful
- End with recommended next actions

Focus on efficiency and clarity. Be direct and actionable.`,
  useCases: [
    'Document analysis',
    'Information extraction',
    'Structured writing',
    'Data organization',
    'Task planning',
  ],
  useCasesCn: [
    '文档分析',
    '信息提取',
    '结构化写作',
    '数据整理',
    '任务规划',
  ],
};

/**
 * Inspire 模式配置
 * 适合探索性思考和创意激发
 */
export const INSPIRE_MODE: ModeConfig = {
  id: 'inspire',
  name: 'Inspire',
  nameCn: 'Inspire 模式',
  icon: '✨',
  description: 'Creative exploration mode for brainstorming and deep thinking',
  descriptionCn: '思维启发模式，适合探索性思考和创意激发',
  systemPrompt: `You are a creative thinking partner. Your role is to help users explore ideas deeply through questions, frameworks, and inspiration.

When responding:
1. **Ask probing questions**: Help users think deeper about their ideas
2. **Suggest frameworks**: Provide mental models or structures to organize thinking
3. **Identify blind spots**: Point out what might be missing or overlooked
4. **Offer perspectives**: Present different angles to consider
5. **Inspire connections**: Help users see relationships between concepts

Response style:
- Start with 2-3 thought-provoking questions
- Suggest frameworks or approaches to explore
- Highlight potential blind spots or assumptions
- Provide analogies or examples for inspiration
- Encourage divergent thinking

Focus on expanding possibilities and deepening understanding. Be curious and exploratory.`,
  useCases: [
    'Brainstorming',
    'Concept exploration',
    'Research planning',
    'Creative writing',
    'Problem analysis',
  ],
  useCasesCn: [
    '头脑风暴',
    '概念探索',
    '研究规划',
    '创意写作',
    '问题分析',
  ],
};

/**
 * 获取所有模式
 */
export function getAllModes(): ModeConfig[] {
  return [AGENT_MODE, INSPIRE_MODE];
}

/**
 * 根据 ID 获取模式配置
 */
export function getModeById(id: AIMode): ModeConfig {
  return id === 'agent' ? AGENT_MODE : INSPIRE_MODE;
}

/**
 * 获取模式的 System Prompt
 */
export function getModeSystemPrompt(mode: AIMode): string {
  return getModeById(mode).systemPrompt;
}

/**
 * 格式化模式特定的用户提示
 */
export function formatModePrompt(mode: AIMode, userMessage: string, context?: string): string {
  const modeConfig = getModeById(mode);
  
  let prompt = userMessage;
  
  if (context) {
    prompt = `Context: ${context}\n\nUser request: ${userMessage}`;
  }
  
  // Agent 模式：强调任务和输出
  if (mode === 'agent') {
    prompt = `Task: ${prompt}\n\nPlease provide a structured, actionable response.`;
  }
  
  // Inspire 模式：强调探索和思考
  if (mode === 'inspire') {
    prompt = `Idea to explore: ${prompt}\n\nHelp me think deeper about this through questions and frameworks.`;
  }
  
  return prompt;
}

/**
 * 保存用户偏好的模式
 */
export function savePreferredMode(mode: AIMode): void {
  localStorage.setItem('ai_preferred_mode', mode);
}

/**
 * 获取用户偏好的模式
 */
export function getPreferredMode(): AIMode {
  const saved = localStorage.getItem('ai_preferred_mode');
  return (saved === 'agent' || saved === 'inspire') ? saved : 'agent';
}
