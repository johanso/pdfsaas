/**
 * Hook para desbloquear PDFs protegidos con contraseña
 * Refactorizado usando createPdfToolHook factory
 */

import { useCallback } from "react";
import { createPdfToolHook } from "./factories/createPdfToolHook";
import type { ProcessingResult } from "./core/useToolProcessor";

// ============================================================================
// TYPES
// ============================================================================

export interface UnlockOptions {
  password: string;
  fileName: string;
}

export interface UnlockResult extends ProcessingResult {
  fileId: string;
  fileName: string;
  originalSize: number;
  resultSize: number;
}

export interface UnlockCheckResult {
  success: boolean;
  isEncrypted: boolean;
  encryptionInfo?: string;
  message?: string;
}

export interface UnlockInfo {
  message: string;
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
const useUnlockPdfBase = createPdfToolHook<UnlockOptions, UnlockResult>({
  toolId: "unlock-pdf",
  endpoint: "/api/worker/unlock-pdf",
  operationName: "Desbloqueando PDF...",

  buildFormData: (file, options) => [
    ["password", options.password],
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
 * Hook público con funcionalidad adicional específica
 * Mantiene el método 'unlock' usado por componentes existentes
 * y agrega funciones específicas de unlock (checkEncryption, getInfo)
 */
export function useUnlockPdf() {
  const hook = useUnlockPdfBase();

  /**
   * Verifica si un PDF está encriptado y obtiene información sobre la encriptación
   */
  const checkEncryption = useCallback(async (file: File): Promise<UnlockCheckResult> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/worker/unlock-pdf/check", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al verificar el PDF");
      }

      const data: UnlockCheckResult = await response.json();
      return data;
    } catch (error) {
      console.error("Error en checkEncryption:", error);
      throw error;
    }
  }, []);

  /**
   * Obtiene información sobre el servicio de desbloqueo
   */
  const getInfo = useCallback(async (): Promise<UnlockInfo> => {
    const response = await fetch("/api/worker/unlock-pdf/info");
    if (!response.ok) {
      throw new Error("Error al obtener información del servicio");
    }
    return response.json();
  }, []);

  return {
    ...hook,
    unlock: hook.process,
    checkEncryption,
    getInfo,
  };
}
