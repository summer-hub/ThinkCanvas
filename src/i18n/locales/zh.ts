/**
 * Chinese translations
 */

import type { TranslationKeys } from './en';

export const zh: TranslationKeys = {
  // Header
  header: {
    appName: 'ThinkCanvas',
    nodes: '个节点',
    connections: '个连接',
    undo: '撤销',
    redo: '重做',
    color: '颜色',
    search: '搜索',
    import: '导入',
    upload: '上传',
    files: '文件',
    export: '导出',
    settings: '设置',
    test: '测试',
    e2e: '端到端',
  },

  // AI Panel
  aiPanel: {
    title: 'AI 思考伙伴',
    messages: '条消息',
    tokens: 'tokens',
    thinkingAbout: '正在思考：',
    startConversation: '开始关于你的想法的对话...',
    askQuestions: '提出问题',
    exploreConnections: '探索联系',
    generateInsights: '生成洞察',
    placeholder: '问任何问题... (使用 @文件名 引用文件)',
    thinking: '思考中...',
    parsingReferences: '正在解析文件引用...',
    retrievingContext: '正在检索上下文',
    enhancingPrompt: '正在增强提示...',
    generatingResponse: '正在生成响应...',
  },

  // File Upload
  fileUpload: {
    title: '上传文件',
    description: '上传文档以提取和分析其内容',
    dragDrop: '拖放文件到这里，或',
    browse: '浏览文件',
    uploading: '上传中...',
    indexing: '正在索引文件以供搜索...',
    supportedFormats: '支持的格式：',
    maxSize: '最大文件大小：10MB',
    cancel: '取消',
  },

  // File List
  fileList: {
    title: '已上传文件',
    noFiles: '还没有上传文件',
    uploadFirst: '上传文件以开始',
    preview: '预览',
    createNode: '创建节点',
    delete: '删除',
    confirmDelete: '确定要删除此文件吗？',
    close: '关闭',
  },

  // Import Modal
  importModal: {
    title: '导入文本',
    description: '粘贴文本以创建节点。用空行分隔段落以创建多个节点。',
    placeholder: '在此粘贴文本...',
    createNode: '创建节点',
    cancel: '取消',
  },

  // Export Modal
  exportModal: {
    title: '导出画布',
    description: '以不同格式导出画布',
    markdown: 'Markdown',
    json: 'JSON',
    png: 'PNG 图片',
    export: '导出',
    cancel: '取消',
  },

  // Provider Settings
  providerSettings: {
    title: 'AI 提供商设置',
    chatProvider: '聊天提供商',
    embeddingsProvider: 'Embeddings 提供商',
    apiKey: 'API 密钥',
    baseUrl: '基础 URL',
    model: '模型',
    save: '保存',
    cancel: '取消',
    optional: '可选',
  },

  // Source Attribution
  sourceAttribution: {
    sources: '来源',
    refresh: '刷新上下文',
    lowSimilarity: '所有来源的相似度较低 (<0.6)，回答可能不够准确',
    truncated: '已截断',
    chunk: '块',
  },

  // RAG Test
  ragTest: {
    title: 'RAG 功能测试',
    start: '开始测试',
    testing: '测试中...',
    close: '关闭',
    textChunking: '文本分块',
    apiKeyCheck: 'API 密钥检查',
    embeddingGeneration: '嵌入生成',
    similarityCalculation: '相似度计算',
    fileIndexing: '文件索引',
    semanticSearch: '语义搜索',
    fileReferenceParsing: '文件引用解析',
    storageStats: '存储统计',
  },

  // E2E Test
  e2eTest: {
    title: 'RAG 端到端测试',
    runAll: '运行所有测试',
    running: '测试运行中...',
    passed: '通过',
    failed: '失败',
    close: '关闭',
  },

  // Welcome Screen
  welcome: {
    title: '欢迎使用 ThinkCanvas',
    subtitle: '你的无限画布，与 AI 一起思考',
    getStarted: '开始使用',
    feature1: '创建节点并连接想法',
    feature2: '与 AI 讨论你的想法',
    feature3: '上传文档获取上下文',
    feature4: '一切自动保存',
  },

  // Search Panel
  search: {
    title: '搜索节点',
    placeholder: '搜索...',
    noResults: '未找到结果',
    results: '个结果',
  },

  // Context Menu
  contextMenu: {
    edit: '编辑',
    delete: '删除',
    duplicate: '复制',
    changeColor: '更改颜色',
  },

  // Warnings and Errors
  warnings: {
    filesNotFound: '以下文件未找到或未索引：',
    contextTruncated: '上下文已截断以适应 3000 字符限制',
    retrievalFailed: '上下文检索失败：',
    apiKeyNotConfigured: '未配置 Embeddings API 密钥',
    retrievalTimeout: '检索超时（超过 2 秒）',
  },

  // Common
  common: {
    loading: '加载中...',
    error: '错误',
    success: '成功',
    warning: '警告',
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    close: '关闭',
    back: '返回',
    next: '下一步',
    finish: '完成',
    yes: '是',
    no: '否',
  },
};
