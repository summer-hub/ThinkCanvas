# Design Document: RAG AI Chat Integration

## Overview

The RAG AI Chat Integration feature enhances the existing AI chat panel by enabling context-aware conversations grounded in the user's uploaded documents. This design builds upon the existing RAG infrastructure (text chunking, embeddings, vector storage) and integrates it seamlessly into the AI chat workflow.

The system allows users to reference specific files using @filename syntax or automatically retrieve relevant context from all indexed documents. Retrieved context is used to enhance AI prompts, and source attribution is displayed to maintain transparency and enable verification.

### Key Design Goals

1. **Seamless Integration**: Minimal changes to existing AI chat UX while adding powerful RAG capabilities
2. **Performance**: Context retrieval completes within 2 seconds for up to 100 indexed files
3. **Transparency**: Clear source attribution showing which documents informed AI responses
4. **Flexibility**: Support both explicit file references (@filename) and automatic context retrieval
5. **Robustness**: Graceful degradation when RAG operations fail

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        AI Chat Panel                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  User Input Component                                   │ │
│  │  - Text input with @filename autocomplete              │ │
│  │  - File reference parsing                              │ │
│  │  - Preview context button                              │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↓                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Context Retrieval Orchestrator                        │ │
│  │  - Parse file references                               │ │
│  │  - Coordinate RAG operations                           │ │
│  │  - Handle errors and timeouts                          │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↓                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Prompt Enhancement Engine                             │ │
│  │  - Format context chunks                               │ │
│  │  - Manage context window                               │ │
│  │  - Create enhanced prompts                             │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↓                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Response Display Component                            │ │
│  │  - AI response rendering                               │ │
│  │  - Source attribution display                          │ │
│  │  - Context quality indicators                          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      RAG System Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Text         │  │ Embeddings   │  │ Vector       │      │
│  │ Chunking     │→ │ Generation   │→ │ Storage      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                            ↓                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Semantic Search Engine                                │ │
│  │  - Query embedding generation                          │ │
│  │  - Similarity computation                              │ │
│  │  - Top-K retrieval with filtering                      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Storage Layer (IndexedDB)                 │
│  - Vector chunks with embeddings                            │
│  - Vector indices                                           │
│  - Embedding cache                                          │
│  - File metadata                                            │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

1. **User Input** → Parse @filename references → Trigger autocomplete
2. **Message Send** → Extract file references → Retrieve context (with timeout)
3. **Context Retrieved** → Enhance prompt → Send to AI provider
4. **AI Response** → Display with source attribution → Store in conversation history

## Components and Interfaces

### 1. File Reference Parser

**Purpose**: Extract @filename references from user messages

**Interface**:
```typescript
interface FileReferenceParser {
  parse(message: string): ParsedMessage;
}

interface ParsedMessage {
  originalMessage: string;
  cleanMessage: string;      // Message with @refs replaced
  fileReferences: string[];  // Extracted filenames
}
```

**Implementation Details**:
- Regex pattern: `/@([^\s]+\.(pdf|docx|doc|txt|md))/gi`
- Supports multiple references in a single message
- Preserves original message for display
- Case-insensitive filename matching

### 2. Autocomplete Component

**Purpose**: Provide file suggestions as user types @filename

**Interface**:
```typescript
interface AutocompleteProps {
  inputValue: string;
  cursorPosition: number;
  onSelect: (filename: string) => void;
  onClose: () => void;
}

interface AutocompleteSuggestion {
  filename: string;
  fileType: string;
  isIndexed: boolean;
}
```

**Implementation Details**:
- Trigger: @ character detection
- Filter: Fuzzy match on characters after @
- Display: Max 10 suggestions, scrollable
- Keyboard navigation: Arrow keys + Enter/Escape
- Position: Below cursor or above if near bottom

### 3. Context Retrieval Orchestrator

**Purpose**: Coordinate RAG operations with error handling and timeouts

**Interface**:
```typescript
interface ContextRetrievalOrchestrator {
  retrieveContext(
    message: string,
    fileReferences: string[],
    options: RetrievalOptions
  ): Promise<RetrievalResult>;
}

interface RetrievalOptions {
  topK: number;              // Default: 3
  minSimilarity: number;     // Default: 0.5
  timeout: number;           // Default: 2000ms
  maxContextChars: number;   // Default: 3000
}

interface RetrievalResult {
  success: boolean;
  chunks: ContextChunk[];
  error?: string;
  warnings: string[];
  metadata: {
    retrievalTime: number;
    totalChunksScanned: number;
    chunksTruncated: boolean;
  };
}

interface ContextChunk {
  id: string;
  fileId: string;
  fileName: string;
  content: string;
  similarity: number;
  chunkIndex: number;
}
```

**Implementation Details**:
- Parallel processing for multiple file references
- 2-second timeout with graceful fallback
- Similarity threshold filtering (>0.5)
- Context window management (max 3000 chars)
- Error categorization: missing files, not indexed, API failures

### 4. Prompt Enhancement Engine

**Purpose**: Format context chunks and create enhanced prompts

**Interface**:
```typescript
interface PromptEnhancementEngine {
  enhancePrompt(
    userMessage: string,
    chunks: ContextChunk[],
    conversationHistory: AIMessage[]
  ): EnhancedPrompt;
}

interface EnhancedPrompt {
  systemPrompt: string;
  userPrompt: string;
  contextSection: string;
  totalTokens: number;      // Estimated
  truncated: boolean;
}
```

**Prompt Template**:
```
You are a knowledge-aware thinking partner. Base your responses on the provided context from the user's documents.

## Context from Documents
[Source 1: filename.pdf]
{chunk content}

[Source 2: notes.md]
{chunk content}

## User Question
{user message}

## Instructions
1. Base your response on the provided context
2. Cite sources using [Source N] notation
3. If context is insufficient, acknowledge limitations
4. Maintain conversational and insightful tone
```

### 5. Source Attribution Display

**Purpose**: Show which documents contributed to AI responses

**Interface**:
```typescript
interface SourceAttributionProps {
  chunks: ContextChunk[];
  onChunkClick: (chunk: ContextChunk) => void;
  onRefresh: () => void;
}

interface SourceAttributionDisplay {
  filename: string;
  similarity: number;
  qualityLevel: 'high' | 'medium' | 'low';  // Based on similarity
  chunkPreview: string;  // First 100 chars
}
```

**Visual Design**:
- Compact list below AI response
- Color-coded similarity: Green (>0.8), Yellow (0.6-0.8), Gray (0.5-0.6)
- Expandable to show full chunk content
- Refresh button to re-run retrieval

### 6. Context Preview Modal

**Purpose**: Allow users to preview and filter context before sending

**Interface**:
```typescript
interface ContextPreviewProps {
  message: string;
  chunks: ContextChunk[];
  onExclude: (chunkId: string) => void;
  onSend: (selectedChunks: ContextChunk[]) => void;
  onCancel: () => void;
}
```

**Features**:
- Real-time preview as user types
- Checkbox to exclude specific chunks
- Similarity scores and file names
- Character count indicator

## Data Models

### Extended AIMessage Type

```typescript
interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  
  // RAG-specific fields
  ragMetadata?: {
    contextChunks: ContextChunk[];
    retrievalTime: number;
    wasEnhanced: boolean;
    truncated: boolean;
  };
}
```

### RAG State in Canvas Store

```typescript
interface RAGState {
  // Autocomplete state
  autocompleteVisible: boolean;
  autocompleteSuggestions: AutocompleteSuggestion[];
  autocompletePosition: { x: number; y: number };
  
  // Context preview state
  previewVisible: boolean;
  previewChunks: ContextChunk[];
  
  // Loading states
  isRetrievingContext: boolean;
  retrievalProgress: {
    current: number;
    total: number;
    message: string;
  };
  
  // Error state
  ragError: string | null;
}
```

## Error Handling

### Error Categories

1. **Missing File References**
   - Detection: File reference doesn't match any uploaded file
   - Handling: Display warning, proceed with available files
   - Message: "File not found: {filename}. Continuing with other sources."

2. **Unindexed Files**
   - Detection: File exists but not in vector index
   - Handling: Display indexing prompt, proceed without that file
   - Message: "File {filename} needs indexing. Click to index now."

3. **Embeddings API Failures**
   - Detection: OpenAI API error during embedding generation
   - Handling: Retry once, then proceed without context
   - Message: "Context retrieval failed. Proceeding without document context."

4. **Timeout Errors**
   - Detection: Retrieval exceeds 2-second timeout
   - Handling: Cancel retrieval, proceed without context
   - Message: "Context retrieval timed out. Proceeding without document context."

5. **Context Window Overflow**
   - Detection: Retrieved chunks exceed 3000 character limit
   - Handling: Truncate lowest-scoring chunks, display warning
   - Message: "Context truncated to fit limits. Showing top {N} most relevant chunks."

### Error Recovery Strategy

```typescript
async function retrieveContextWithFallback(
  message: string,
  fileRefs: string[]
): Promise<RetrievalResult> {
  try {
    // Attempt retrieval with timeout
    const result = await Promise.race([
      retrieveContext(message, fileRefs),
      timeout(2000)
    ]);
    
    return result;
  } catch (error) {
    // Log error for debugging
    console.error('Context retrieval failed:', error);
    
    // Return empty result with error info
    return {
      success: false,
      chunks: [],
      error: error.message,
      warnings: [],
      metadata: {
        retrievalTime: 0,
        totalChunksScanned: 0,
        chunksTruncated: false
      }
    };
  }
}
```

## Testing Strategy

### Unit Testing

**File Reference Parser**:
- Test single @filename extraction
- Test multiple @filename references
- Test various file extensions (.pdf, .docx, .txt, .md)
- Test edge cases: @filename at start/end, adjacent @refs
- Test malformed references

**Autocomplete Logic**:
- Test filtering with partial filenames
- Test case-insensitive matching
- Test max 10 results limit
- Test empty query (show all files)
- Test no matches scenario

**Context Truncation**:
- Test truncation at 3000 character limit
- Test prioritization by similarity score
- Test warning message generation
- Test edge case: all chunks below threshold

**Prompt Enhancement**:
- Test prompt formatting with 0, 1, 3, 10 chunks
- Test source citation format
- Test conversation history inclusion
- Test character count estimation

**Error Handling**:
- Test missing file detection
- Test unindexed file detection
- Test API failure scenarios
- Test timeout behavior

### Integration Testing

**End-to-End RAG Flow**:
1. Upload and index a test document
2. Send message with @filename reference
3. Verify context retrieval
4. Verify prompt enhancement
5. Verify AI response with attribution
6. Verify source display

**Multi-File Retrieval**:
1. Index multiple documents
2. Send message with multiple @refs
3. Verify parallel retrieval
4. Verify chunk merging and ranking

**Autocomplete Integration**:
1. Type @ in chat input
2. Verify suggestion list appears
3. Type partial filename
4. Verify filtering
5. Select suggestion
6. Verify insertion into input

**Error Recovery**:
1. Reference non-existent file
2. Verify warning message
3. Verify chat continues to work
4. Simulate API failure
5. Verify graceful degradation

### Performance Testing

**Retrieval Speed**:
- Measure retrieval time for 10, 50, 100 indexed files
- Verify <2 second completion
- Test with various query lengths
- Test with multiple file references

**Memory Usage**:
- Monitor memory during large file indexing
- Test with 100+ indexed documents
- Verify no memory leaks in autocomplete
- Test embedding cache efficiency

**UI Responsiveness**:
- Verify chat input remains responsive during retrieval
- Test autocomplete dropdown performance
- Verify smooth scrolling with many messages
- Test source attribution expansion

### User Acceptance Testing

**Scenarios**:
1. **Research Assistant**: User uploads research papers, asks questions, verifies sources
2. **Note Review**: User uploads meeting notes, asks for summaries with citations
3. **Document Comparison**: User references multiple files, asks for comparisons
4. **Error Handling**: User references non-existent file, system handles gracefully
5. **Performance**: User with 50+ indexed files experiences fast retrieval

## Performance Optimization

### Caching Strategy

1. **Embedding Cache**:
   - Cache query embeddings for repeated questions
   - LRU eviction policy (max 100 entries)
   - Persist to localStorage

2. **Chunk Cache**:
   - Cache recently retrieved chunks
   - Invalidate on file re-indexing
   - Max 50 chunks in memory

3. **Autocomplete Cache**:
   - Cache file list for autocomplete
   - Refresh on file upload/delete
   - Debounce filtering (100ms)

### Parallel Processing

1. **Multi-File Retrieval**:
   - Process file references in parallel using Promise.all
   - Aggregate results by similarity score
   - Timeout applies to entire operation

2. **Batch Embedding Generation**:
   - Already implemented in existing RAG system
   - Batch size: 100 texts per API call

### Lazy Loading

1. **Autocomplete Suggestions**:
   - Load file list only when @ is typed
   - Render only visible suggestions (virtualization if >50 files)

2. **Source Attribution**:
   - Render collapsed by default
   - Load full chunk content on expansion

### Debouncing

1. **Autocomplete Filtering**:
   - Debounce filter function (100ms)
   - Cancel previous filter on new input

2. **Context Preview**:
   - Debounce preview updates (300ms)
   - Cancel retrieval on input change

## Security Considerations

### API Key Protection

- API keys stored in localStorage (existing pattern)
- Never expose keys in logs or error messages
- Use same key for embeddings and chat (OpenAI-compatible providers)

### Input Validation

- Sanitize file references before processing
- Validate file extensions against whitelist
- Limit message length (existing: textarea constraint)
- Prevent injection attacks in prompt templates

### Data Privacy

- All data stored locally in IndexedDB
- No server-side storage of documents or embeddings
- User controls all data deletion

### Rate Limiting

- Respect OpenAI API rate limits
- Implement exponential backoff on failures
- Display clear error messages on rate limit errors

## Accessibility

### Keyboard Navigation

- Tab through autocomplete suggestions
- Arrow keys to navigate suggestions
- Enter to select, Escape to close
- Keyboard shortcuts for context preview (Cmd/Ctrl+K)

### Screen Reader Support

- ARIA labels for autocomplete dropdown
- Announce context retrieval status
- Describe source attribution visually and semantically
- Alt text for loading indicators

### Visual Indicators

- High contrast for similarity color coding
- Loading states with text + animation
- Error messages with icons and text
- Focus indicators for all interactive elements

## Migration and Rollout

### Phase 1: Core Integration (Week 1)
- Implement file reference parsing
- Integrate context retrieval into AI chat flow
- Basic prompt enhancement
- Simple source attribution display

### Phase 2: Enhanced UX (Week 2)
- Implement autocomplete
- Add context preview
- Improve error handling and messaging
- Add loading states and progress indicators

### Phase 3: Optimization (Week 3)
- Implement caching strategies
- Add performance monitoring
- Optimize for 100+ indexed files
- Add context quality indicators

### Phase 4: Polish (Week 4)
- Refine UI/UX based on testing
- Add keyboard shortcuts
- Improve accessibility
- Documentation and user guide

## Future Enhancements

### Potential Features (Post-MVP)

1. **Smart Context Selection**:
   - ML-based relevance ranking
   - User feedback on context quality
   - Adaptive similarity thresholds

2. **Multi-Modal RAG**:
   - Image understanding from PDFs
   - Table extraction and querying
   - Chart and diagram analysis

3. **Conversation Memory**:
   - Remember previous context across sessions
   - Build knowledge graph from conversations
   - Suggest related documents

4. **Advanced Filtering**:
   - Filter by file type, date, tags
   - Exclude specific files from search
   - Custom similarity thresholds per file

5. **Collaborative Features**:
   - Share indexed documents
   - Collaborative annotations
   - Team knowledge bases

## Appendix

### Technology Stack

- **Frontend**: React 18.3.1 with TypeScript
- **State Management**: Zustand 5.0.3
- **Storage**: IndexedDB via idb-keyval 6.2.1
- **AI SDK**: OpenAI 4.85.4
- **Embeddings Model**: text-embedding-3-small (1536 dimensions)
- **Vector Similarity**: Cosine similarity

### Dependencies

**Existing**:
- `src/lib/rag.ts`: Core RAG functions
- `src/lib/embeddings.ts`: Embedding generation and similarity
- `src/lib/textChunking.ts`: Text chunking utilities
- `src/lib/vectorStore.ts`: Vector storage in IndexedDB
- `src/lib/ai.ts`: AI provider abstraction
- `src/components/AIPanel.tsx`: AI chat UI

**New**:
- No new external dependencies required
- All functionality built on existing infrastructure

### Configuration

```typescript
// RAG Configuration
const RAG_CONFIG = {
  // Retrieval settings
  DEFAULT_TOP_K: 3,
  MIN_SIMILARITY: 0.5,
  RETRIEVAL_TIMEOUT: 2000, // ms
  
  // Context window
  MAX_CONTEXT_CHARS: 3000,
  
  // Autocomplete
  MAX_SUGGESTIONS: 10,
  AUTOCOMPLETE_DEBOUNCE: 100, // ms
  
  // Performance
  CHUNK_CACHE_SIZE: 50,
  QUERY_CACHE_SIZE: 100,
  
  // UI
  SIMILARITY_THRESHOLDS: {
    HIGH: 0.8,
    MEDIUM: 0.6,
    LOW: 0.5
  }
};
```

### File Structure

```
src/
├── components/
│   ├── AIPanel.tsx                    # Enhanced with RAG
│   ├── FileReferenceAutocomplete.tsx  # New
│   ├── SourceAttribution.tsx          # New
│   └── ContextPreviewModal.tsx        # New
├── lib/
│   ├── rag.ts                         # Enhanced
│   ├── ragIntegration.ts              # New: orchestration logic
│   └── promptEnhancement.ts           # New: prompt formatting
├── store/
│   └── canvasStore.ts                 # Enhanced with RAG state
└── types/
    └── index.ts                       # Enhanced with RAG types
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following testable properties. Through reflection, I eliminated redundancy:

**Redundancies Eliminated**:
- Properties 1.1 and 1.2 (parsing single vs multiple references) can be combined into one property about parsing any number of references
- Properties 5.2 and 5.3 (listing filenames and scores) can be combined into one property about complete attribution information
- Properties 9.1 and 9.5 (showing scores and counts) are covered by the general attribution property
- Properties 12.1, 12.2, and 12.3 (context size limits and truncation) can be combined into one comprehensive truncation property

### Property 1: File Reference Extraction Completeness

*For any* message containing zero or more @filename references with supported extensions (.pdf, .docx, .doc, .txt, .md), parsing SHALL extract all file references while preserving the original message text.

**Validates: Requirements 1.1, 1.2, 1.5**

### Property 2: Autocomplete Filtering Correctness

*For any* partial filename string and set of indexed files, the autocomplete filter SHALL return exactly those files whose names contain the partial string (case-insensitive), limited to 10 results.

**Validates: Requirements 2.2, 2.5**

### Property 3: Autocomplete Suggestion Completeness

*For any* file suggestion, the rendered autocomplete item SHALL contain both the filename and file type information.

**Validates: Requirements 2.6**

### Property 4: Context Retrieval Ranking

*For any* query and set of file references, context retrieval SHALL return chunks ranked by similarity score in descending order, with only chunks scoring above 0.5 included.

**Validates: Requirements 3.1, 3.2, 3.3**

### Property 5: Enhanced Prompt Composition

*For any* user message and set of context chunks, the enhanced prompt SHALL include the original message, all chunk contents, source filenames, and chunk indices.

**Validates: Requirements 4.1, 4.2**

### Property 6: Conversation History Preservation

*For any* conversation history and new message, the enhanced prompt SHALL include all previous messages in the conversation.

**Validates: Requirements 4.5**

### Property 7: Source Attribution Completeness

*For any* set of context chunks used in a response, the source attribution display SHALL include all unique filenames and their corresponding similarity scores.

**Validates: Requirements 5.2, 5.3**

### Property 8: Missing File Error Reporting

*For any* set of file references where some files don't exist, the error message SHALL list all missing filenames.

**Validates: Requirements 7.1**

### Property 9: Unindexed File Detection

*For any* file reference to an uploaded but unindexed file, the system SHALL detect and report that the file needs indexing.

**Validates: Requirements 7.2**

### Property 10: Error Recovery Continuity

*For any* error during context retrieval (missing files, API failures, timeouts), the chat panel SHALL remain functional and allow sending messages without RAG.

**Validates: Requirements 7.5**

### Property 11: Similarity Score Formatting

*For any* similarity score between 0 and 1, the display SHALL format it as a percentage (0-100%) with appropriate precision.

**Validates: Requirements 9.1**

### Property 12: Quality Color Classification

*For any* similarity score, the quality indicator SHALL be classified as: green (>0.8), yellow (0.6-0.8), or gray (0.5-0.6).

**Validates: Requirements 9.2**

### Property 13: Chunk Sorting Invariant

*For any* set of context chunks, after sorting by similarity score, each chunk SHALL have a similarity score greater than or equal to the next chunk.

**Validates: Requirements 9.4**

### Property 14: Context Size Limit Enforcement

*For any* set of context chunks, if the total character count exceeds 3000, the system SHALL truncate by removing the lowest-scoring chunks until the limit is satisfied, while preserving the highest-scoring chunks.

**Validates: Requirements 12.1, 12.2, 12.3**

### Property 15: Character Count Inclusion

*For any* enhanced prompt, the prompt metadata SHALL include an accurate character count of the context section.

**Validates: Requirements 12.5**

### Testing Implementation Notes

**Property-Based Testing Framework**: Use a TypeScript property-based testing library such as `fast-check` for implementing these properties.

**Test Configuration**:
- Minimum 100 iterations per property test
- Each test must reference its design property in a comment
- Tag format: `// Feature: rag-ai-chat-integration, Property N: [property title]`

**Generator Strategies**:
- **Messages**: Generate strings with 0-5 @filename references, various positions
- **Filenames**: Generate valid filenames with supported extensions
- **Chunks**: Generate chunks with random content, filenames, and similarity scores (0.0-1.0)
- **Scores**: Generate floats in range [0.0, 1.0] with edge cases at thresholds (0.5, 0.6, 0.8)
- **Context Sets**: Generate chunk arrays of varying sizes (0-20 chunks) with varying total character counts

**Edge Cases to Cover**:
- Empty inputs (no file references, no chunks, no history)
- Boundary values (exactly 10 suggestions, exactly 3000 chars, score = 0.5)
- Maximum values (many file references, large chunk sets, long messages)
- Special characters in filenames and messages
- Unicode and non-ASCII characters

**Example Property Test Structure**:
```typescript
// Feature: rag-ai-chat-integration, Property 1: File Reference Extraction Completeness
test('file reference extraction preserves original message', () => {
  fc.assert(
    fc.property(
      fc.array(fc.string(), { minLength: 0, maxLength: 5 }), // file references
      fc.string(), // message template
      (fileRefs, template) => {
        const message = insertFileReferences(template, fileRefs);
        const result = parseFileReferences(message);
        
        // Original message is preserved
        expect(result.originalMessage).toBe(message);
        
        // All file references are extracted
        expect(result.fileReferences).toHaveLength(fileRefs.length);
        expect(result.fileReferences).toEqual(expect.arrayContaining(fileRefs));
      }
    ),
    { numRuns: 100 }
  );
});
```
