import type { UploadedFile } from '@/types';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Parse text file
 */
async function parseTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(text);
    };
    reader.onerror = () => reject(new Error('Failed to read text file'));
    reader.readAsText(file);
  });
}

/**
 * Parse PDF file using pdf.js
 */
async function parsePDFFile(file: File): Promise<{ text: string; pageCount: number }> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    const pageCount = pdf.numPages;
    
    // Extract text from each page
    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += `${pageText}\n\n`;
    }
    
    return {
      text: fullText.trim(),
      pageCount,
    };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse Word document using mammoth.js
 */
async function parseWordFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    if (result.messages.length > 0) {
      console.warn('Word parsing warnings:', result.messages);
    }
    
    return result.value.trim();
  } catch (error) {
    console.error('Error parsing Word:', error);
    throw new Error(`Failed to parse Word document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse uploaded file based on type
 */
export async function parseFile(file: File): Promise<UploadedFile> {
  const fileId = `file_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  
  let content = '';
  let metadata: UploadedFile['metadata'] = {};

  try {
    // Parse based on file type
    if (file.type === 'text/plain' || file.type === 'text/markdown') {
      content = await parseTextFile(file);
      metadata.wordCount = content.split(/\s+/).length;
    } else if (file.type === 'application/pdf') {
      const result = await parsePDFFile(file);
      content = result.text;
      metadata.pageCount = result.pageCount;
    } else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'application/msword'
    ) {
      content = await parseWordFile(file);
      metadata.wordCount = content.split(/\s+/).length;
    } else {
      // Unsupported file type
      content = `[Unsupported file type: ${file.type}]\n\nFile: ${file.name}\nSize: ${(file.size / 1024).toFixed(2)} KB`;
    }

    return {
      id: fileId,
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      content,
      metadata,
    };
  } catch (error) {
    console.error('Failed to parse file:', error);
    throw new Error(`Failed to parse file: ${file.name}`);
  }
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB`,
    };
  }

  // Check file type
  const supportedTypes = [
    'text/plain',
    'text/markdown',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ];

  if (!supportedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.type}. Supported: TXT, MD, PDF, DOCX`,
    };
  }

  return { valid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/**
 * Get file icon based on type
 */
export function getFileIcon(type: string): string {
  if (type.includes('pdf')) return '📄';
  if (type.includes('word') || type.includes('document')) return '📝';
  if (type.includes('text')) return '📃';
  if (type.includes('markdown')) return '📋';
  return '📎';
}
