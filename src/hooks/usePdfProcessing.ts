import { useState } from "react";
import { toast } from "sonner";

interface ProcessOptions {
  endpoint: string;
  successMessage?: string;
  errorMessage?: string;
  extension?: string;
  operation?: string; // e.g., "Uniendo PDFs", "Convirtiendo a Word"
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onContinueEditing?: () => void;
  onStartNew?: () => void;
}

interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  isComplete: boolean;
  fileName: string;
  operation: string;
}

export function usePdfProcessing() {
  const [state, setState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    isComplete: false,
    fileName: "",
    operation: ""
  });

  const [downloadBlob, setDownloadBlob] = useState<{ blob: Blob; fileName: string } | null>(null);

  const processAndDownload = async (
    fileName: string,
    formData: FormData,
    options: ProcessOptions
  ) => {
    setState({
      isProcessing: true,
      progress: 0,
      isComplete: false,
      fileName: fileName,
      operation: options.operation || "Procesando archivo"
    });

    try {
      // Use XMLHttpRequest for progress tracking
      const result = await new Promise<Blob>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const uploadProgress = (e.loaded / e.total) * 50; // Upload is 50% of total
            setState(prev => ({ ...prev, progress: uploadProgress }));
          }
        });

        // Track download progress
        xhr.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const downloadProgress = 50 + (e.loaded / e.total) * 50; // Download is other 50%
            setState(prev => ({ ...prev, progress: downloadProgress }));
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setState(prev => ({ ...prev, progress: 100 }));
            resolve(xhr.response);
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(new Error(errorData.error || options.errorMessage || "Error al procesar el archivo"));
            } catch {
              reject(new Error(options.errorMessage || "Error al procesar el archivo"));
            }
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Error de red al procesar el archivo"));
        });

        xhr.open("POST", options.endpoint);
        xhr.responseType = "blob";
        xhr.send(formData);
      });

      // Determine file extension
      let ext = options.extension;
      if (!ext) {
        ext = result.type === "application/zip" ? "zip" : "pdf";
      }

      const fullFileName = `${fileName}.${ext}`;

      // Store blob for potential re-download
      setDownloadBlob({ blob: result, fileName: fullFileName });

      // Trigger download
      const url = window.URL.createObjectURL(result);
      const a = document.createElement("a");
      a.href = url;
      a.download = fullFileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Mark as complete
      setState(prev => ({ ...prev, isComplete: true }));

      toast.success(options.successMessage || "¡Archivo procesado correctamente!");
      options.onSuccess?.();

      return true;
    } catch (error) {
      console.error(error);
      const msg = error instanceof Error ? error.message : (options.errorMessage || "Error al procesar el archivo");
      toast.error(msg);
      options.onError?.(error instanceof Error ? error : new Error(msg));

      // Reset state on error
      setState({
        isProcessing: false,
        progress: 0,
        isComplete: false,
        fileName: "",
        operation: ""
      });

      return false;
    }
  };

  const handleDownloadAgain = () => {
    if (!downloadBlob) return;

    const url = window.URL.createObjectURL(downloadBlob.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadBlob.fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast.success("Archivo descargado nuevamente");
  };

  const handleContinueEditing = (callback?: () => void) => {
    setState({
      isProcessing: false,
      progress: 0,
      isComplete: false,
      fileName: "",
      operation: ""
    });
    setDownloadBlob(null);
    callback?.();
  };

  const handleStartNew = (callback?: () => void) => {
    setState({
      isProcessing: false,
      progress: 0,
      isComplete: false,
      fileName: "",
      operation: ""
    });
    setDownloadBlob(null);
    callback?.();
  };

  return {
    isProcessing: state.isProcessing,
    progress: state.progress,
    isComplete: state.isComplete,
    fileName: state.fileName,
    operation: state.operation,
    processAndDownload,
    handleDownloadAgain,
    handleContinueEditing,
    handleStartNew
  };
}