import { useState } from "react";
import { toast } from "sonner";

interface ProcessOptions {
  endpoint: string;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function usePdfProcessing() {
  const [isProcessing, setIsProcessing] = useState(false);

  const processAndDownload = async (
    fileName: string,
    formData: FormData,
    options: ProcessOptions & { extension?: string }
  ) => {
    setIsProcessing(true);

    try {
      const response = await fetch(options.endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || options.errorMessage || "Error al procesar el archivo");
      }

      // Download the result
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Determine file extension
      let ext = options.extension;
      if (!ext) {
        ext = blob.type === "application/zip" ? "zip" : "pdf";
      }
      a.download = `${fileName}.${ext}`;

      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(options.successMessage || "¡Archivo procesado correctamente!");
      options.onSuccess?.();

      return true;
    } catch (error) {
      console.error(error);
      const msg = error instanceof Error ? error.message : (options.errorMessage || "Error al procesar el archivo");
      toast.error(msg);
      options.onError?.(error instanceof Error ? error : new Error(msg));
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    processAndDownload
  };
}