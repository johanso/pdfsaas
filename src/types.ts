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
}
