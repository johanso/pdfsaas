import { useState } from 'react';
import { PdfWorkerClient } from '@/lib/pdf-worker-client';
import { toast } from 'sonner';

export function useWorkerTest() {
  const [isProcessing, setIsProcessing] = useState(false);
  const client = new PdfWorkerClient();

  const testConversion = async (file: File) => {
    setIsProcessing(true);

    try {
      const blob = await client.wordToPdf(file);

      // Descargar automáticamente
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.[^.]+$/, '.pdf');
      a.click();
      URL.revokeObjectURL(url);

      toast.success('¡Conversión exitosa!');
    } catch (error) {
      console.error(error);
      toast.error('Error en la conversión');
    } finally {
      setIsProcessing(false);
    }
  };

  return { testConversion, isProcessing };
}