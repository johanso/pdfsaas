/**
 * Phase Mapper - Centraliza el mapeo de fases del procesador a fases legacy de UI
 * 
 * Este módulo elimina la duplicación de código que existía en múltiples hooks
 * donde cada uno mapeaba las fases del procesador a las fases esperadas por la UI.
 */

import type { ProcessingPhase } from "./useToolProcessor";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Fases legacy usadas por componentes de UI antiguos
 * Mantenemos compatibilidad mientras migramos gradualmente
 */
export type LegacyPhase =
  | "idle"
  | "preparing"
  | "compressing"
  | "uploading"
  | "processing"
  | "downloading"
  | "ready"
  | "error";

// ============================================================================
// MAPPER FUNCTION
// ============================================================================

/**
 * Mapea las fases del procesador central a las fases legacy de UI
 * 
 * @param phase - Fase actual del procesador
 * @returns Fase compatible con componentes UI legacy
 * 
 * @example
 * ```ts
 * const uiPhase = mapProcessorPhaseToLegacy(processor.phase);
 * // processor.phase = "preparing" → uiPhase = "compressing"
 * ```
 */
export function mapProcessorPhaseToLegacy(phase: ProcessingPhase): LegacyPhase {
  const phaseMap: Record<ProcessingPhase, LegacyPhase> = {
    idle: "idle",
    preparing: "compressing",
    uploading: "uploading",
    processing: "processing",
    downloading: "processing",
    complete: "ready",
    error: "error",
  };

  return phaseMap[phase] ?? "idle";
}

/**
 * Verifica si una fase indica que el proceso está activo
 */
export function isProcessingPhase(phase: ProcessingPhase | LegacyPhase): boolean {
  return !["idle", "complete", "ready", "error"].includes(phase);
}

/**
 * Verifica si una fase indica que el proceso terminó exitosamente
 */
export function isCompletePhase(phase: ProcessingPhase | LegacyPhase): boolean {
  return phase === "complete" || phase === "ready";
}

/**
 * Verifica si una fase indica un error
 */
export function isErrorPhase(phase: ProcessingPhase | LegacyPhase): boolean {
  return phase === "error";
}
