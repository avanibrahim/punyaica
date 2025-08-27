// File utilities for Journal Manager

export const BASE_URL = 'http://localhost:3000'; // Change this to your backend URL

export interface FileItem {
  id: number;
  title: string;
  original_name: string;
  mimetype: string;
  size: number;
  uploaded_at: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export type FileType = 'pdf' | 'doc' | 'sheet' | 'img' | 'zip' | 'other';

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const getFileType = (mimetype: string, filename: string): FileType => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  
  if (mimetype.includes('pdf') || ext === 'pdf') return 'pdf';
  
  if (mimetype.includes('word') || 
      mimetype.includes('document') || 
      ['doc', 'docx'].includes(ext)) return 'doc';
  
  if (mimetype.includes('sheet') || 
      mimetype.includes('excel') || 
      ['xls', 'xlsx', 'csv'].includes(ext)) return 'sheet';
  
  if (mimetype.includes('image') || 
      ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return 'img';
  
  if (mimetype.includes('zip') || 
      mimetype.includes('archive') || 
      ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'zip';
  
  return 'other';
};

export const getFileTypeLabel = (type: FileType): string => {
  const labels = {
    pdf: 'PDF',
    doc: 'DOC',
    sheet: 'SHEET',
    img: 'IMG',
    zip: 'ZIP',
    other: 'FILE'
  };
  return labels[type];
};

export const getFileTypeColor = (type: FileType): string => {
  const colors = {
    pdf: 'bg-red-500/20 text-red-300 border-red-500/30',
    doc: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    sheet: 'bg-green-500/20 text-green-300 border-green-500/30',
    img: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    zip: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    other: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  };
  return colors[type];
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Makassar',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const uploadFile = async (
  file: File,
  title?: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<FileItem> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    
    formData.append('file', file);
    if (title) formData.append('title', title);
    
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const percentage = Math.round((e.loaded / e.total) * 100);
        onProgress({ loaded: e.loaded, total: e.total, percentage });
      }
    };
    
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error('Invalid response format'));
        }
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    };
    
    xhr.onerror = () => reject(new Error('Upload failed'));
    
    xhr.open('POST', `${BASE_URL}/api/upload`);
    xhr.send(formData);
  });
};