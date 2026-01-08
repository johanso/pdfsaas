/**
 * Hooks públicos para herramientas de procesamiento PDF
 */

// Hooks de herramientas (sin re-exportar UploadStats para evitar conflicto)
export { useCompressPdf, type CompressOptions, type CompressResult } from "./useCompressPdf";
export { useFlattenPdf, type FlattenOptions, type FlattenResult } from "./useFlattenPdf";
export { useGrayscalePdf, type GrayscaleOptions, type GrayscaleResult } from "./useGrayscalePdf";
export { useProtectPdf, type ProtectOptions, type ProtectResult } from "./useProtectPdf";
export { useRepairPdf, type RepairOptions, type RepairResult } from "./useRepairPdf";
export { useOcrPdf, type OcrStatus } from "./useOcrPdf";

// Otros hooks
export { usePdfToImage } from "./usePdfToImage";
export { useImageToPdf } from "./useImageToPdf";

// Hooks de utilidad públicos
export { usePdfFiles } from "./usePdfFiles";
export { usePdfLoader } from "./usePdfLoader";
export { usePdfPages } from "./usePdfPages";

// Core exports (Fuente única de verdad para tipos compartidos)
export {
    formatBytes,
    formatTime
} from "./core/useToolProcessor";

export type {
    UploadStats,
    ProcessingResult
} from "./core/useToolProcessor";
