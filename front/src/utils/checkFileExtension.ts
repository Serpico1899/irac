// File extension validation utilities

// Image file extensions
const IMAGE_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'bmp',
  'webp',
  'svg',
  'ico',
  'tiff',
  'tif'
] as const;

// PDF file extensions
const PDF_EXTENSIONS = ['pdf'] as const;

// GeoJSON file extensions
const GEOJSON_EXTENSIONS = ['geojson', 'json'] as const;

// Document file extensions
const DOCUMENT_EXTENSIONS = [
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'txt',
  'rtf',
  'odt',
  'ods',
  'odp'
] as const;

// Video file extensions
const VIDEO_EXTENSIONS = [
  'mp4',
  'avi',
  'mov',
  'wmv',
  'flv',
  'webm',
  'mkv',
  '3gp',
  'm4v'
] as const;

// Audio file extensions
const AUDIO_EXTENSIONS = [
  'mp3',
  'wav',
  'flac',
  'aac',
  'ogg',
  'wma',
  'm4a'
] as const;

// Archive file extensions
const ARCHIVE_EXTENSIONS = [
  'zip',
  'rar',
  '7z',
  'tar',
  'gz',
  'bz2',
  'xz'
] as const;

/**
 * Extract file extension from filename
 */
export function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) {
    return '';
  }
  return filename.slice(lastDotIndex + 1).toLowerCase();
}

/**
 * Check if file extension is valid for images
 */
export function isValidImageExtension(filename: string): boolean {
  const extension = getFileExtension(filename);
  return IMAGE_EXTENSIONS.includes(extension as any);
}

/**
 * Check if file extension is valid for PDF files
 */
export function isValidPdfExtension(filename: string): boolean {
  const extension = getFileExtension(filename);
  return PDF_EXTENSIONS.includes(extension as any);
}

/**
 * Check if file extension is valid for GeoJSON files
 */
export function isValidGeoJsonExtension(filename: string): boolean {
  const extension = getFileExtension(filename);
  return GEOJSON_EXTENSIONS.includes(extension as any);
}

/**
 * Check if file extension is valid for documents
 */
export function isValidDocumentExtension(filename: string): boolean {
  const extension = getFileExtension(filename);
  return DOCUMENT_EXTENSIONS.includes(extension as any);
}

/**
 * Check if file extension is valid for videos
 */
export function isValidVideoExtension(filename: string): boolean {
  const extension = getFileExtension(filename);
  return VIDEO_EXTENSIONS.includes(extension as any);
}

/**
 * Check if file extension is valid for audio files
 */
export function isValidAudioExtension(filename: string): boolean {
  const extension = getFileExtension(filename);
  return AUDIO_EXTENSIONS.includes(extension as any);
}

/**
 * Check if file extension is valid for archives
 */
export function isValidArchiveExtension(filename: string): boolean {
  const extension = getFileExtension(filename);
  return ARCHIVE_EXTENSIONS.includes(extension as any);
}

/**
 * Get MIME type from file extension
 */
export function getMimeTypeFromExtension(filename: string): string {
  const extension = getFileExtension(filename);

  const mimeTypes: Record<string, string> = {
    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    bmp: 'image/bmp',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    ico: 'image/x-icon',
    tiff: 'image/tiff',
    tif: 'image/tiff',

    // Documents
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    rtf: 'application/rtf',

    // GeoJSON
    geojson: 'application/geo+json',
    json: 'application/json',

    // Videos
    mp4: 'video/mp4',
    avi: 'video/x-msvideo',
    mov: 'video/quicktime',
    wmv: 'video/x-ms-wmv',
    flv: 'video/x-flv',
    webm: 'video/webm',
    mkv: 'video/x-matroska',

    // Audio
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    flac: 'audio/flac',
    aac: 'audio/aac',
    ogg: 'audio/ogg',

    // Archives
    zip: 'application/zip',
    rar: 'application/vnd.rar',
    '7z': 'application/x-7z-compressed',
    tar: 'application/x-tar',
    gz: 'application/gzip'
  };

  return mimeTypes[extension] || 'application/octet-stream';
}

/**
 * Validate file extension against allowed extensions
 */
export function isValidExtension(filename: string, allowedExtensions: string[]): boolean {
  const extension = getFileExtension(filename);
  return allowedExtensions.map(ext => ext.toLowerCase()).includes(extension);
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if file size is within limit
 */
export function isValidFileSize(file: File, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}

/**
 * Validate file against multiple criteria
 */
export function validateFile(
  file: File,
  options: {
    allowedExtensions?: string[];
    maxSizeInMB?: number;
    minSizeInKB?: number;
  } = {}
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check file extension
  if (options.allowedExtensions && options.allowedExtensions.length > 0) {
    if (!isValidExtension(file.name, options.allowedExtensions)) {
      errors.push(`نوع فایل مجاز نیست. انواع مجاز: ${options.allowedExtensions.join(', ')}`);
    }
  }

  // Check file size (max)
  if (options.maxSizeInMB && !isValidFileSize(file, options.maxSizeInMB)) {
    errors.push(`حجم فایل نباید بیشتر از ${options.maxSizeInMB} مگابایت باشد`);
  }

  // Check file size (min)
  if (options.minSizeInKB) {
    const minSizeInBytes = options.minSizeInKB * 1024;
    if (file.size < minSizeInBytes) {
      errors.push(`حجم فایل نباید کمتر از ${options.minSizeInKB} کیلوبایت باشد`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get file type category
 */
export function getFileCategory(filename: string): 'image' | 'document' | 'video' | 'audio' | 'archive' | 'geojson' | 'other' {
  if (isValidImageExtension(filename)) return 'image';
  if (isValidDocumentExtension(filename)) return 'document';
  if (isValidVideoExtension(filename)) return 'video';
  if (isValidAudioExtension(filename)) return 'audio';
  if (isValidArchiveExtension(filename)) return 'archive';
  if (isValidGeoJsonExtension(filename)) return 'geojson';
  return 'other';
}

/**
 * Get file icon based on extension
 */
export function getFileIcon(filename: string): string {
  const category = getFileCategory(filename);

  const icons = {
    image: '🖼️',
    document: '📄',
    video: '🎥',
    audio: '🎵',
    archive: '📦',
    geojson: '🗺️',
    other: '📁'
  };

  return icons[category];
}
