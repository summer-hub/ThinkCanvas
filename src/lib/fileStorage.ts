import { get, set, del, keys } from 'idb-keyval';
import type { UploadedFile } from '@/types';

const FILE_PREFIX = 'file_';
const FILE_LIST_KEY = 'uploaded_files';

/**
 * Save file to IndexedDB
 */
export async function saveFile(file: UploadedFile): Promise<void> {
  try {
    // Save file data
    await set(`${FILE_PREFIX}${file.id}`, file);
    
    // Update file list
    const fileList = await getFileList();
    if (!fileList.find(f => f.id === file.id)) {
      fileList.push({
        id: file.id,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: file.uploadedAt,
      });
      await set(FILE_LIST_KEY, fileList);
    }
  } catch (error) {
    console.error('Failed to save file:', error);
    throw new Error('Failed to save file to storage');
  }
}

/**
 * Get file by ID
 */
export async function getFile(fileId: string): Promise<UploadedFile | null> {
  try {
    const file = await get<UploadedFile>(`${FILE_PREFIX}${fileId}`);
    return file || null;
  } catch (error) {
    console.error('Failed to get file:', error);
    return null;
  }
}

/**
 * Get list of all uploaded files (metadata only)
 */
export async function getFileList(): Promise<Array<Omit<UploadedFile, 'content'>>> {
  try {
    const list = await get<Array<Omit<UploadedFile, 'content'>>>(FILE_LIST_KEY);
    return list || [];
  } catch (error) {
    console.error('Failed to get file list:', error);
    return [];
  }
}

/**
 * Delete file
 */
export async function deleteFile(fileId: string): Promise<void> {
  try {
    await del(`${FILE_PREFIX}${fileId}`);
    
    // Update file list
    const fileList = await getFileList();
    const updatedList = fileList.filter(f => f.id !== fileId);
    await set(FILE_LIST_KEY, updatedList);
  } catch (error) {
    console.error('Failed to delete file:', error);
    throw new Error('Failed to delete file');
  }
}

/**
 * Get total storage size
 */
export async function getStorageSize(): Promise<number> {
  try {
    const fileList = await getFileList();
    return fileList.reduce((total, file) => total + file.size, 0);
  } catch (error) {
    console.error('Failed to calculate storage size:', error);
    return 0;
  }
}

/**
 * Clear all files
 */
export async function clearAllFiles(): Promise<void> {
  try {
    const allKeys = await keys();
    const fileKeys = allKeys.filter(key => 
      typeof key === 'string' && key.startsWith(FILE_PREFIX)
    );
    
    await Promise.all(fileKeys.map(key => del(key)));
    await set(FILE_LIST_KEY, []);
  } catch (error) {
    console.error('Failed to clear files:', error);
    throw new Error('Failed to clear files');
  }
}

/**
 * Get all files with full content
 */
export async function getAllFiles(): Promise<UploadedFile[]> {
  try {
    const fileList = await getFileList();
    const files = await Promise.all(
      fileList.map(meta => getFile(meta.id))
    );
    return files.filter((f): f is UploadedFile => f !== null);
  } catch (error) {
    console.error('Failed to get all files:', error);
    return [];
  }
}
