import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/api";

interface ProcessOptions {
  endpoint: string;
  successMessage?: string;
  errorMessage?: string;
  extension?: string;
  operation?: string;
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
  bytesUploaded: number;
  totalBytes: number;
  speed: number;
  timeRemaining: number;
}

interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  isComplete: boolean;
  fileName: string;
  operation: string;
  phase: "idle" | "uploading" | "processing" | "ready";
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

    // Reset speed tracking
    speedSamples.current = [];
    lastProgressTime.current = 0;
    lastProgressBytes.current = 0;

    // Extraer archivos del FormData
    const files: File[] = [];
    formData.forEach((value) => {
      if (value instanceof File) {
        files.push(value);
      }
    });

    const totalBytes = files.reduce((acc, f) => acc + f.size, 0) || 1;

    setState({
      isProcessing: true,
      progress: 0,
      isComplete: false,
      fileName: fullFileName,
      operation: "Subiendo archivos",
      phase: "uploading",
      uploadStats: {
        currentFile: 1,
        totalFiles: Math.max(files.length, 1),
        currentFileName: files[0]?.name || fullFileName,
        currentFileSize: files[0]?.size || 0,
        bytesUploaded: 0,
        totalBytes,
        speed: 0,
        timeRemaining: 0,
      },
    });

    try {
      const result = await new Promise<{ fileId: string; fileName: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        let currentFileIndex = 0;

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const uploadProgress = (e.loaded / e.total) * 85;

            // Estimar archivo actual basado en bytes
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
                ? `Subiendo archivo ${currentFileIndex + 1} de ${files.length}`
                : "Subiendo archivo",
              uploadStats: {
                currentFile: currentFileIndex + 1,
                totalFiles: Math.max(files.length, 1),
                currentFileName: files[currentFileIndex]?.name || fullFileName,
                currentFileSize: files[currentFileIndex]?.size || e.total,
                bytesUploaded: e.loaded,
                totalBytes: e.total,
                speed,
                timeRemaining,
              },
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

        xhr.open("POST", getApiUrl(options.endpoint));
        xhr.send(formData);
      });

      // Guardar info para descarga
      setDownloadInfo({
        fileId: result.fileId,
        fileName: fullFileName,
      });

      // ===== FASE 2: PROCESANDO =====
      setState((prev) => ({
        ...prev,
        progress: 90,
        phase: "processing",
        operation: "Procesando en servidor",
        uploadStats: null,
      }));

      await new Promise((r) => setTimeout(r, 500));

      // ===== FASE 3: DESCARGA =====
      setState((prev) => ({
        ...prev,
        progress: 100,
        phase: "ready",
        operation: "¡Listo! Descargando",
      }));

      // Trigger descarga nativa
      const downloadUrl = getApiUrl(`/api/worker/download/${result.fileId}`);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = fullFileName;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Marcar como completo
      await new Promise((r) => setTimeout(r, 300));
      setState((prev) => ({ ...prev, isComplete: true }));

      toast.success(options.successMessage || "¡Archivo procesado correctamente!");
      options.onSuccess?.();

      return true;
    } catch (error) {
      console.error(error);
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

  const handleDownloadAgain = () => {
    if (!downloadInfo) return;

    const downloadUrl = getApiUrl(`/api/worker/download/${downloadInfo.fileId}`);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = downloadInfo.fileName;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

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
  };
}