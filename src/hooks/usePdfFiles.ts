import { useCallback } from "react";
import { useFileContext } from "@/context/FileContext";

export function usePdfFiles(skipPdfValidation: boolean = false) {
  const context = useFileContext();

  // Wrap addFiles to inject the skipPdfValidation argument from the hook usage
  const addFiles = useCallback(
    (files: File[]) => context.addFiles(files, skipPdfValidation),
    [context.addFiles, skipPdfValidation]
  );

  return {
    ...context,
    addFiles,
    isLoading: context.isLoading
  };
}