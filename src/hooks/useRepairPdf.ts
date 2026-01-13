/**
 * Hook para reparar PDFs dañados o corruptos
 * Refactorizado usando createPdfToolHook factory
 */

import { createPdfToolHook } from "./factories/createPdfToolHook";
import type { ProcessingResult } from "./core/useToolProcessor";

// ============================================================================
// TYPES
// ============================================================================

export type RepairMode = "auto" | "aggressive" | "linearize";

export interface RepairOptions {
  mode: RepairMode;
  fileName: string;
}

export interface RepairResult extends ProcessingResult {
  fileId: string;
  fileName: string;
  originalSize: number;
  resultSize: number;
  mode: RepairMode;
  repairActions: string[];
  warnings: string[];
  fullyRepaired: boolean;
}

export interface RepairCheckResult {
  success: boolean;
  fileName: string;
  status: "ok" | "damaged" | "encrypted" | "invalid";
  issues: string[];
  canRepair: boolean;
  recommendation: string;
}

// Re-exports para compatibilidad
export { formatBytes, formatTime } from "./core/useToolProcessor";
export type { UploadStats } from "./core/useToolProcessor";

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook base creado con factory
 */
const useRepairPdfBase = createPdfToolHook<RepairOptions, RepairResult>({
  toolId: "repair-pdf",
  endpoint: "/api/worker/repair-pdf",
  operationName: "Reparando documento...",

  buildFormData: (file, options) => [
    ["mode", options.mode],
    ["fileName", options?.fileName || ''],
  ],

  getFileName: (result, original) =>
    result.fileName || original.replace(".pdf", "-repaired.pdf"),

  progressWeights: {
    preparing: 5,
    uploading: 35,
    processing: 50,
    downloading: 10,
  },
});

/**
 * Hook público con compatibilidad legacy
 * Mantiene el método 'repair' usado por componentes existentes
 */
export function useRepairPdf() {
  const hook = useRepairPdfBase();

  return {
    ...hook,
    // Alias para compatibilidad con código existente
    repair: hook.process,
  };
}
