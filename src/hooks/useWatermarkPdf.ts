import { useCallback, useState, useRef } from "react";
import { applyWatermarkToPdf } from "@/lib/watermark-client-utils";
import { notify } from "@/lib/errors/notifications";
import type { ProcessingResult } from "./core/useToolProcessor";

export type WatermarkPosition = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'custom';

export interface WatermarkOptions {
  type: 'text' | 'image';

  // Common
  opacity: number;
  position: WatermarkPosition;
  customX?: number; // Normalized 0-1 (percentage of page width)
  customY?: number; // Normalized 0-1 (percentage of page height)
  pages: 'all' | string;
  fileName: string;
  compressed?: 'true' | 'false';

  // Text specific
  text?: string;
  fontSize?: number;
  color?: string;
  rotation?: number;

  // Image specific
  watermarkImage?: File;
  width?: number;
  height?: number;
  maintainAspectRatio?: 'true' | 'false';
}

export interface WatermarkResult extends ProcessingResult {
  watermark: {
    type: 'text' | 'image';
    text?: string;
    position: string;
    dimensions?: { width: number; height: number };
  };
  pagesProcessed: number;
}

/**
 * Hook for applying watermarks client-side using pdf-lib
 * Processes PDFs entirely in the browser without backend dependency
 */
export function useWatermarkPdf() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'preparing' | 'processing' | 'complete'>('idle');
  const [result, setResult] = useState<WatermarkResult | null>(null);
  const resultBlobRef = useRef<Blob | null>(null);

  const process = useCallback(async (file: File, options: WatermarkOptions): Promise<WatermarkResult | null> => {
    setIsProcessing(true);
    setIsComplete(false);
    setProgress(0);
    setPhase('preparing');
    resultBlobRef.current = null;

    try {
      console.log('🔍 Watermark options:', {
        type: options.type,
        opacity: options.opacity,
        position: options.position,
        rotation: options.rotation,
        pages: options.pages,
        ...(options.type === 'text' ? {
          text: options.text,
          fontSize: options.fontSize,
          color: options.color,
        } : {
          hasImage: !!options.watermarkImage,
          width: options.width,
          maintainAspectRatio: options.maintainAspectRatio,
        })
      });

      // Validate inputs
      if (options.type === 'text' && !options.text) {
        throw new Error('Texto de marca de agua requerido');
      }
      if (options.type === 'image' && !options.watermarkImage) {
        throw new Error('Imagen de marca de agua requerida');
      }

      setProgress(10);
      setPhase('processing');

      // Apply watermark client-side
      const watermarkedFile = await applyWatermarkToPdf(file, options);
      setProgress(80);

      // Convert to blob
      const blob = new Blob([await watermarkedFile.arrayBuffer()], { type: 'application/pdf' });
      resultBlobRef.current = blob;

      const resultData: WatermarkResult = {
        success: true,
        fileName: options.fileName || file.name.replace('.pdf', '-watermarked.pdf'),
        fileId: crypto.randomUUID(),
        blob,
        watermark: {
          type: options.type,
          text: options.type === 'text' ? options.text : undefined,
          position: options.position,
        },
        pagesProcessed: options.pages === 'all' ? 0 : JSON.parse(options.pages).length,
      };

      setProgress(100);
      setPhase('complete');
      setIsComplete(true);
      setResult(resultData);

      // Auto-download
      setTimeout(() => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = resultData.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 500);

      return resultData;

    } catch (error) {
      console.error('❌ Error applying watermark:', error);
      notify.error(error instanceof Error ? error.message : 'Error al aplicar marca de agua');
      setIsProcessing(false);
      setPhase('idle');
      return null;
    }
  }, []);

  const handleDownloadAgain = useCallback(() => {
    if (resultBlobRef.current && result) {
      const url = URL.createObjectURL(resultBlobRef.current);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [result]);

  const handleStartNew = useCallback(() => {
    setIsProcessing(false);
    setIsComplete(false);
    setProgress(0);
    setPhase('idle');
    setResult(null);
    resultBlobRef.current = null;
  }, []);

  const cancelOperation = useCallback(() => {
    // Client-side processing can't be cancelled mid-operation,
    // but we can reset the state
    handleStartNew();
  }, [handleStartNew]);

  return {
    isProcessing,
    isComplete,
    progress,
    phase: phase as any, // Cast to match legacy phase type
    operation: 'Aplicando marca de agua',
    uploadStats: null,
    result,
    process,
    handleDownloadAgain,
    handleStartNew,
    cancelOperation,
  };
}
