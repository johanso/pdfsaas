'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export default function TestWorkerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const testWordToPdf = async () => {
    if (!file) {
      toast.error('Selecciona un archivo primero');
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://145.223.126.240:3001/api/word-to-pdf', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error en conversión');
      }

      const blob = await response.blob();

      // Descargar
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.[^.]+$/, '.pdf');
      a.click();
      URL.revokeObjectURL(url);

      toast.success('¡Conversión exitosa!');

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error al convertir');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">🧪 Test Worker API</h1>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-8">
          <input
            type="file"
            accept=".docx,.doc"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full"
          />
        </div>

        {file && (
          <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
            <p className="text-sm">
              <strong>Archivo seleccionado:</strong> {file.name}
            </p>
            <p className="text-xs text-zinc-500">
              Tamaño: {(file.size / 1024).toFixed(2)} KB
            </p>
          </div>
        )}

        <button
          onClick={testWordToPdf}
          disabled={!file || isProcessing}
          className="w-full bg-primary text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
        >
          {isProcessing ? 'Convirtiendo...' : 'Convertir Word → PDF'}
        </button>

        <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Estado del Worker:</strong>
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            http://145.223.126.240:3001
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-2">
        <h2 className="text-xl font-bold">Endpoints disponibles:</h2>
        <ul className="text-sm space-y-1 text-zinc-600 dark:text-zinc-400">
          <li>✅ POST /api/word-to-pdf</li>
          <li>✅ POST /api/pdf-to-word</li>
          <li>✅ POST /api/excel-to-pdf</li>
          <li>✅ POST /api/pdf-to-excel</li>
          <li>✅ POST /api/ppt-to-pdf</li>
          <li>✅ POST /api/pdf-to-ppt</li>
          <li>✅ POST /api/compress-pdf</li>
          <li>✅ POST /api/pdf-to-image</li>
          <li>✅ POST /api/protect-pdf</li>
          <li>✅ POST /api/unlock-pdf</li>
        </ul>
      </div>
    </div>
  );
}