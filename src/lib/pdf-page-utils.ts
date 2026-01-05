// El import de PDFDocument se movió a inside de la función para lazy loading
// import { PDFDocument } from "pdf-lib";

/**
 * Creates a new PDF blob containing only the specified pages from the original file.
 * @param file The original PDF file
 * @param pageIndices Array of 0-based page indices to include
 * @returns A promise that resolves to a Blob of the new PDF
 */
export async function extractPagesToBlob(file: File, pageIndices: number[]): Promise<Blob> {
    const { PDFDocument } = await import("pdf-lib");
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    const newPdfDoc = await PDFDocument.create();

    // Copy pages
    const copiedPages = await newPdfDoc.copyPages(pdfDoc, pageIndices);

    // Add pages to new document
    copiedPages.forEach((page) => {
        newPdfDoc.addPage(page);
    });

    const pdfBytes = await newPdfDoc.save();
    return new Blob([pdfBytes as any], { type: "application/pdf" });
}
