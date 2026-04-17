# 📁 File Processing Feature

> Upload and parse documents (PDF, Word, Text) to extract content and create nodes

## Overview

The file processing feature allows users to upload documents, automatically extract their content, and create nodes from the extracted text. This enables users to bring external knowledge into their thinking space.

## Features

### 1. File Upload
- **Drag and Drop**: Drag files directly onto the upload area
- **Browse Files**: Click to select files from your computer
- **Supported Formats**:
  - 📃 Plain Text (.txt)
  - 📋 Markdown (.md)
  - 📄 PDF (.pdf)
  - 📝 Word Documents (.docx, .doc)
- **File Size Limit**: 10MB per file

### 2. File Parsing
- **PDF Parsing**: Uses `pdfjs-dist` to extract text from PDF documents
  - Extracts text from all pages
  - Preserves page structure
  - Handles multi-page documents
- **Word Parsing**: Uses `mammoth.js` to extract text from Word documents
  - Supports .docx and .doc formats
  - Extracts raw text content
  - Handles formatting warnings gracefully
- **Text Files**: Direct text extraction for .txt and .md files

### 3. File Management
- **File List**: View all uploaded files in a dedicated panel
- **File Preview**: Click on any file to preview its full content
- **File Metadata**: Display file size, page count, word count, upload date
- **Create Nodes**: Generate nodes from file content with one click
- **Delete Files**: Remove files you no longer need

### 4. Storage
- **IndexedDB**: All files are stored locally in the browser
- **Persistent**: Files remain available across sessions
- **Privacy**: No data is sent to external servers

## Usage

### Uploading a File

1. Click the **"Upload"** button in the header
2. Either:
   - Drag and drop a file onto the upload area
   - Click "Browse Files" to select a file
3. Wait for the file to be parsed (usually < 2 seconds)
4. A new node will be created automatically with a preview of the content

### Viewing Uploaded Files

1. Click the **"Files"** button in the header
2. Browse your uploaded files in the left panel
3. Click on a file to preview its full content
4. Use the action buttons to:
   - **Create Node**: Generate a new node from the file
   - **Delete**: Remove the file from storage

### Creating Nodes from Files

Files can create nodes in two ways:

1. **Automatic**: When you upload a file, a node is created automatically
2. **Manual**: Open the file list, select a file, and click "Create Node"

Each node includes:
- File icon and name
- Content preview (first 300 characters)
- Full content is stored and can be referenced

## Technical Implementation

### File Parser (`src/lib/fileParser.ts`)

```typescript
// Parse any supported file type
const parsedFile = await parseFile(file);

// Validate file before upload
const validation = validateFile(file);
if (!validation.valid) {
  console.error(validation.error);
}

// Get file icon and formatted size
const icon = getFileIcon(file.type);
const size = formatFileSize(file.size);
```

### File Storage (`src/lib/fileStorage.ts`)

```typescript
// Save file to IndexedDB
await saveFile(parsedFile);

// Get a specific file
const file = await getFile(fileId);

// Get all files
const allFiles = await getAllFiles();

// Delete a file
await deleteFile(fileId);
```

### Components

- **FileUploadModal**: Handles file upload with drag-and-drop
- **FileList**: Displays all uploaded files with preview and management
- **Header**: Contains Upload and Files buttons

## File Structure

```
src/
├── components/
│   ├── FileUploadModal.tsx    # Upload interface
│   └── FileList.tsx            # File management UI
├── lib/
│   ├── fileParser.ts           # Document parsing
│   └── fileStorage.ts          # IndexedDB storage
└── types/
    └── index.ts                # UploadedFile type
```

## Dependencies

- **pdfjs-dist** (5.6.205): PDF parsing
- **mammoth** (1.12.0): Word document parsing
- **idb-keyval** (6.2.1): IndexedDB wrapper (already installed)

## Performance

- **PDF Parsing**: ~1-2 seconds for typical documents
- **Word Parsing**: ~0.5-1 second for typical documents
- **Text Files**: Instant
- **Storage**: Minimal overhead, files are compressed by IndexedDB

## Limitations

- **File Size**: Maximum 10MB per file
- **PDF Images**: Text extraction only, images are not processed
- **Word Formatting**: Only raw text is extracted, formatting is lost
- **Browser Storage**: Limited by browser's IndexedDB quota (usually 50MB+)

## Future Enhancements

### Planned for v0.4.0 (RAG Integration)
- **@file Reference**: Reference files in AI chat using `@filename` syntax
- **Vector Embeddings**: Convert file content to embeddings for semantic search
- **Context Retrieval**: Automatically find relevant file sections for AI queries
- **File Chunking**: Split large documents into manageable chunks

### Planned for v0.5.0 (Advanced Features)
- **File Annotations**: Highlight and annotate file content
- **File Linking**: Create explicit links between files and nodes
- **File Tags**: Organize files with custom tags
- **File Search**: Full-text search across all uploaded files

## Troubleshooting

### PDF Parsing Fails
- **Issue**: PDF contains scanned images or is password-protected
- **Solution**: Use OCR tools to convert to text first, or remove password protection

### Word Parsing Fails
- **Issue**: Old .doc format or corrupted file
- **Solution**: Re-save as .docx in Microsoft Word or Google Docs

### File Too Large
- **Issue**: File exceeds 10MB limit
- **Solution**: Split the document or extract relevant sections

### Storage Quota Exceeded
- **Issue**: Browser storage is full
- **Solution**: Delete unused files from the file list

## Examples

### Upload a Research Paper (PDF)
1. Click "Upload"
2. Select your research paper PDF
3. Wait for parsing (~2 seconds)
4. A node is created with the paper's content
5. Use AI to discuss the paper's findings

### Import Meeting Notes (Word)
1. Click "Upload"
2. Select your meeting notes .docx file
3. Content is extracted and a node is created
4. Connect the node to related project nodes

### Batch Import Text Files
1. Upload multiple .txt files one by one
2. Each creates a separate node
3. Organize nodes spatially on the canvas
4. Connect related notes

## Best Practices

1. **Organize Files**: Use descriptive filenames before uploading
2. **Preview First**: Check the file list to see what's already uploaded
3. **Create Nodes Strategically**: Don't create nodes for every file automatically
4. **Clean Up**: Delete files you no longer need to save storage space
5. **Use with AI**: Upload documents and ask AI questions about their content

## Keyboard Shortcuts

Currently, there are no keyboard shortcuts for file operations. This may be added in future versions.

## Related Features

- **Import Modal**: For pasting text directly
- **AI Panel**: For discussing file content with AI
- **Export**: For exporting your canvas including file-based nodes

---

**File Processing Feature Complete!** 🎉

Upload documents, extract knowledge, and build your thinking space with external content.
