import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/api";
import { gzipSync } from "fflate";

interface ProcessOptions {
  endpoint: string;
  successMessage?: string;
  errorMessage?: string;
  extension?: string;
  operation?: string;
  compress?: boolean; // Nueva opción para habilitar compresión
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onContinueEditing?: () => void;
  onStartNew?: () => void;
}

export interface UploadStats {
  currentFile: number;
  totalFiles: number;
  currentFileName: string;
  currentFileSize: number;
  compressedSize: number;
  bytesUploaded: number;
  totalBytes: number;
  speed: number;
  timeRemaining: number;
  compressionRatio: number;
  phase: "compressing" | "uploading";
}

interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  isComplete: boolean;
  fileName: string;
  operation: string;
  phase: "idle" | "compressing" | "uploading" | "processing" | "ready";
  uploadStats: UploadStats | null;
}

// Helper para formatear bytes
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Helper para formatear tiempo
export function formatTime(seconds: number): string {
  if (!seconds || seconds === Infinity || isNaN(seconds)) return "--";
  if (seconds < 60) return `${Math.round(seconds)} seg`;
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")} min`;
  }
  return `${Math.round(seconds / 3600)} h`;
}

// Comprimir archivo usando gzip
async function compressFile(file: File): Promise<{ blob: Blob; originalSize: number; compressedSize: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  // Comprimir con gzip
  const compressed = gzipSync(uint8Array, { level: 6 });

  return {
    blob: new Blob([new Uint8Array(compressed)], { type: "application/gzip" }),
    originalSize: file.size,
    compressedSize: compressed.length,
  };
}

export function usePdfProcessing() {
  const [state, setState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    isComplete: false,
    fileName: "",
    operation: "",
    phase: "idle",
    uploadStats: null,
  });

  const [downloadInfo, setDownloadInfo] = useState<{
    fileId: string;
    fileName: string;
  } | null>(null);

  const speedSamples = useRef<number[]>([]);
  const lastProgressTime = useRef<number>(0);
  const lastProgressBytes = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cancelar proceso
  const cancelProcess = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState({
      isProcessing: false,
      progress: 0,
      isComplete: false,
      fileName: "",
      operation: "",
      phase: "idle",
      uploadStats: null,
    });
    toast.info("Proceso cancelado");
  }, []);

  // Calcular velocidad promedio
  const calculateSpeed = useCallback((loaded: number, timestamp: number) => {
    if (lastProgressTime.current === 0) {
      lastProgressTime.current = timestamp;
      lastProgressBytes.current = loaded;
      return 0;
    }

    const timeDiff = (timestamp - lastProgressTime.current) / 1000;
    const bytesDiff = loaded - lastProgressBytes.current;

    if (timeDiff > 0.1) {
      const currentSpeed = bytesDiff / timeDiff;
      speedSamples.current.push(currentSpeed);

      if (speedSamples.current.length > 10) {
        speedSamples.current.shift();
      }

      lastProgressTime.current = timestamp;
      lastProgressBytes.current = loaded;
    }

    if (speedSamples.current.length === 0) return 0;
    return speedSamples.current.reduce((a, b) => a + b, 0) / speedSamples.current.length;
  }, []);

  const processAndDownload = async (
    fileName: string,
    formData: FormData,
    options: ProcessOptions
  ) => {
    const ext = options.extension || "pdf";
    const fullFileName = `${fileName}.${ext}`;
    const useCompression = options.compress !== false; // Por defecto comprime

    // Reset speed tracking
    speedSamples.current = [];
    lastProgressTime.current = 0;
    lastProgressBytes.current = 0;

    // Extraer archivos del FormData
    const files: File[] = [];
    const otherEntries: [string, FormDataEntryValue][] = [];

    formData.forEach((value, key) => {
      if (value instanceof File) {
        files.push(value);
      } else {
        otherEntries.push([key, value]);
      }
    });

    const totalOriginalSize = files.reduce((acc, f) => acc + f.size, 0) || 1;

    setState({
      isProcessing: true,
      progress: 0,
      isComplete: false,
      fileName: fullFileName,
      operation: useCompression ? "Preparando archivos" : "Preparando archivos",
      phase: useCompression ? "compressing" : "uploading",
      uploadStats: {
        currentFile: 1,
        totalFiles: Math.max(files.length, 1),
        currentFileName: files[0]?.name || fullFileName,
        currentFileSize: files[0]?.size || 0,
        compressedSize: 0,
        bytesUploaded: 0,
        totalBytes: totalOriginalSize,
        speed: 0,
        timeRemaining: 0,
        compressionRatio: 0,
        phase: useCompression ? "compressing" : "uploading",
      },
    });

    try {
      // ===== FASE 1: COMPRESIÓN (si está habilitada) =====
      let uploadFormData = formData;
      let totalCompressedSize = totalOriginalSize;

      if (useCompression && files.length > 0) {
        uploadFormData = new FormData();

        // Agregar datos no-archivo
        otherEntries.forEach(([key, value]) => {
          uploadFormData.append(key, value);
        });

        // Comprimir cada archivo
        let totalCompressed = 0;

        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          setState((prev) => ({
            ...prev,
            operation: `Preparando ${i + 1} de ${files.length}`,
            progress: (i / files.length) * 15, // 0-15% para compresión
            uploadStats: prev.uploadStats ? {
              ...prev.uploadStats,
              currentFile: i + 1,
              currentFileName: file.name,
              currentFileSize: file.size,
              phase: "compressing",
            } : null,
          }));

          const { blob, compressedSize } = await compressFile(file);
          totalCompressed += compressedSize;

          // Agregar archivo comprimido con extensión .gz
          uploadFormData.append("files", blob, file.name + ".gz");
        }

        totalCompressedSize = totalCompressed;

        // Indicar al servidor que los archivos están comprimidos
        uploadFormData.append("compressed", "true");

        const ratio = ((1 - totalCompressedSize / totalOriginalSize) * 100);

        setState((prev) => ({
          ...prev,
          progress: 15,
          operation: `Preparado ${ratio.toFixed(0)}% - Subiendo`,
          phase: "uploading",
          uploadStats: prev.uploadStats ? {
            ...prev.uploadStats,
            compressedSize: totalCompressedSize,
            totalBytes: totalCompressedSize,
            compressionRatio: ratio,
            phase: "uploading",
          } : null,
        }));
      }

      // ===== FASE 2: UPLOAD =====
      abortControllerRef.current = new AbortController();

      const result = await new Promise<{ fileId: string; fileName: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        let currentFileIndex = 0;

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            // Progreso: 15-85% (si comprimió) o 0-85% (sin compresión)
            const baseProgress = useCompression ? 15 : 0;
            const uploadProgress = baseProgress + (e.loaded / e.total) * (85 - baseProgress);

            // Estimar archivo actual
            if (files.length > 1) {
              let accumulatedSize = 0;
              for (let i = 0; i < files.length; i++) {
                accumulatedSize += files[i].size;
                if (e.loaded <= accumulatedSize) {
                  currentFileIndex = i;
                  break;
                }
              }
            }

            const speed = calculateSpeed(e.loaded, Date.now());
            const remainingBytes = e.total - e.loaded;
            const timeRemaining = speed > 0 ? remainingBytes / speed : 0;

            setState((prev) => ({
              ...prev,
              progress: uploadProgress,
              operation: files.length > 1
                ? `Subiendo ${currentFileIndex + 1} de ${files.length}`
                : "Subiendo archivo",
              uploadStats: prev.uploadStats ? {
                ...prev.uploadStats,
                currentFile: currentFileIndex + 1,
                currentFileName: files[currentFileIndex]?.name || fullFileName,
                bytesUploaded: e.loaded,
                totalBytes: e.total,
                speed,
                timeRemaining,
                phase: "uploading",
              } : null,
            }));
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              if (response.fileId) {
                resolve({
                  fileId: response.fileId,
                  fileName: response.fileName || fullFileName,
                });
              } else if (response.error) {
                reject(new Error(response.error));
              } else {
                reject(new Error("Respuesta inesperada"));
              }
            } catch {
              reject(new Error("Error parseando respuesta"));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(new Error(errorData.error || `Error ${xhr.status}`));
            } catch {
              reject(new Error(`Error ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Error de red"));
        });

        xhr.addEventListener("abort", () => {
          reject(new Error("Cancelado por el usuario"));
        });

        // Conectar abort signal
        abortControllerRef.current!.signal.addEventListener("abort", () => {
          xhr.abort();
        });

        xhr.open("POST", getApiUrl(options.endpoint));
        xhr.send(uploadFormData);
      });

      // Guardar info para descarga
      setDownloadInfo({
        fileId: result.fileId,
        fileName: fullFileName,
      });

      // ===== FASE 3: PROCESANDO =====
      setState((prev) => ({
        ...prev,
        progress: 90,
        phase: "processing",
        operation: "Procesando",
        uploadStats: null,
      }));

      await new Promise((r) => setTimeout(r, 2000));

      // ===== FASE 4: DESCARGA =====
      setState((prev) => ({
        ...prev,
        progress: 100,
        phase: "ready",
        operation: "¡Listo! Descargando",
      }));

      // Trigger descarga nativa
      const downloadUrl = getApiUrl(`/api/worker/download/${result.fileId}`);
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fullFileName;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Marcar como completo
      await new Promise((r) => setTimeout(r, 300));
      setState((prev) => ({ ...prev, isComplete: true }));

      toast.success(options.successMessage || "¡Archivo procesado correctamente!");
      options.onSuccess?.();

      return true;
    } catch (error) {
      if (error instanceof Error && error.message === "Cancelado por el usuario") {
        return false;
      }
      const msg = error instanceof Error ? error.message : "Error al procesar";
      toast.error(msg);
      options.onError?.(error instanceof Error ? error : new Error(msg));

      setState({
        isProcessing: false,
        progress: 0,
        isComplete: false,
        fileName: "",
        operation: "",
        phase: "idle",
        uploadStats: null,
      });

      return false;
    }
  };

  const handleDownloadAgain = async () => {
    if (!downloadInfo) return;

    const downloadUrl = getApiUrl(`/api/worker/download/${downloadInfo.fileId}`);
    const response = await fetch(downloadUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadInfo.fileName;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Archivo descargado nuevamente");
  };

  const handleContinueEditing = (callback?: () => void) => {
    setState({
      isProcessing: false,
      progress: 0,
      isComplete: false,
      fileName: "",
      operation: "",
      phase: "idle",
      uploadStats: null,
    });
    setDownloadInfo(null);
    callback?.();
  };

  const handleStartNew = (callback?: () => void) => {
    setState({
      isProcessing: false,
      progress: 0,
      isComplete: false,
      fileName: "",
      operation: "",
      phase: "idle",
      uploadStats: null,
    });
    setDownloadInfo(null);
    callback?.();
  };

  return {
    isProcessing: state.isProcessing,
    progress: state.progress,
    isComplete: state.isComplete,
    fileName: state.fileName,
    operation: state.operation,
    phase: state.phase,
    uploadStats: state.uploadStats,
    processAndDownload,
    handleDownloadAgain,
    handleContinueEditing,
    handleStartNew,
    cancelProcess,
  };
}