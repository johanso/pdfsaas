/**
 * Hook para OCR PDF
 * Refactorizado: Extraídas constantes y configuración pdf-js
 */

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { notify } from "@/lib/errors/notifications";
import { createError } from "@/lib/errors/error-types";
import { getApiUrl } from "@/lib/api";
import { usePdfFiles } from "./usePdfFiles";
import { useToolProcessor, ProcessingResult, UploadStats } from "./core/useToolProcessor";
import { setupPdfjs } from "@/lib/pdfjs-config";
import {
  DEFAULT_LANGUAGES,
  OPERATION_MESSAGES,
  PROCESSING_TIPS,
  OCR_FUN_FACTS,
  OCR_TIPS
} from "@/lib/ocr-constants";
import type { DpiOption, Language } from "@/lib/ocr-constants";

// ============================================================================
// TYPES
// ============================================================================

export type OcrStatus = "idle" | "detecting" | "scanned" | "has-text" | "error";
export type ProcessingPhase = "idle" | "compressing" | "uploading" | "processing" | "ready" | "error";

export interface PageInfo {
  id: string;
  pageNumber: number;
  rotation: number;
}

export type { UploadStats };

// ============================================================================
// RE-EXPORTS CONSTANTS (Compatibility)
// ============================================================================

export {
  DPI_OPTIONS,
  DEFAULT_LANGUAGES,
  OCR_FUN_FACTS,
  OCR_TIPS,
  OPERATION_MESSAGES,
  PROCESSING_TIPS,
} from "@/lib/ocr-constants";

export type { DpiOption, Language } from "@/lib/ocr-constants";

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
    { 
      languages: string[]; 
      dpi: DpiOption; 
      optimize: boolean; 
      pages: PageInfo[];
      fileName?: string;
    },
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
      formData.append("fileName", options.fileName || '');

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
      const pdfjsModule = await import("pdfjs-dist");
      const pdfjs = pdfjsModule.default || pdfjsModule;

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
        const protectedError = createError.fileProtected(file!.name);
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
  }, [file]); // added file dependency for name

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
      processorResetRef.current();
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
    result: processor.result,

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
        { 
          languages: selectedLanguages, 
          dpi, 
          optimize, 
          pages,
          fileName: finalName
        },
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