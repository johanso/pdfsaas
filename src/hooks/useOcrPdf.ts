import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { toast } from "sonner";
import { gzipSync } from "fflate";
import { getApiUrl } from "@/lib/api";
import { Loader2, Check, Info } from "lucide-react";
import { usePdfFiles } from "./usePdfFiles";
import { useProcessingPipeline, ProcessingResult } from "./useProcessingPipeline";
import { useProcessingTimer } from "./core/useProcessingTimer";

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

// Re-export shared types
export type { UploadStats } from "./useProcessingPipeline";
import { formatTime } from "@/lib/format";

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

// Helpers imported from lib

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
  const {
    files,
    addFiles,
    removeFile: removeContextFile,
    reset: resetContextFiles
  } = usePdfFiles();

  const file = files[0]?.file || null;

  // Local state for OCR configuration
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [ocrStatus, setOcrStatus] = useState<OcrStatus>("idle");
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>(DEFAULT_LANGUAGES);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["spa"]);
  const [dpi, setDpi] = useState<DpiOption>(300);
  const [optimize, setOptimize] = useState(true);

  // UI state for messages
  const [operationMsg, setOperationMsg] = useState("");
  const [tip, setTip] = useState("");

  // Refs
  const isMounted = useRef(true);
  const fileIdRef = useRef(0);
  const messageIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const tipIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Pipeline
  const pipeline = useProcessingPipeline();
  const { state: pipelineState, uploadHook, downloadHook, cancel: cancelPipeline } = pipeline;

  // Local timer for Server Simulation
  // OCR takes long, so we simulate progress while Waiting for Response (XHR Pending)
  const serverTimer = useProcessingTimer();

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      stopMessageRotation();
    };
  }, []);

  // Message Rotation Logic
  const startMessageRotation = useCallback(() => {
    if (messageIntervalRef.current || tipIntervalRef.current) return;
    let msgIndex = 0;
    let tipIndex = 0;

    setOperationMsg(OPERATION_MESSAGES.processing[0]);
    setTip(PROCESSING_TIPS[0]);

    messageIntervalRef.current = setInterval(() => {
      msgIndex = (msgIndex + 1) % OPERATION_MESSAGES.processing.length;
      setOperationMsg(OPERATION_MESSAGES.processing[msgIndex]);
    }, 4000);

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

  // Load Languages
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const response = await fetch(getApiUrl("/api/worker/ocr-pdf/languages"));
        if (response.ok) {
          const data = await response.json();
          if (data.languages?.length > 0) setAvailableLanguages(data.languages);
        }
      } catch (error) {
        console.warn("Could not load languages, using defaults");
      }
    };
    loadLanguages();
  }, []);

  // PDF Loading & Detection (Keep existing logic)
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
        newPages.push({ id: `page-${i}-${Date.now()}`, pageNumber: i, rotation: 0 });
      }
      setPages(newPages);
      await pdf.destroy();
    } catch (error: any) {
      console.error("Error loading PDF:", error);
      if (!isMounted.current || fileIdRef.current !== currentFileId) return;
      if (error.name === "PasswordException") {
        toast.error("Este PDF está protegido.");
      } else {
        toast.error("Error al leer el PDF");
      }
      setPages([]);
      if (isMounted.current && fileIdRef.current === currentFileId) setOcrStatus("error");
    }
  }, []);

  const detectOcrStatus = useCallback(async (pdfFile: File, currentFileId: number) => {
    setOcrStatus("detecting");
    try {
      const formData = new FormData();
      formData.append("file", pdfFile);
      const response = await fetch(getApiUrl("/api/worker/ocr-pdf/detect"), { method: "POST", body: formData });
      if (!isMounted.current || fileIdRef.current !== currentFileId) return;
      if (response.ok) {
        const data = await response.json();
        setOcrStatus(data.needsOcr ? "scanned" : "has-text");
      } else {
        setOcrStatus("error");
      }
    } catch (error) {
      console.error("Error detecting OCR:", error);
      if (isMounted.current && fileIdRef.current === currentFileId) setOcrStatus("error");
    }
  }, []);

  useEffect(() => {
    if (!file) {
      setPages([]);
      setOcrStatus("idle");
      setOperationMsg("");
      setTip("");
      cancelPipeline();
      serverTimer.stop();
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

  // Apply OCR
  const applyOcr = useCallback(async (outputFileName?: string) => {
    if (!file || pages.length === 0) {
      toast.error("No hay archivo para procesar");
      return;
    }

    const fullFileName = outputFileName || file.name.replace(/\.pdf$/i, "-ocr.pdf");

    // Calculate expected duration for Simulation
    // ocrmypdf ~12s/page at 300dpi. 20s/page at 600dpi.
    const estimatedSeconds = pages.length * (dpi === 600 ? 20 : dpi === 300 ? 12 : 8);
    const estimatedDuration = estimatedSeconds * 1000;

    setTip("Comprimiendo para subida rápida...");

    await pipeline.start({
      files: [file],
      endpoint: "/api/worker/ocr-pdf",
      operationName: "Procesando OCR",
      createFormData: async (f) => {
        const currentFile = f[0];
        const { blob: compressedBlob } = await compressFile(currentFile);

        const formData = new FormData();
        formData.append("file", compressedBlob, currentFile.name + ".gz");
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

        return formData;
      }
    });

  }, [file, pages, selectedLanguages, dpi, optimize, pipeline]);

  // Effect to manage "Server Simulation" when upload hits 100%
  useEffect(() => {
    // If uploading and progress is 100%, we are waiting for server response
    // OR if pipeline explicitly enters a "processing" phase (if we added that logic).
    // My Pipeline implementation keeps phase at "uploading" until XHR resolves.
    // So check uploadHook.progress.

    const isWaitingForServer = pipelineState.phase === "uploading" && uploadHook.progress >= 100;

    if (isWaitingForServer) {
      // Check if timer is already running?
      // serverTimer.start restarts.
      // We need to run this only ONCE when entering this state.
      // Since we can't easily check "isRunning", we rely on useEffect deps.
      // We can use a ref to track if we started simulation?
      // Or just checking if progress > 0? No.

      // Actually, just calling startMessageRotation here is safe (idempotent).
      startMessageRotation();

      // Start timer if not full
      if (serverTimer.progress === 0) {
        // 12s/page est
        const estimatedSeconds = pages.length * (dpi === 600 ? 20 : dpi === 300 ? 12 : 8);
        serverTimer.start({
          duration: estimatedSeconds * 1000,
          startProgress: 10,
          endProgress: 95
        });
      }
    } else if (pipelineState.phase === "complete" || pipelineState.phase === "idle" || pipelineState.phase === "error") {
      stopMessageRotation();
      serverTimer.stop();
    }

  }, [pipelineState.phase, uploadHook.progress, pages.length, dpi, startMessageRotation, stopMessageRotation, serverTimer]);

  const cancelOperation = useCallback(() => {
    cancelPipeline();
    stopMessageRotation();
    serverTimer.stop();
    toast.info("Operación cancelada");
  }, [cancelPipeline, stopMessageRotation, serverTimer]);

  const reset = useCallback(() => {
    cancelOperation();
    resetContextFiles();
    setSelectedLanguages(["spa"]);
    setDpi(300);
    setOptimize(true);
  }, [cancelOperation, resetContextFiles]);

  // Derived State
  const currentState = useMemo(() => {
    const pState = pipelineState;

    // Map Phase
    let phase: ProcessingPhase = "idle";
    let progress = 0;
    let operation = "";

    if (pState.phase === "preparing") {
      phase = "compressing";
      progress = 5;
      operation = "Preparando archivo...";
    } else if (pState.phase === "uploading") {
      if (uploadHook.progress >= 100) {
        phase = "processing";
        progress = serverTimer.progress || 10; // Fallback
        operation = operationMsg || "Procesando en servidor...";
      } else {
        phase = "uploading";
        progress = 5 + (uploadHook.progress * 0.05); // 5% to 10%
        operation = "Subiendo archivo...";
      }
    } else if (pState.phase === "processing" || pState.phase === "downloading") {
      // Pipeline switches to downloading when XHR returns
      phase = "processing"; // Keep showing processing/downloading as one
      progress = 95 + (pState.progress * 0.05); // 95 to 100
      operation = "Descargando resultado...";
    } else if (pState.phase === "complete") {
      phase = "ready";
      progress = 100;
      operation = "¡Completado!";
    }

    return { phase, progress, operation };
  }, [pipelineState, uploadHook.progress, serverTimer.progress, operationMsg]);

  return {
    // State
    file,
    pages,
    ocrStatus,
    isProcessing: pipelineState.isProcessing,
    isComplete: currentState.phase === "ready",
    progress: currentState.progress,
    phase: currentState.phase,
    operation: currentState.operation,
    tip,
    uploadStats: pipelineState.uploadStats,
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
    removePage: (id: string) => setPages(p => p.filter(x => x.id !== id)),
    rotatePage: (id: string) => setPages(p => p.map(x => x.id === id ? { ...x, rotation: (x.rotation + 90) % 360 } : x)),
    reorderPages: setPages,

    // Actions
    applyOcr,
    downloadAgain: () => {
      if (pipelineState.result?.fileId) {
        downloadHook.downloadFromUrl(`/api/worker/download/${pipelineState.result.fileId}`, pipelineState.result.fileName || "ocr.pdf");
      }
    },
    reset,
    startNew: () => {
      cancelOperation();
      setOcrStatus("detecting"); // Or whatever initial state
      // Actually startNew usually keeps files but resets processed state?
      // Original logic: just stop rotation and reset processing state.
    },
    cancelOperation,

    // Assets
    funFacts: OCR_FUN_FACTS,
    customTips: OCR_TIPS,
  };
}