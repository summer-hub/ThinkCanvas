/**
 * English translations
 */

export const en = {
  // Header
  header: {
    appName: 'ThinkCanvas',
    nodes: 'nodes',
    connections: 'connections',
    undo: 'Undo',
    redo: 'Redo',
    color: 'Color',
    search: 'Search',
    import: 'Import',
    upload: 'Upload',
    files: 'Files',
    export: 'Export',
    settings: 'Settings',
    test: 'Test',
    e2e: 'E2E',
  },

  // AI Panel
  aiPanel: {
    title: 'AI Thinking Partner',
    messages: 'messages',
    tokens: 'tokens',
    thinkingAbout: 'Thinking about:',
    startConversation: 'Start a conversation about your idea...',
    askQuestions: 'Ask questions',
    exploreConnections: 'Explore connections',
    generateInsights: 'Generate insights',
    placeholder: 'Ask anything... (use @filename to reference files)',
    thinking: 'Thinking...',
    parsingReferences: 'Parsing file references...',
    retrievingContext: 'Retrieving context',
    enhancingPrompt: 'Enhancing prompt...',
    generatingResponse: 'Generating response...',
  },

  // File Upload
  fileUpload: {
    title: 'Upload File',
    description: 'Upload a document to extract and analyze its content',
    dragDrop: 'Drag and drop a file here, or',
    browse: 'Browse Files',
    uploading: 'Uploading...',
    indexing: 'Indexing file for search...',
    supportedFormats: 'Supported formats:',
    maxSize: 'Maximum file size: 10MB',
    cancel: 'Cancel',
  },

  // File List
  fileList: {
    title: 'Uploaded Files',
    noFiles: 'No files uploaded yet',
    uploadFirst: 'Upload a file to get started',
    preview: 'Preview',
    createNode: 'Create Node',
    delete: 'Delete',
    confirmDelete: 'Are you sure you want to delete this file?',
    close: 'Close',
  },

  // Import Modal
  importModal: {
    title: 'Import Text',
    description: 'Paste text to create nodes. Separate paragraphs with blank lines to create multiple nodes.',
    placeholder: 'Paste your text here...',
    createNode: 'Create Node',
    cancel: 'Cancel',
  },

  // Export Modal
  exportModal: {
    title: 'Export Canvas',
    description: 'Export your canvas in different formats',
    markdown: 'Markdown',
    json: 'JSON',
    png: 'PNG Image',
    export: 'Export',
    cancel: 'Cancel',
  },

  // Provider Settings
  providerSettings: {
    title: 'AI Provider Settings',
    chatProvider: 'Chat Provider',
    embeddingsProvider: 'Embeddings Provider',
    apiKey: 'API Key',
    baseUrl: 'Base URL',
    model: 'Model',
    save: 'Save',
    cancel: 'Cancel',
    optional: 'optional',
  },

  // Source Attribution
  sourceAttribution: {
    sources: 'Sources',
    refresh: 'Refresh context',
    lowSimilarity: 'All sources have low similarity (<0.6), answer may not be accurate',
    truncated: 'Truncated',
    chunk: 'Chunk',
  },

  // RAG Test
  ragTest: {
    title: 'RAG Function Test',
    start: 'Start Test',
    testing: 'Testing...',
    close: 'Close',
    textChunking: 'Text Chunking',
    apiKeyCheck: 'API Key Check',
    embeddingGeneration: 'Embedding Generation',
    similarityCalculation: 'Similarity Calculation',
    fileIndexing: 'File Indexing',
    semanticSearch: 'Semantic Search',
    fileReferenceParsing: 'File Reference Parsing',
    storageStats: 'Storage Statistics',
  },

  // E2E Test
  e2eTest: {
    title: 'RAG End-to-End Test',
    runAll: 'Run All Tests',
    running: 'Test running...',
    passed: 'passed',
    failed: 'failed',
    close: 'Close',
  },

  // Welcome Screen
  welcome: {
    title: 'Welcome to ThinkCanvas',
    subtitle: 'Your infinite canvas for thinking with AI',
    getStarted: 'Get Started',
    feature1: 'Create nodes and connect ideas',
    feature2: 'Chat with AI about your thoughts',
    feature3: 'Upload documents for context',
    feature4: 'Everything saved automatically',
  },

  // Search Panel
  search: {
    title: 'Search Nodes',
    placeholder: 'Search...',
    noResults: 'No results found',
    results: 'results',
  },

  // Context Menu
  contextMenu: {
    edit: 'Edit',
    delete: 'Delete',
    duplicate: 'Duplicate',
    changeColor: 'Change Color',
  },

  // Warnings and Errors
  warnings: {
    filesNotFound: 'The following files were not found or not indexed:',
    contextTruncated: 'Context has been truncated to fit the 3000 character limit',
    retrievalFailed: 'Context retrieval failed:',
    apiKeyNotConfigured: 'Embeddings API Key not configured',
    retrievalTimeout: 'Retrieval timeout (exceeded 2 seconds)',
  },

  // Common
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    finish: 'Finish',
    yes: 'Yes',
    no: 'No',
  },
};

export type TranslationKeys = typeof en;
