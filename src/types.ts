export interface PdfFile {
  id: string;
  file: File;
  name: string;
  rotation: number; // 0, 90, 180, 270
  pageCount?: number; // Optional: number of pages in the PDF
}

export interface PageData {
  id: string;
  originalIndex: number; // 1-based index from the PDF
  rotation: number;
  file: File;
  isBlank: boolean;
}

export interface PdfToolbarProps {
  onAdd?: () => void;
  textAdd?: string;
  onReset?: () => void;
  className?: string;
}

// PDF to Image / Image to PDF conversion types
export type ImageFormat = "jpg" | "png" | "webp" | "tiff" | "bmp";
export type DpiOption = 72 | 150 | 300 | 600;

export interface FormatInfo {
  label: string;
  description: string;
  supportsQuality: boolean;
  requiresServer: boolean;
  recommended?: boolean;
}