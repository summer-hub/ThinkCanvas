# Implementation Plan: RAG AI Chat Integration

## Overview

This implementation plan breaks down the RAG AI Chat Integration feature into discrete coding tasks. The feature enhances the existing AI chat panel by enabling context-aware conversations grounded in uploaded documents. Users can reference files using @filename syntax or automatically retrieve relevant context from indexed documents.

The implementation builds upon existing RAG infrastructure (text chunking, embeddings, vector storage) and integrates it seamlessly into the AI chat workflow with source attribution and error handling.

## Tasks

- [ ] 1. Enhance file reference parsing and validation
  - Extend existing `parseFileReferences` function in `src/lib/rag.ts`
  - Add validation to check if referenced files exist in vector store
  - Return structured result with original message, clean message, and file references
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [ ]* 1.1 Write property test for file reference extraction
  - **Property 1: File Reference Extraction Completeness**
  - **Validates: Requirements 1.1, 1.2, 1.5**

- [ ] 2. Create autocomplete component for file references
  - [ ] 2.1 Create `FileReferenceAutocomplete.tsx` component
    - Implement dropdown UI with keyboard navigation (Arrow keys, Enter, Escape)
    - Display file names and file types
    - Position dropdown below cursor or above if near bottom
    - Limit to 10 suggestions with scrollable list
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 2.6_
  
  - [ ]* 2.2 Write property test for autocomplete filtering
    - **Property 2: Autocomplete Filtering Correctness**
    - **Validates: Requirements 2.2, 2.5**
  
  - [ ]* 2.3 Write property test for autocomplete suggestion completeness
    - **Property 3: Autocomplete Suggestion Completeness**
    - **Validates: Requirements 2.6**

- [ ] 3. Integrate autocomplete into AIPanel
  - [ ] 3.1 Add autocomplete state to AIPanel component
    - Track @ character detection and cursor position
    - Manage autocomplete visibility and selected suggestion
    - Debounce filtering (100ms) for performance
    - _Requirements: 2.1, 2.2_
  
  - [ ] 3.2 Wire autocomplete to textarea input
    - Detect @ character and show autocomplete
    - Filter suggestions based on partial filename
    - Insert selected filename on Enter or click
    - Close on Escape or click outside
    - _Requirements: 2.1, 2.3, 2.4_

- [ ] 4. Checkpoint - Ensure autocomplete works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Create context retrieval orchestrator
  - [ ] 5.1 Create `src/lib/ragIntegration.ts` with orchestration logic
    - Implement `retrieveContextWithTimeout` function (2-second timeout)
    - Handle parallel retrieval for multiple file references
    - Implement error categorization (missing files, unindexed, API failures, timeouts)
    - Return structured result with chunks, errors, warnings, and metadata
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 7.1, 7.2, 7.3, 7.4_
  
  - [ ]* 5.2 Write property test for context retrieval ranking
    - **Property 4: Context Retrieval Ranking**
    - **Validates: Requirements 3.1, 3.2, 3.3**
  
  - [ ]* 5.3 Write unit tests for error handling
    - Test missing file detection and error messages
    - Test unindexed file detection
    - Test API failure scenarios
    - Test timeout behavior
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 6. Create prompt enhancement engine
  - [ ] 6.1 Create `src/lib/promptEnhancement.ts`
    - Implement `enhancePrompt` function with context formatting
    - Format context chunks with source filenames and chunk indices
    - Include conversation history in enhanced prompt
    - Add instructions for AI to cite sources using [Source N] notation
    - Estimate token count for context section
    - _Requirements: 4.1, 4.2, 4.3, 4.5_
  
  - [ ]* 6.2 Write property test for enhanced prompt composition
    - **Property 5: Enhanced Prompt Composition**
    - **Validates: Requirements 4.1, 4.2**
  
  - [ ]* 6.3 Write property test for conversation history preservation
    - **Property 6: Conversation History Preservation**
    - **Validates: Requirements 4.5**

- [ ] 7. Implement context window management
  - [ ] 7.1 Add context truncation logic to prompt enhancement
    - Limit total context to 3000 characters
    - Truncate lowest-scoring chunks when limit exceeded
    - Preserve highest-scoring chunks
    - Return truncation warning when context is truncated
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  
  - [ ]* 7.2 Write property test for context size limit enforcement
    - **Property 14: Context Size Limit Enforcement**
    - **Validates: Requirements 12.1, 12.2, 12.3**
  
  - [ ]* 7.3 Write property test for character count inclusion
    - **Property 15: Character Count Inclusion**
    - **Validates: Requirements 12.5**

- [ ] 8. Checkpoint - Ensure context retrieval and prompt enhancement work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Integrate RAG into AI chat flow
  - [ ] 9.1 Update AIPanel to call context retrieval before sending to AI
    - Parse file references from user message
    - Call context retrieval orchestrator with timeout
    - Display loading indicator during retrieval ("Retrieving context...")
    - Handle retrieval errors gracefully (display warnings, proceed without context)
    - _Requirements: 3.1, 3.2, 6.1, 6.2, 7.5_
  
  - [ ] 9.2 Enhance AI prompt with retrieved context
    - Call prompt enhancement engine with retrieved chunks
    - Send enhanced prompt to AI provider
    - Fall back to original message if no context retrieved
    - Update loading indicator to "Generating response..." after retrieval
    - _Requirements: 4.1, 4.3, 4.4, 6.2_
  
  - [ ] 9.3 Store RAG metadata with AI messages
    - Extend AIMessage type to include ragMetadata field
    - Store context chunks, retrieval time, and truncation status
    - Update canvasStore to persist RAG metadata
    - _Requirements: 5.1, 13.2_

- [ ] 10. Create source attribution display component
  - [ ] 10.1 Create `SourceAttribution.tsx` component
    - Display list of source files and similarity scores below AI responses
    - Show similarity scores as percentages with color coding (green >0.8, yellow 0.6-0.8, gray 0.5-0.6)
    - Sort chunks by similarity score in descending order
    - Make sources expandable to show full chunk content
    - Add "Refresh Context" button to re-run retrieval
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 9.1, 9.2, 9.4, 14.1, 14.2_
  
  - [ ]* 10.2 Write property test for source attribution completeness
    - **Property 7: Source Attribution Completeness**
    - **Validates: Requirements 5.2, 5.3**
  
  - [ ]* 10.3 Write property test for similarity score formatting
    - **Property 11: Similarity Score Formatting**
    - **Validates: Requirements 9.1**
  
  - [ ]* 10.4 Write property test for quality color classification
    - **Property 12: Quality Color Classification**
    - **Validates: Requirements 9.2**
  
  - [ ]* 10.5 Write property test for chunk sorting invariant
    - **Property 13: Chunk Sorting Invariant**
    - **Validates: Requirements 9.4**

- [ ] 11. Integrate source attribution into AIPanel
  - [ ] 11.1 Update AIPanel to render SourceAttribution for messages with RAG metadata
    - Display source attribution below AI responses
    - Hide attribution when no context was used
    - Handle click events to expand/collapse chunk content
    - Wire up "Refresh Context" button to re-run retrieval
    - _Requirements: 5.1, 5.5, 5.6, 14.1, 14.2, 14.3, 14.4, 14.5_
  
  - [ ] 11.2 Add context quality indicators
    - Display total number of chunks retrieved
    - Show warning when all chunks have similarity < 0.6
    - Display truncation warning when context was truncated
    - _Requirements: 9.3, 9.5, 12.4_

- [ ] 12. Checkpoint - Ensure source attribution displays correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Create context preview modal
  - [ ] 13.1 Create `ContextPreviewModal.tsx` component
    - Display preview of context chunks before sending message
    - Show file names, similarity scores, and chunk content
    - Allow excluding specific chunks via checkboxes
    - Display character count indicator
    - Update preview in real-time as user types (debounced 300ms)
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_
  
  - [ ] 13.2 Add "Preview Context" button to AIPanel
    - Add button in chat input area
    - Trigger context retrieval on click
    - Open modal with preview results
    - Allow sending with selected chunks or canceling
    - _Requirements: 15.1, 15.2_

- [ ] 14. Implement error handling and user feedback
  - [ ] 14.1 Add error message display to AIPanel
    - Display warning for missing file references
    - Display message for unindexed files with "Index now" action
    - Display error for API failures
    - Display timeout message when retrieval exceeds 2 seconds
    - Ensure chat remains functional after errors
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ]* 14.2 Write property test for missing file error reporting
    - **Property 8: Missing File Error Reporting**
    - **Validates: Requirements 7.1**
  
  - [ ]* 14.3 Write property test for unindexed file detection
    - **Property 9: Unindexed File Detection**
    - **Validates: Requirements 7.2**
  
  - [ ]* 14.4 Write property test for error recovery continuity
    - **Property 10: Error Recovery Continuity**
    - **Validates: Requirements 7.5**

- [ ] 15. Add loading states and progress indicators
  - [ ] 15.1 Update AIPanel loading states
    - Show "Retrieving context..." during context retrieval
    - Show number of chunks retrieved in loading indicator
    - Update to "Generating response..." after retrieval completes
    - Ensure UI remains responsive during retrieval
    - _Requirements: 6.1, 6.2, 6.4, 6.5_
  
  - [ ] 15.2 Add progress tracking for multi-file retrieval
    - Display progress when retrieving from multiple files
    - Show current file being processed
    - _Requirements: 6.4, 11.5_

- [ ] 16. Checkpoint - Ensure error handling and loading states work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Implement performance optimizations
  - [ ] 17.1 Add caching for query embeddings
    - Implement LRU cache for query embeddings (max 100 entries)
    - Persist cache to localStorage
    - Invalidate cache on API key change
    - _Requirements: 11.2_
  
  - [ ] 17.2 Add caching for retrieved chunks
    - Cache recently retrieved chunks (max 50 in memory)
    - Invalidate cache on file re-indexing
    - _Requirements: 11.2_
  
  - [ ] 17.3 Optimize autocomplete performance
    - Cache file list for autocomplete
    - Refresh cache on file upload/delete
    - Implement debouncing for filtering (100ms)
    - _Requirements: 11.1, 11.2_
  
  - [ ] 17.4 Implement parallel processing for multi-file retrieval
    - Use Promise.all for parallel file reference processing
    - Aggregate results by similarity score
    - Apply timeout to entire operation
    - _Requirements: 11.5_

- [ ] 18. Add conversation history management
  - [ ] 18.1 Update AIPanel to maintain conversation history with context
    - Include previous context chunks in conversation context
    - Limit history to most recent 10 messages
    - Remove oldest messages when exceeding token limits
    - Preserve source attribution for all messages
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ] 19. Implement automatic file indexing on upload
  - [ ] 19.1 Update file upload flow to trigger automatic indexing
    - Call indexFile function after successful upload
    - Display indexing progress with percentage
    - Show success notification on completion
    - Display error message and allow retry on failure
    - Index in background without blocking UI
    - Skip re-indexing if file already indexed
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ] 20. Add RAG state management to canvasStore
  - [ ] 20.1 Extend canvasStore with RAG state
    - Add autocomplete state (visibility, suggestions, position)
    - Add context preview state (visibility, chunks)
    - Add loading states (isRetrievingContext, retrievalProgress)
    - Add error state (ragError)
    - _Requirements: 6.1, 6.5, 15.1, 15.2_

- [ ] 21. Ensure multi-provider compatibility
  - [ ] 21.1 Test RAG with OpenAI provider
    - Verify embeddings and chat work with OpenAI API
    - Test with gpt-4o-mini and gpt-4o models
    - _Requirements: 10.1, 10.5_
  
  - [ ] 21.2 Test RAG with DeepSeek provider
    - Verify embeddings and chat work with DeepSeek API
    - Test with deepseek-reasoner and deepseek-chat models
    - _Requirements: 10.2, 10.5_
  
  - [ ] 21.3 Test RAG with Ollama provider
    - Verify embeddings and chat work with Ollama
    - Test with local models
    - _Requirements: 10.3, 10.5_
  
  - [ ] 21.4 Verify provider switching doesn't break RAG
    - Test switching between providers during active conversation
    - Ensure RAG continues to function without reconfiguration
    - _Requirements: 10.4_

- [ ] 22. Final checkpoint - End-to-end testing
  - [ ] 22.1 Test complete RAG workflow
    - Upload and index a test document
    - Send message with @filename reference
    - Verify context retrieval and prompt enhancement
    - Verify AI response with source attribution
    - Verify source display and expansion
    - _Requirements: All_
  
  - [ ] 22.2 Test multi-file retrieval
    - Index multiple documents
    - Send message with multiple @refs
    - Verify parallel retrieval and chunk merging
    - _Requirements: 1.4, 11.5_
  
  - [ ] 22.3 Test error recovery scenarios
    - Reference non-existent file
    - Reference unindexed file
    - Simulate API failure
    - Verify graceful degradation
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ] 22.4 Test performance with large document set
    - Index 50+ documents
    - Verify retrieval completes within 2 seconds
    - Test autocomplete performance
    - _Requirements: 11.1_

- [ ] 23. Final integration and polish
  - [ ] 23.1 Update type definitions
    - Add RAG-specific types to `src/types/index.ts`
    - Ensure all TypeScript types are properly exported
    - _Requirements: All_
  
  - [ ] 23.2 Add accessibility features
    - Add ARIA labels for autocomplete dropdown
    - Announce context retrieval status for screen readers
    - Add keyboard shortcuts for context preview (Cmd/Ctrl+K)
    - Ensure focus indicators for all interactive elements
    - _Requirements: All_
  
  - [ ] 23.3 Code cleanup and documentation
    - Add JSDoc comments to all public functions
    - Remove console.log statements
    - Ensure consistent code formatting
    - Update README with RAG feature documentation
    - _Requirements: All_

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation builds on existing RAG infrastructure in `src/lib/rag.ts`, `src/lib/embeddings.ts`, and `src/lib/vectorStore.ts`
- All code is written in TypeScript following the existing project conventions
- The feature integrates seamlessly with the existing AI chat panel in `src/components/AIPanel.tsx`
