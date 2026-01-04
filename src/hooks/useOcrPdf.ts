import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { gzipSync } from "fflate";
import { getApiUrl } from "@/lib/api";
import { Loader2, Check, Info } from "lucide-react";
import { usePdfFiles } from "./usePdfFiles";

// ============================================================================
// TYPES
// ============================================================================

export type DpiOption = 150 | 300 | 600;
export type OcrStatus = "idle" | "detecting" | "scanned" | "has-text" | "error";
export type ProcessingPhase = "idle" | "compressing" | "uploading" | "processing" | "ready";

export interface Language {
  code: string;
  name: string;
}

export interface PageInfo {
  id: string;
  pageNumber: number;
  rotation: number;
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
// CONSTANTS
// ============================================================================

export const DPI_OPTIONS: { value: DpiOption; label: string; description: string }[] = [
  { value: 150, label: "150 DPI", description: "Rápido" },
  { value: 300, label: "300 DPI", description: "Estándar" },
  { value: 600, label: "600 DPI", description: "Alta calidad" },
];

const DEFAULT_LANGUAGES: Language[] = [
  { code: "spa", name: "Español" },
  { code: "eng", name: "English" },
  { code: "fra", name: "Français" },
  { code: "deu", name: "Deutsch" },
  { code: "por", name: "Português" },
  { code: "ita", name: "Italiano" },
];

// Mensajes de operación por fase
const OPERATION_MESSAGES = {
  idle: "",
  compressing: "Preparando archivo...",
  uploading: "Subiendo archivo...",
  processing: [
    "Reconociendo texto...",
    "Analizando documento...",
    "Procesando páginas...",
    "Aplicando OCR...",
    "Extrayendo contenido...",
  ],
  ready: "¡Completado!",
};

const PROCESSING_TIPS = [
  "No cierres el navegador mientras se procesa el archivo.",
  "El tiempo depende del número de páginas y la calidad seleccionada.",
  "Los documentos escaneados pueden tardar más en procesarse.",
  "Estamos convirtiendo tu PDF en texto seleccionable.",
  "Casi listo... finalizando el procesamiento.",
];

const OCR_FUN_FACTS = [
  "El OCR (Reconocimiento Óptico de Caracteres) fue inventado en 1914 por Emanuel Goldberg.",
  "Ray Kurzweil desarrolló el primer sistema OCR capaz de leer cualquier tipo de letra en 1974.",
  "El OCR es fundamental para digitalizar bibliotecas enteras en Google Books.",
  "La tecnología OCR moderna usa redes neuronales profundas para mejorar la precisión.",
  "Tesseract es uno de los motores OCR de código abierto más populares en la actualidad.",
];

const OCR_TIPS = [
  { icon: Loader2, text: "Un PDF más nítido resulta en un OCR más preciso." },
  { icon: Check, text: "Seleccionar el idioma correcto mejora drásticamente los resultados." },
  { icon: Info, text: "300 DPI es la resolución recomendada para la mayoría de documentos." },
];

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

async function compressFile(file: File): Promise<{ blob: Blob; originalSize: number; compressedSize: number }> {
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

export function useOcrPdf() {
  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------

  // -------------------------------------------------------------------------
  // Global State (FileContext)
  // -------------------------------------------------------------------------
  const {
    files,
    addFiles,
    removeFile: removeContextFile,
    reset: resetContextFiles
  } = usePdfFiles();

  const file = files[0]?.file || null;

  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------

  const [pages, setPages] = useState<PageInfo[]>([]);
  const [ocrStatus, setOcrStatus] = useState<OcrStatus>("idle");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<ProcessingPhase>("idle");
  const [operation, setOperation] = useState("");
  const [tip, setTip] = useState("");
  const [uploadStats, setUploadStats] = useState<UploadStats | null>(null);
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>(DEFAULT_LANGUAGES);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["spa"]);
  const [dpi, setDpi] = useState<DpiOption>(300);
  const [optimize, setOptimize] = useState(true);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultFileName, setResultFileName] = useState("");

  // Ref para controlar el montaje y cancelación
  const isMounted = useRef(true);
  const fileIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Refs para calcular velocidad
  const speedSamples = useRef<number[]>([]);
  const lastProgressTime = useRef<number>(0);
  const lastProgressBytes = useRef<number>(0);

  // Refs para rotación de mensajes
  const messageIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const tipIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      // Limpiar intervalos
      if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
      if (tipIntervalRef.current) clearInterval(tipIntervalRef.current);
    };
  }, []);

  // -------------------------------------------------------------------------
  // Message rotation during processing
  // -------------------------------------------------------------------------

  const startMessageRotation = useCallback(() => {
    if (messageIntervalRef.current || tipIntervalRef.current) return;

    let msgIndex = 0;
    let tipIndex = 0;

    // Mensaje inicial
    setOperation(OPERATION_MESSAGES.processing[0]);
    setTip(PROCESSING_TIPS[0]);

    // Rotar mensajes cada 4 segundos
    messageIntervalRef.current = setInterval(() => {
      msgIndex = (msgIndex + 1) % OPERATION_MESSAGES.processing.length;
      setOperation(OPERATION_MESSAGES.processing[msgIndex]);
    }, 4000);

    // Rotar tips cada 6 segundos
    tipIntervalRef.current = setInterval(() => {
      tipIndex = (tipIndex + 1) % PROCESSING_TIPS.length;
      setTip(PROCESSING_TIPS[tipIndex]);
    }, 6000);
  }, []);

  const stopMessageRotation = useCallback(() => {
    if (messageIntervalRef.current) {
      clearInterval(messageIntervalRef.current);
      messageIntervalRef.current = null;
    }
    if (tipIntervalRef.current) {
      clearInterval(tipIntervalRef.current);
      tipIntervalRef.current = null;
    }
  }, []);

  // -------------------------------------------------------------------------
  // Calculate speed
  // -------------------------------------------------------------------------

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
    return speedSamples.current.reduce((a: number, b: number) => a + b, 0) / speedSamples.current.length;
  }, []);

  // -------------------------------------------------------------------------
  // Load languages on mount
  // -------------------------------------------------------------------------

  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const response = await fetch(getApiUrl("/api/worker/ocr-pdf/languages"));
        if (response.ok) {
          const data = await response.json();
          if (data.languages?.length > 0) {
            setAvailableLanguages(data.languages);
          }
        }
      } catch (error) {
        console.warn("Could not load languages, using defaults");
      }
    };

    loadLanguages();
  }, []);

  // -------------------------------------------------------------------------
  // Load PDF pages using pdfjs
  // -------------------------------------------------------------------------

  const loadPdfPages = useCallback(async (pdfFile: File, currentFileId: number) => {
    try {
      const { pdfjs } = await import("react-pdf");
      pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

      if (!isMounted.current || fileIdRef.current !== currentFileId) {
        await pdf.destroy();
        return;
      }

      const newPages: PageInfo[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        newPages.push({
          id: `page-${i}-${Date.now()}`,
          pageNumber: i,
          rotation: 0,
        });
      }

      setPages(newPages);
      await pdf.destroy();

    } catch (error: any) {
      console.error("Error loading PDF:", error);

      if (!isMounted.current || fileIdRef.current !== currentFileId) return;

      if (error.name === "PasswordException") {
        toast.error("Este PDF está protegido. Usa 'Desbloquear PDF' primero.");
      } else {
        toast.error("Error al leer el PDF");
      }

      setPages([]);
      if (isMounted.current && fileIdRef.current === currentFileId) {
        setOcrStatus("error");
      }
    }
  }, []);

  // -------------------------------------------------------------------------
  // Detect OCR status
  // -------------------------------------------------------------------------

  const detectOcrStatus = useCallback(async (pdfFile: File, currentFileId: number) => {
    setOcrStatus("detecting");

    try {
      const formData = new FormData();
      formData.append("file", pdfFile);

      const response = await fetch(getApiUrl("/api/worker/ocr-pdf/detect"), {
        method: "POST",
        body: formData,
      });

      if (!isMounted.current || fileIdRef.current !== currentFileId) return;

      if (response.ok) {
        const data = await response.json();
        setOcrStatus(data.needsOcr ? "scanned" : "has-text");
      } else {
        setOcrStatus("error");
      }
    } catch (error) {
      console.error("Error detecting OCR:", error);
      if (isMounted.current && fileIdRef.current === currentFileId) {
        setOcrStatus("error");
      }
    }
  }, []);

  // -------------------------------------------------------------------------
  // Set file - main entry point
  // -------------------------------------------------------------------------

  // -------------------------------------------------------------------------
  // Watch for file changes in context
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!file) {
      setPages([]);
      setOcrStatus("idle");
      setIsProcessing(false);
      setIsComplete(false);
      setProgress(0);
      setPhase("idle");
      setOperation("");
      setTip("");
      setUploadStats(null);
      setResultBlob(null);
      setResultFileName("");
      return;
    }

    fileIdRef.current += 1;
    const currentFileId = fileIdRef.current;

    loadPdfPages(file, currentFileId);
    detectOcrStatus(file, currentFileId);
  }, [file, loadPdfPages, detectOcrStatus]);

  const setFile = useCallback((newFile: File | null) => {
    if (!newFile) {
      resetContextFiles();
      return;
    }

    if (newFile.type !== "application/pdf") {
      toast.error("Por favor selecciona un archivo PDF válido");
      return;
    }

    addFiles([newFile]);
  }, [addFiles, resetContextFiles]);

  // -------------------------------------------------------------------------
  // Page operations
  // -------------------------------------------------------------------------

  const removePage = useCallback((pageId: string) => {
    setPages(prev => {
      const newPages = prev.filter(p => p.id !== pageId);
      if (newPages.length === 0) {
        resetContextFiles();
      }
      return newPages;
    });
  }, [resetContextFiles]);

  const rotatePage = useCallback((pageId: string, degrees: number = 90) => {
    setPages(prev => prev.map(p =>
      p.id === pageId ? { ...p, rotation: (p.rotation + degrees) % 360 } : p
    ));
  }, []);

  const reorderPages = useCallback((newPages: PageInfo[]) => {
    setPages(newPages);
  }, []);

  // -------------------------------------------------------------------------
  // Apply OCR with real progress tracking
  // -------------------------------------------------------------------------

  const applyOcr = useCallback(async (outputFileName?: string) => {
    if (!file || pages.length === 0) {
      toast.error("No hay archivo para procesar");
      return false;
    }

    // Cancelar cualquier operación anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Reset speed tracking
    speedSamples.current = [];
    lastProgressTime.current = 0;
    lastProgressBytes.current = 0;

    const fullFileName = outputFileName || file.name.replace(/\.pdf$/i, "-ocr.pdf");

    setIsProcessing(true);
    setIsComplete(false);
    setProgress(0);
    setPhase("compressing");
    setOperation("Preparando archivo");
    setTip("Comprimiendo para una subida más rápida");
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
      // =====================================================================
      // FASE 1: Comprimir archivo (0% - 5%)
      // =====================================================================
      for (let i = 0; i <= 5; i++) {
        setProgress(i);
        await new Promise(r => setTimeout(r, 20));
      }

      const { blob: compressedBlob, originalSize, compressedSize } = await compressFile(file);
      const compressionRatio = ((1 - compressedSize / originalSize) * 100);

      // =====================================================================
      // FASE 2: Subir archivo (5% - 10%) - MUY BREVE
      // =====================================================================
      setProgress(5);
      setPhase("uploading");
      setOperation("Subiendo archivo");
      setTip("Enviando archivo al servidor para procesar...");
      setUploadStats(prev => prev ? {
        ...prev,
        compressedSize,
        compressionRatio,
        totalBytes: compressedSize,
        phase: "uploading" as const,
      } : null);

      const formData = new FormData();
      formData.append("file", compressedBlob, file.name + ".gz");
      formData.append("compressed", "true");
      formData.append("languages", selectedLanguages.join(","));
      formData.append("dpi", dpi.toString());
      formData.append("optimize", optimize.toString());

      const pageInstructions = pages.map((p, idx) => ({
        originalIndex: p.pageNumber - 1,
        rotation: p.rotation,
        newIndex: idx
      }));
      formData.append("pageInstructions", JSON.stringify(pageInstructions));

      const uploadResult = await new Promise<{ success: boolean; fileId?: string; fileName?: string; error?: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable && isMounted.current) {
            // Upload va de 5% a 10%
            const uploadProgress = 5 + (e.loaded / e.total) * 5;
            setProgress(uploadProgress);

            if (e.loaded === e.total && e.total > 0) {
              setPhase("processing");
              setUploadStats(null);
              startMessageRotation();
            }

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
              resolve(JSON.parse(xhr.responseText));
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
        xhr.addEventListener("abort", () => reject(new Error("Cancelado por el usuario")));

        xhr.open("POST", getApiUrl("/api/worker/ocr-pdf"));
        xhr.send(formData);

        abortControllerRef.current!.signal.addEventListener("abort", () => xhr.abort());
      });

      if (!uploadResult.success || !uploadResult.fileId) {
        throw new Error(uploadResult.error || "Error al procesar OCR");
      }

      // =====================================================================
      // FASE 3: Procesamiento OCR en servidor (10% - 95%)
      // =====================================================================
      // Ya estamos en phase="processing" desde el listener del upload
      setProgress(10);

      // Asegurarse de que los mensajes estén rotando
      startMessageRotation();

      // Simular progreso basado en tiempo estimado
      // ocrmypdf es ~12 seg/página en 300 DPI
      const estimatedSeconds = pages.length * (dpi === 600 ? 20 : dpi === 300 ? 12 : 8);
      const progressPerMs = 85 / (estimatedSeconds * 1000); // 85% para esta fase (10% a 95%)
      const processingStartTime = Date.now();

      const progressInterval = setInterval(() => {
        if (!isMounted.current) {
          clearInterval(progressInterval);
          return;
        }
        const elapsed = Date.now() - processingStartTime;
        const estimatedProgress = 10 + (elapsed * progressPerMs);
        setProgress(Math.min(93, estimatedProgress));
      }, 300);

      // =====================================================================
      // FASE 4: Descargar resultado (95% - 100%)
      // =====================================================================
      const downloadUrl = getApiUrl(`/api/worker/download/${uploadResult.fileId}`);
      const downloadResponse = await fetch(downloadUrl);

      clearInterval(progressInterval);
      stopMessageRotation();

      if (!downloadResponse.ok) {
        throw new Error("Error al descargar el archivo procesado");
      }

      setProgress(95);
      setOperation("Descargando resultado");

      const blob = await downloadResponse.blob();

      setProgress(98);
      setResultBlob(blob);
      setResultFileName(fullFileName);

      // Descargar automáticamente
      downloadBlob(blob, fullFileName);

      setProgress(100);
      setPhase("ready");
      setOperation("¡Completado!");

      const totalTime = (Date.now() - startTime) / 1000;
      setTip(`Procesado en ${formatTime(totalTime)}`);

      await new Promise(r => setTimeout(r, 300));
      setIsComplete(true);

      toast.success(`¡OCR aplicado en ${formatTime(totalTime)}!`);
      return true;

    } catch (error) {
      console.error("OCR error:", error);
      stopMessageRotation();

      const message = error instanceof Error ? error.message : "Error durante el OCR";

      if (message !== "Cancelado por el usuario") {
        toast.error(message);
      }

      setIsProcessing(false);
      setProgress(0);
      setPhase("idle");
      setOperation("");
      setTip("");
      setUploadStats(null);
      return false;
    }
  }, [file, pages, selectedLanguages, dpi, optimize, calculateSpeed, startMessageRotation, stopMessageRotation]);

  // -------------------------------------------------------------------------
  // Cancel operation
  // -------------------------------------------------------------------------

  const cancelOperation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    stopMessageRotation();
    setIsProcessing(false);
    setProgress(0);
    setPhase("idle");
    setOperation("");
    setTip("");
    setUploadStats(null);
    toast.info("Operación cancelada");
  }, [stopMessageRotation]);

  // -------------------------------------------------------------------------
  // Download helpers
  // -------------------------------------------------------------------------

  const downloadAgain = useCallback(() => {
    if (resultBlob && resultFileName) {
      downloadBlob(resultBlob, resultFileName);
      toast.success("Archivo descargado");
    }
  }, [resultBlob, resultFileName]);

  // -------------------------------------------------------------------------
  // Reset
  // -------------------------------------------------------------------------

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    stopMessageRotation();
    resetContextFiles();
    setSelectedLanguages(["spa"]);
    setDpi(300);
    setOptimize(true);
  }, [stopMessageRotation, resetContextFiles]);

  const startNew = useCallback(() => {
    stopMessageRotation();
    setIsProcessing(false);
    setIsComplete(false);
    setProgress(0);
    setPhase("idle");
    setOperation("");
    setTip("");
    setUploadStats(null);
    setResultBlob(null);
    setResultFileName("");
  }, [stopMessageRotation]);

  // -------------------------------------------------------------------------
  // Return
  // -------------------------------------------------------------------------

  return {
    // State
    file,
    pages,
    ocrStatus,
    isProcessing,
    isComplete,
    progress,
    phase,
    operation,
    tip,
    uploadStats,
    availableLanguages,
    selectedLanguages,
    dpi,
    optimize,

    // Setters
    setFile,
    setSelectedLanguages,
    setDpi,
    setOptimize,

    // Page operations
    removePage,
    rotatePage,
    reorderPages,

    // Actions
    applyOcr,
    downloadAgain,
    reset,
    startNew,
    cancelOperation,

    // Assets
    funFacts: OCR_FUN_FACTS,
    customTips: OCR_TIPS,
  };
}

// ============================================================================
// UTILITY
// ============================================================================

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}