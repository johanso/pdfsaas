/**
 * Configuración de PDF.js
 * Centraliza la inicialización del worker de PDF.js
 */

let isWorkerConfigured = false;

/**
 * Configura PDF.js worker una sola vez
 * Debe llamarse antes de usar cualquier funcionalidad de pdfjs-dist
 */
export async function setupPdfjs(): Promise<void> {
    if (typeof window === "undefined") return;

    if (!isWorkerConfigured) {
        const pdfjsModule = await import("pdfjs-dist");
        const pdfjs = pdfjsModule.default || pdfjsModule;
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
        isWorkerConfigured = true;
    }
}

/**
 * Verifica si el worker ya está configurado
 */
export function isPdfjsConfigured(): boolean {
    return isWorkerConfigured;
}
