import { useState, useRef, useCallback } from "react";
import { getApiUrl } from "@/lib/api";

export interface UploadStats {
  bytesUploaded: number;
  totalBytes: number;
  speed: number; // bytes per second
  timeRemaining: number; // seconds
}

export interface UseXhrUploadResult<T> {
  upload: (
    url: string,
    formData: FormData,
    responseType?: "json" | "blob"
  ) => Promise<T>;
  cancel: () => void;
  progress: number;
  isUploading: boolean;
  uploadStats: UploadStats | null;
  error: Error | null;
}

export function useXhrUpload<T = any>(): UseXhrUploadResult<T> {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState<UploadStats | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const speedSamples = useRef<number[]>([]);
  const lastProgressTime = useRef<number>(0);
  const lastProgressBytes = useRef<number>(0);

  // Helper to calculate speed (Moving Average)
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
    return (
      speedSamples.current.reduce((a, b) => a + b, 0) /
      speedSamples.current.length
    );
  }, []);

  const cancel = useCallback(() => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    setIsUploading(false);
    setUploadStats(null);
    setProgress(0);
  }, []);

  const upload = useCallback(
    async (
      endpoint: string,
      formData: FormData,
      responseType: "json" | "blob" = "json"
    ): Promise<T> => {
      // Reset state
      setIsUploading(true);
      setProgress(0);
      setError(null);
      setUploadStats(null);

      speedSamples.current = [];
      lastProgressTime.current = 0;
      lastProgressBytes.current = 0;

      return new Promise<T>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;

        if (responseType === "blob") {
          xhr.responseType = "blob";
        }

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percent = (e.loaded / e.total) * 100;
            setProgress(percent);

            const speed = calculateSpeed(e.loaded, Date.now());
            const remainingBytes = e.total - e.loaded;
            const timeRemaining = speed > 0 ? remainingBytes / speed : 0;

            setUploadStats({
              bytesUploaded: e.loaded,
              totalBytes: e.total,
              speed,
              timeRemaining,
            });
          }
        });

        xhr.addEventListener("load", () => {
          setIsUploading(false);
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              if (responseType === "blob") {
                // Automatically extract filename from content-disposition if possible, or leave it to caller
                // For T=ProcessingResult, we might need to construct a partial object
                // flexible handling:
                resolve({ blob: xhr.response, success: true } as unknown as T);
              } else {
                const response = JSON.parse(xhr.responseText);
                resolve(response);
              }
            } catch (e) {
              reject(new Error("Invalid response from server"));
            }
          } else {
            if (responseType === "blob") {
              // Blob error response requires reading the blob
              const reader = new FileReader();
              reader.onload = () => {
                try {
                  const errorData = JSON.parse(reader.result as string);
                  reject(
                    new Error(errorData.error || `Server Error ${xhr.status}`)
                  );
                } catch {
                  reject(new Error(`Server Error ${xhr.status}`));
                }
              };
              reader.onerror = () =>
                reject(new Error(`Server Error ${xhr.status}`));
              reader.readAsText(xhr.response);
            } else {
              try {
                const errorData = JSON.parse(xhr.responseText);
                reject(
                  new Error(errorData.error || `Server Error ${xhr.status}`)
                );
              } catch {
                reject(new Error(`Server Error ${xhr.status}`));
              }
            }
          }
        });

        xhr.addEventListener("error", () => {
          setIsUploading(false);
          const err = new Error("Network Error");
          setError(err);
          reject(err);
        });

        xhr.addEventListener("abort", () => {
          setIsUploading(false);
          const err = new Error("Upload Cancelled");
          // Don't set global error state for user-cancellation to avoid UI red alerts
          reject(err);
        });

        xhr.open("POST", getApiUrl(endpoint));
        xhr.send(formData);
      });
    },
    [calculateSpeed]
  );

  return {
    upload,
    cancel,
    progress,
    isUploading,
    uploadStats,
    error,
  };
}
