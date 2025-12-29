import { useFileContext } from "@/context/FileContext";

export function usePdfFiles(skipPdfValidation: boolean = false) {
  const context = useFileContext();

  // Wrap addFiles to inject the skipPdfValidation argument from the hook usage
  const addFiles = (files: File[]) => context.addFiles(files, skipPdfValidation);

  return {
    ...context,
    addFiles
  };
}