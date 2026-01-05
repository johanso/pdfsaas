import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { notify } from "@/lib/errors/notifications";
import { createError } from "@/lib/errors/error-types";
import { getApiUrl } from "@/lib/api";
import { Loader2, Check, Info } from "lucide-react";
import { usePdfFiles } from "./usePdfFiles";
import { useToolProcessor, ProcessingResult, UploadStats } from "./core/useToolProcessor";

let isWorkerConfigured = false;

// Función auxiliar para configurar pdfjs
async function setupPdfjs() {
  if (typeof window === "undefined") return;
  
  if (!isWorkerConfigured) {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
    isWorkerConfigured = true;
  }
}

// ============================================================================
// TYPES
// ============================================================================

export type DpiOption = 150 | 300 | 600;
export type OcrStatus = "idle" | "detecting" | "scanned" | "has-text" | "error";
export type ProcessingPhase = "idle" | "compressing" | "uploading" | "processing" | "ready" | "error";

export interface Language {
  code: string;
  name: string;
}

export interface PageInfo {
  id: string;
  pageNumber: number;
  rotation: number;
}

export type { UploadStats };

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
  processing: [
    "Reconociendo texto...",
    "Analizando documento...",
    "Procesando páginas...",
    "Aplicando OCR...",
    "Extrayendo contenido...",
  ],
};

const PROCESSING_TIPS = [
  "No cierres el navegador mientras se procesa el archivo.",
  "El tiempo depende del número de páginas y la calidad seleccionada.",
  "Los documentos escaneados pueden tardar más en procesarse.",
  "Estamos convirtiendo tu PDF en texto seleccionable.",
  "Casi listo... finalizando el procesamiento.",
];

export const OCR_FUN_FACTS = [
  "El OCR (Reconocimiento Óptico de Caracteres) fue inventado en 1914 por Emanuel Goldberg.",
  "Ray Kurzweil desarrolló el primer sistema OCR capaz de leer cualquier tipo de letra en 1974.",
  "El OCR es fundamental para digitalizar bibliotecas enteras en Google Books.",
  "La tecnología OCR moderna usa redes neuronales profundas para mejorar la precisión.",
  "Tesseract es uno de los motores OCR de código abierto más populares en la actualidad.",
];

export const OCR_TIPS = [
  { icon: Loader2, text: "Un PDF más nítido resulta en un OCR más preciso." },
  { icon: Check, text: "Seleccionar el idioma correcto mejora drásticamente los resultados." },
  { icon: Info, text: "300 DPI es la resolución recomendada para la mayoría de documentos." },
];

// ============================================================================
// HOOK
// ============================================================================

export function useOcrPdf() {
  const { files, addFiles, reset: resetContextFiles } = usePdfFiles();
  const file = files[0]?.file || null;

  // Estado local para configuración OCR
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [ocrStatus, setOcrStatus] = useState<OcrStatus>("idle");
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>(DEFAULT_LANGUAGES);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["spa"]);
  const [dpi, setDpi] = useState<DpiOption>(300);
  const [optimize, setOptimize] = useState(true);

  // Estado UI para mensajes rotativos
  const [operationMsg, setOperationMsg] = useState("");
  const [tip, setTip] = useState("");

  // Refs
  const isMounted = useRef(true);
  const fileIdRef = useRef(0);
  const messageIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const tipIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calcular duración estimada de simulación
  const estimatedDuration = useMemo(() => {
    const seconds = pages.length * (dpi === 600 ? 20 : dpi === 300 ? 12 : 8);
    return Math.max(2000, seconds * 1000);
  }, [pages.length, dpi]);

  // -- Message Rotation --
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

  // -- Core Processor --
  const processor = useToolProcessor<
    { languages: string[]; dpi: DpiOption; optimize: boolean; pages: PageInfo[] },
    ProcessingResult
  >({
    toolId: "ocr-pdf",
    endpoint: "/api/worker/ocr-pdf",
    operationName: "Procesando OCR",
    useGzipCompression: true,
    responseType: "json",
    processingSimulationDuration: estimatedDuration,

    prepareFormData: async (f, options) => {
      const formData = new FormData();
      formData.append("file", f[0]);
      formData.append("languages", options.languages.join(","));
      formData.append("dpi", options.dpi.toString());
      formData.append("optimize", options.optimize.toString());

      const pageInstructions = options.pages.map((p, idx) => ({
        originalIndex: p.pageNumber - 1,
        rotation: p.rotation,
        newIndex: idx,
      }));
      formData.append("pageInstructions", JSON.stringify(pageInstructions));

      return formData;
    },

    onPhaseChange: (phase) => {
      if (phase === "processing") {
        startMessageRotation();
      } else if (["idle", "complete", "error"].includes(phase)) {
        stopMessageRotation();
      }

      if (phase === "preparing") {
        setTip("Comprimiendo para subida rápida...");
      }
    },
  });

  // -- Cleanup --
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      stopMessageRotation();
    };
  }, [stopMessageRotation]);

  // -- Cargar idiomas disponibles --
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

  // -- Cargar páginas del PDF --
  const loadPdfPages = useCallback(async (pdfFile: File, currentFileId: number) => {
    try {
      if (typeof window === "undefined") {
        throw new Error("PDF loading only works in browser");
      }

      await setupPdfjs();
      const pdfjs = await import("pdfjs-dist");

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
    } catch (error: unknown) {
      console.error("Error loading PDF:", error);
      if (!isMounted.current || fileIdRef.current !== currentFileId) return;

      const err = error as { name?: string };
      if (err.name === "PasswordException") {
        const protectedError = createError.fileProtected(file.name);
        notify.error(protectedError.userMessage.description);
      } else {
        const appError = createError.fromUnknown(error, { context: "ocr-pdf-loader" });
        notify.error(appError.userMessage.description);
      }
      setPages([]);
      if (isMounted.current && fileIdRef.current === currentFileId) {
        setOcrStatus("error");
      }
    }
  }, []);

  // -- Detectar si necesita OCR --
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

  const processorResetRef = useRef(processor.reset);
  processorResetRef.current = processor.reset;

  // -- Efecto cuando cambia el archivo --
  useEffect(() => {
    if (!file) {
      setPages([]);
      setOcrStatus("idle");
      setOperationMsg("");
      setTip("");
      processor.reset();
      return;
    }

    fileIdRef.current += 1;
    const currentFileId = fileIdRef.current;
    loadPdfPages(file, currentFileId);
    detectOcrStatus(file, currentFileId);
  }, [file, loadPdfPages, detectOcrStatus]);

  // -- Setear archivo --
  const setFile = useCallback(
    (newFile: File | null) => {
      if (!newFile) {
        resetContextFiles();
        return;
      }
      if (newFile.type !== "application/pdf") {
        const error = createError.fileInvalidType(newFile.name, newFile.type, ["application/pdf"]);
        notify.error(error.userMessage.description);
        return;
      }
      addFiles([newFile]);
    },
    [addFiles, resetContextFiles]
  );

  // -- Estado derivado para UI --
  const uiState = useMemo(() => {
    let phase: ProcessingPhase = "idle";
    const pPhase = processor.phase;

    switch (pPhase) {
      case "preparing":
        phase = "compressing";
        break;
      case "uploading":
        phase = "uploading";
        break;
      case "processing":
        phase = "processing";
        break;
      case "downloading":
        phase = "processing";
        break;
      case "complete":
        phase = "ready";
        break;
      case "error":
        phase = "error";
        break;
    }

    let operation = processor.operation;
    if (pPhase === "processing") {
      operation = operationMsg || "Aplicando OCR...";
    }

    return { phase, operation };
  }, [processor.phase, processor.operation, operationMsg]);

  return {
    // Estado
    file,
    pages,
    ocrStatus,
    isProcessing: processor.isProcessing,
    isComplete: processor.isComplete,
    progress: processor.progress,
    phase: uiState.phase,
    operation: uiState.operation,
    tip,
    uploadStats: processor.uploadStats,
    availableLanguages,
    selectedLanguages,
    dpi,
    optimize,

    // Setters
    setFile,
    setSelectedLanguages,
    setDpi,
    setOptimize,

    // Acciones de páginas
    removePage: (id: string) => setPages((p) => p.filter((x) => x.id !== id)),
    rotatePage: (id: string) =>
      setPages((p) =>
        p.map((x) => (x.id === id ? { ...x, rotation: (x.rotation + 90) % 360 } : x))
      ),
    reorderPages: setPages,

    // Acciones de procesamiento
    applyOcr: (outputFileName?: string) => {
      if (!file) return;
      const finalName = outputFileName || file.name.replace(/\.pdf$/i, "-ocr.pdf");
      return processor.process(
        [file],
        { languages: selectedLanguages, dpi, optimize, pages },
        finalName
      );
    },
    downloadAgain: processor.downloadAgain,
    reset: () => {
      processor.reset();
      resetContextFiles();
      setSelectedLanguages(["spa"]);
      setDpi(300);
      setOptimize(true);
    },
    startNew: processor.reset,
    cancelOperation: processor.cancel,

    // Constantes para UI
    funFacts: OCR_FUN_FACTS,
    customTips: OCR_TIPS,
  };
}