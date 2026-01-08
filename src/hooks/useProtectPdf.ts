/**
 * Hook para proteger PDFs con contraseña
 * Refactorizado usando createPdfToolHook factory
 */

import { createPdfToolHook } from "./factories/createPdfToolHook";
import type { ProcessingResult } from "./core/useToolProcessor";

// ============================================================================
// TYPES
// ============================================================================

export type EncryptionLevel = "128" | "256";

export interface ProtectOptions {
  userPassword: string;
  encryption: EncryptionLevel;
  fileName: string;
}

export interface ProtectResult extends ProcessingResult {
  fileId: string;
  fileName: string;
  originalSize: number;
  resultSize: number;
  encryption: string;
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
const useProtectPdfBase = createPdfToolHook<ProtectOptions, ProtectResult>({
  toolId: "protect-pdf",
  endpoint: "/api/worker/protect-pdf",
  operationName: "Protegiendo PDF...",

  buildFormData: (file, options) => [
    ["password", options.userPassword],
    ["encryption", options.encryption],
  ],

  getFileName: (result, original) => result.fileName,

  progressWeights: {
    preparing: 5,
    uploading: 35,
    processing: 50,
    downloading: 10,
  },
});

/**
 * Hook público con compatibilidad legacy
 * Mantiene el método 'protect' usado por componentes existentes
 */
export function useProtectPdf() {
  const hook = useProtectPdfBase();

  return {
    ...hook,
    // Alias para compatibilidad con código existente
    protect: hook.process,
  };
}
