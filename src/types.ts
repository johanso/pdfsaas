export interface PdfFile {
    id: string;
    file: File;
    name: string;
    rotation: number; // 0, 90, 180, 270
    pageCount?: number; // Optional: number of pages in the PDF
}
