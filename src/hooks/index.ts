/**
 * Hooks públicos para herramientas de procesamiento PDF
 */

// Hooks de herramientas PDF (via factory)
export { useCompressPdf, type CompressOptions, type CompressResult } from "./useCompressPdf";
export { useFlattenPdf, type FlattenOptions, type FlattenResult } from "./useFlattenPdf";
export { useGrayscalePdf, type GrayscaleOptions, type GrayscaleResult } from "./useGrayscalePdf";
export { useProtectPdf, type ProtectOptions, type ProtectResult } from "./useProtectPdf";
export { useRepairPdf, type RepairOptions, type RepairResult } from "./useRepairPdf";
export { useOcrPdf, type OcrStatus } from "./useOcrPdf";
export { useUnlockPdf } from "./useUnlockPdf";

// Hooks de herramientas PDF (con FormData personalizado)
export { useMergePdf, type MergeOptions, type MergeResult } from "./useMergePdf";
export { useSplitPdf, type SplitOptions, type SplitResult, type SplitMode } from "./useSplitPdf";
export { useRotatePdf, type RotateOptions, type RotateResult } from "./useRotatePdf";
export { useOrganizePdf, type OrganizeOptions, type OrganizeResult, type OrganizeInstruction } from "./useOrganizePdf";
export { useExtractPages, type ExtractOptions, type ExtractResult, type ExtractMode } from "./useExtractPages";
export { useDeletePages, type DeletePagesOptions, type DeletePagesResult } from "./useDeletePages";

// Hooks de conversión (Office a PDF)
export { useWordToPdf, type WordToPdfOptions, type WordToPdfResult } from "./useWordToPdf";
export { useExcelToPdf, type ExcelToPdfOptions, type ExcelToPdfResult } from "./useExcelToPdf";
export { usePowerPointToPdf, type PowerPointToPdfOptions, type PowerPointToPdfResult } from "./usePowerPointToPdf";
export { useHtmlToPdf, type HtmlToPdfOptions, type HtmlToPdfResult, type HtmlInputMode } from "./useHtmlToPdf";

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
