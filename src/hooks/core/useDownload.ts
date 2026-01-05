import { useState, useCallback } from "react";
import { getApiUrl } from "@/lib/api";
import { notify } from "@/lib/errors/notifications";

export function useDownload() {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadBlob = useCallback((blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const downloadFromUrl = useCallback(
    async (url: string, fileName: string) => {
      setIsDownloading(true);
      try {
        const response = await fetch(getApiUrl(url));
        if (!response.ok) throw new Error("Download failed");
        const blob = await response.blob();
        downloadBlob(blob, fileName);
        return blob;
      } catch (error) {
        console.error("Download error:", error);
        notify.error("Error al descargar el archivo");
        throw error;
      } finally {
        setIsDownloading(false);
      }
    },
    [downloadBlob]
  );

  return {
    downloadBlob,
    downloadFromUrl,
    isDownloading,
  };
}
