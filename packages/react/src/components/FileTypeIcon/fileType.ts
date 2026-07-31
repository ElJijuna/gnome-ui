import {
  ApplicationXExecutable,
  AudioXGeneric,
  Document,
  Folder,
  FontXGeneric,
  ImageXGeneric,
  PackageXGeneric,
  TextXGeneric,
  VideoXGeneric,
  XOfficeDocument,
  XOfficePresentation,
  XOfficeSpreadsheet,
} from '@gnome-ui/icons';
import type { IconDefinition } from '@gnome-ui/icons';

export type FileTypeCategory =
  | 'folder'
  | 'image'
  | 'audio'
  | 'video'
  | 'text'
  | 'pdf'
  | 'archive'
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'font'
  | 'executable'
  | 'unknown';

const CATEGORY_ICON: Record<FileTypeCategory, IconDefinition> = {
  folder: Folder,
  image: ImageXGeneric,
  audio: AudioXGeneric,
  video: VideoXGeneric,
  text: TextXGeneric,
  pdf: Document,
  archive: PackageXGeneric,
  document: XOfficeDocument,
  spreadsheet: XOfficeSpreadsheet,
  presentation: XOfficePresentation,
  font: FontXGeneric,
  executable: ApplicationXExecutable,
  unknown: TextXGeneric,
};

const CATEGORY_LABEL: Record<FileTypeCategory, string> = {
  folder: 'Folder',
  image: 'Image file',
  audio: 'Audio file',
  video: 'Video file',
  text: 'Text file',
  pdf: 'PDF document',
  archive: 'Archive',
  document: 'Document',
  spreadsheet: 'Spreadsheet',
  presentation: 'Presentation',
  font: 'Font file',
  executable: 'Executable',
  unknown: 'File',
};

const EXTENSION_CATEGORY: Record<string, FileTypeCategory> = {
  // Image
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  gif: 'image',
  webp: 'image',
  svg: 'image',
  bmp: 'image',
  ico: 'image',
  tiff: 'image',
  heic: 'image',
  // Audio
  mp3: 'audio',
  wav: 'audio',
  ogg: 'audio',
  flac: 'audio',
  m4a: 'audio',
  aac: 'audio',
  // Video
  mp4: 'video',
  mov: 'video',
  avi: 'video',
  mkv: 'video',
  webm: 'video',
  m4v: 'video',
  // PDF
  pdf: 'pdf',
  // Archive
  zip: 'archive',
  tar: 'archive',
  gz: 'archive',
  rar: 'archive',
  '7z': 'archive',
  xz: 'archive',
  // Office document
  doc: 'document',
  docx: 'document',
  odt: 'document',
  rtf: 'document',
  // Spreadsheet
  xls: 'spreadsheet',
  xlsx: 'spreadsheet',
  ods: 'spreadsheet',
  csv: 'spreadsheet',
  // Presentation
  ppt: 'presentation',
  pptx: 'presentation',
  odp: 'presentation',
  // Font
  ttf: 'font',
  otf: 'font',
  woff: 'font',
  woff2: 'font',
  // Executable
  exe: 'executable',
  app: 'executable',
  sh: 'executable',
  bin: 'executable',
  // Text / code — freedesktop groups source code under the generic text-x-generic icon.
  txt: 'text',
  md: 'text',
  log: 'text',
  json: 'text',
  yaml: 'text',
  yml: 'text',
  toml: 'text',
  xml: 'text',
  html: 'text',
  css: 'text',
  js: 'text',
  jsx: 'text',
  ts: 'text',
  tsx: 'text',
  py: 'text',
  rb: 'text',
  go: 'text',
  rs: 'text',
  c: 'text',
  cpp: 'text',
  h: 'text',
  java: 'text',
  sql: 'text',
};

const MIME_TOP_LEVEL_CATEGORY: Partial<Record<string, FileTypeCategory>> = {
  image: 'image',
  audio: 'audio',
  video: 'video',
  text: 'text',
  font: 'font',
};

const MIME_SUBTYPE_CATEGORY: Record<string, FileTypeCategory> = {
  pdf: 'pdf',
  zip: 'archive',
  gzip: 'archive',
  'x-tar': 'archive',
  'x-7z-compressed': 'archive',
  'x-rar-compressed': 'archive',
  'vnd.rar': 'archive',
  msword: 'document',
  'vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
  'vnd.oasis.opendocument.text': 'document',
  'vnd.ms-excel': 'spreadsheet',
  'vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'spreadsheet',
  'vnd.oasis.opendocument.spreadsheet': 'spreadsheet',
  'vnd.ms-powerpoint': 'presentation',
  'vnd.openxmlformats-officedocument.presentationml.presentation': 'presentation',
  'vnd.oasis.opendocument.presentation': 'presentation',
  'x-sh': 'executable',
  'x-executable': 'executable',
};

/** Resolves a file-type category from a MIME type (e.g. `"image/png"`). */
export function categoryFromMimeType(mimeType: string): FileTypeCategory | null {
  const normalized = mimeType.trim().toLowerCase();

  if (normalized === 'inode/directory') {
    return 'folder';
  }

  const [topLevel, subtype] = normalized.split('/');

  if (subtype && MIME_SUBTYPE_CATEGORY[subtype]) {
    return MIME_SUBTYPE_CATEGORY[subtype];
  }

  return MIME_TOP_LEVEL_CATEGORY[topLevel] ?? null;
}

/** Resolves a file-type category from a file name's extension (e.g. `"report.pdf"`). */
export function categoryFromName(name: string): FileTypeCategory | null {
  const trimmed = name.trim().replace(/^\.+/, '');
  const lastDot = trimmed.lastIndexOf('.');

  if (lastDot <= 0) {
    return null;
  }

  const extension = trimmed.slice(lastDot + 1).toLowerCase();

  return EXTENSION_CATEGORY[extension] ?? null;
}

export function getFileTypeIcon(category: FileTypeCategory): IconDefinition {
  return CATEGORY_ICON[category];
}

export function getFileTypeLabel(category: FileTypeCategory): string {
  return CATEGORY_LABEL[category];
}
