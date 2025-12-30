/**
 * Configuración centralizada de límites de archivos
 * Los valores se pueden sobrescribir con variables de entorno
 */

// Límites de tamaño en bytes
export const FILE_SIZE_LIMITS = {
  // Máximo por archivo individual
  max: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || "157286400"), // 150MB por defecto
  
  // Máximo total del lote (archivos actuales + nuevos)
  maxBatch: parseInt(process.env.NEXT_PUBLIC_MAX_BATCH_SIZE || "524288000"), // 500MB por defecto
};

/**
 * Formatea bytes a un formato legible
 * @param bytes - Número de bytes a formatear
 * @returns String con formato legible (B, KB, MB, GB)
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
