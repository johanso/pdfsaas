import { useState, useEffect } from "react";
import { notify } from "@/lib/errors/notifications";
import { createError } from "@/lib/errors/error-types";
import { usePdfjs } from "@/hooks/core/usePdfjs";

interface UsePdfLoaderOptions {
  onLoad?: (numPages: number) => void;
  onError?: (error: Error) => void;
}

export function usePdfLoader(file: File | null, options?: UsePdfLoaderOptions) {
  const [numPages, setNumPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { getPageCount } = usePdfjs();

  useEffect(() => {
    if (!file) {
      setNumPages(0);
      return;
    }

    const loadPdf = async () => {
      setIsLoading(true);
      try {
        const pages = await getPageCount(file);
        setNumPages(pages);
        options?.onLoad?.(pages);
      } catch (err) {
        console.error(err);
        const appError = createError.fromUnknown(err, { context: "pdf-loader" });
        notify.error(appError.userMessage.description);
        options?.onError?.(appError);
      } finally {
        setIsLoading(false);
      }
    };

    loadPdf();
  }, [file, getPageCount, options]);

  return { numPages, isLoading };
}