import { useState, useCallback } from "react";
import { useToolProcessor } from "./core/useToolProcessor";

// Types
export type EncryptionLevel = "128" | "256";

export interface ProtectOptions {
  userPassword: string;
  encryption: EncryptionLevel;
  fileName: string;
}

export interface ProtectResult {
  fileId: string;
  fileName: string;
  originalSize: number;
  resultSize: number;
  encryption: string;
}

// Helper function
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

export const useProtectPdf = () => {
  const [result, setResult] = useState<ProtectResult | null>(null);

  const {
    isProcessing,
    isComplete,
    progress,
    phase,
    operation,
    uploadStats,
    process,
    cancel,
    downloadAgain,
    reset,
  } = useToolProcessor<ProtectOptions, ProtectResult>({
    toolId: "protect-pdf",
    endpoint: "/api/worker/protect-pdf",
    operationName: "Protegiendo PDF...",
    prepareFormData: async (files, options) => {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("password", options.userPassword);
      formData.append("encryption", options.encryption);
      return formData;
    },
    responseType: "json",
    getResultFileName: (result, originalName) => result.fileName,
  });

  const protect = useCallback(
    async (file: File, options: ProtectOptions): Promise<ProtectResult> => {
      const data = await process([file], options, options.fileName);
      if (data) {
        setResult(data);
        return data;
      }
      throw new Error("Error al proteger el PDF");
    },
    [process]
  );

  const handleDownloadAgain = useCallback(() => {
    downloadAgain();
  }, [downloadAgain]);

  const handleStartNew = useCallback(() => {
    reset();
    setResult(null);
  }, [reset]);

  const cancelOperation = useCallback(() => {
    cancel();
  }, [cancel]);

  return {
    // State
    result,
    isProcessing,
    isComplete,
    progress,
    phase,
    operation,
    uploadStats,
    // Actions
    protect,
    handleDownloadAgain,
    handleStartNew,
    cancelOperation,
  };
};
