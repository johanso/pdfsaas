import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/api";
import { gzipSync } from "fflate";

// ============================================================================
// TYPES
// ============================================================================

export type CompressionPreset = "extreme" | "recommended" | "low";
export type CompressionMode = "simple" | "advanced";
export type ProcessingPhase = "idle" | "compressing" | "uploading" | "processing" | "ready";

export interface CompressionResult {
  success: boolean;
  fileId: string;
  fileName: string;
  originalSize: number;
  compressedSize: number;
  reduction: number;
  saved: number;
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

// ============================================================================
// HELPERS
// ============================================================================

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

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

async function compressFileGzip(file: File): Promise<{ blob: Blob; originalSize: number; compressedSize: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const compressed = gzipSync(uint8Array, { level: 6 });
  
  return {
    blob: new Blob([new Uint8Array(compressed)], { type: "application/gzip" }),
    originalSize: file.size,
    compressedSize: compressed.length,
  };
}

// ============================================================================
// HOOK
// ============================================================================

export function useCompressPdf() {
  // Estado de procesamiento
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<ProcessingPhase>("idle");
  const [operation, setOperation] = useState("");
  const [uploadStats, setUploadStats] = useState<UploadStats | null>(null);
  
  // Resultado
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultFileName, setResultFileName] = useState("");
  
  // Refs
  const isMounted = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const speedSamples = useRef<number[]>([]);
  const lastProgressTime = useRef<number>(0);
  const lastProgressBytes = useRef<number>(0);

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
      if (speedSamples.current.length > 10) speedSamples.current.shift();
      lastProgressTime.current = timestamp;
      lastProgressBytes.current = loaded;
    }

    if (speedSamples.current.length === 0) return 0;
    return speedSamples.current.reduce((a, b) => a + b, 0) / speedSamples.current.length;
  }, []);

  const compress = useCallback(async (
    file: File,
    options: {
      mode: CompressionMode;
      preset?: CompressionPreset;
      dpi?: number;
      imageQuality?: number;
      fileName: string;
      onSuccess?: () => void;
    }
  ) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    speedSamples.current = [];
    lastProgressTime.current = 0;
    lastProgressBytes.current = 0;
    
    const fullFileName = options.fileName.endsWith('.pdf') 
      ? options.fileName 
      : `${options.fileName}.pdf`;
    
    setIsProcessing(true);
    setIsComplete(false);
    setProgress(0);
    setPhase("compressing");
    setOperation("Preparando archivo...");
    setResult(null);
    setUploadStats({
      currentFile: 1,
      totalFiles: 1,
      currentFileName: file.name,
      currentFileSize: file.size,
      compressedSize: 0,
      bytesUploaded: 0,
      totalBytes: file.size,
      speed: 0,
      timeRemaining: 0,
      compressionRatio: 0,
      phase: "compressing",
    });
    
    const startTime = Date.now();
    
    try {
      // FASE 1: Comprimir con gzip (0% - 10%)
      for (let i = 0; i <= 10; i += 2) {
        setProgress(i);
        await new Promise(r => setTimeout(r, 20));
      }
      
      const { blob: compressedBlob, originalSize, compressedSize } = await compressFileGzip(file);
      const gzipRatio = ((1 - compressedSize / originalSize) * 100);
      
      setProgress(10);
      setPhase("uploading");
      setOperation("Subiendo archivo...");
      setUploadStats(prev => prev ? {
        ...prev,
        compressedSize,
        compressionRatio: gzipRatio,
        totalBytes: compressedSize,
        phase: "uploading" as const,
      } : null);
      
      // FASE 2: Subir (10% - 30%)
      const formData = new FormData();
      formData.append("file", compressedBlob, file.name + ".gz");
      formData.append("compressed", "true");
      formData.append("mode", options.mode);
      
      if (options.mode === "simple" && options.preset) {
        formData.append("preset", options.preset);
      } else {
        formData.append("dpi", String(options.dpi || 120));
        formData.append("imageQuality", String(options.imageQuality || 60));
      }
      
      const uploadResult = await new Promise<CompressionResult>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable && isMounted.current) {
            const uploadProgress = 10 + (e.loaded / e.total) * 20;
            setProgress(uploadProgress);
            
            const speed = calculateSpeed(e.loaded, Date.now());
            const remainingBytes = e.total - e.loaded;
            const timeRemaining = speed > 0 ? remainingBytes / speed : 0;
            
            setUploadStats(prev => prev ? {
              ...prev,
              bytesUploaded: e.loaded,
              totalBytes: e.total,
              speed,
              timeRemaining,
              phase: "uploading" as const,
            } : null);
          }
        });
        
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              if (data.success) {
                resolve(data as CompressionResult);
              } else {
                reject(new Error(data.error || "Error al comprimir"));
              }
            } catch {
              reject(new Error("Error al parsear respuesta"));
            }
          } else {
            try {
              const error = JSON.parse(xhr.responseText);
              reject(new Error(error.error || `Error ${xhr.status}`));
            } catch {
              reject(new Error(`Error ${xhr.status}`));
            }
          }
        });
        
        xhr.addEventListener("error", () => reject(new Error("Error de red")));
        xhr.addEventListener("abort", () => reject(new Error("Cancelado")));
        
        xhr.open("POST", getApiUrl("/api/worker/compress-pdf"));
        xhr.send(formData);
        
        abortControllerRef.current!.signal.addEventListener("abort", () => xhr.abort());
      });
      
      // FASE 3: Procesamiento servidor (30% - 85%)
      setPhase("processing");
      setProgress(35);
      setOperation("Comprimiendo PDF...");
      setUploadStats(null);
      
      const processingInterval = setInterval(() => {
        setProgress(prev => Math.min(80, prev + 1));
      }, 300);
      
      // FASE 4: Descargar resultado (85% - 100%)
      const downloadUrl = getApiUrl(`/api/worker/download/${uploadResult.fileId}`);
      const downloadResponse = await fetch(downloadUrl);
      
      clearInterval(processingInterval);
      
      if (!downloadResponse.ok) {
        throw new Error("Error al descargar");
      }
      
      setProgress(90);
      setOperation("Descargando...");
      
      const blob = await downloadResponse.blob();
      
      setResult(uploadResult);
      setResultBlob(blob);
      setResultFileName(fullFileName);
      
      // Descargar automáticamente
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fullFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setProgress(100);
      setPhase("ready");
      setOperation("¡Completado!");
      
      await new Promise(r => setTimeout(r, 300));
      setIsComplete(true);
      
      const totalTime = (Date.now() - startTime) / 1000;
      toast.success(`¡Comprimido! -${uploadResult.reduction.toFixed(0)}% en ${formatTime(totalTime)}`);
      
      options.onSuccess?.();
      return true;
      
    } catch (error) {
      console.error("Compress error:", error);
      const message = error instanceof Error ? error.message : "Error";
      
      if (message !== "Cancelado") {
        toast.error(message);
      }
      
      setIsProcessing(false);
      setProgress(0);
      setPhase("idle");
      setOperation("");
      setUploadStats(null);
      return false;
    }
  }, [calculateSpeed]);

  const handleDownloadAgain = useCallback(() => {
    if (resultBlob && resultFileName) {
      const url = URL.createObjectURL(resultBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = resultFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Descargado");
    }
  }, [resultBlob, resultFileName]);

  const handleStartNew = useCallback(() => {
    setIsProcessing(false);
    setIsComplete(false);
    setProgress(0);
    setPhase("idle");
    setOperation("");
    setUploadStats(null);
    setResult(null);
    setResultBlob(null);
    setResultFileName("");
  }, []);

  const cancelOperation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsProcessing(false);
    setProgress(0);
    setPhase("idle");
    setOperation("");
    setUploadStats(null);
    toast.info("Cancelado");
  }, []);

  return {
    isProcessing,
    isComplete,
    progress,
    phase,
    operation,
    uploadStats,
    result,
    compress,
    handleDownloadAgain,
    handleStartNew,
    cancelOperation,
  };
}