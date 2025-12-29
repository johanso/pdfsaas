import { getApiUrl } from "./api";

export class PdfWorkerClient {
  private baseUrl = "/api/worker";

  // ===== WORD =====
  async wordToPdf(file: File): Promise<Blob> {
    return this.convert(file, '/api/word-to-pdf');
  }

  async pdfToWord(file: File): Promise<Blob> {
    return this.convert(file, '/api/pdf-to-word');
  }

  // ===== EXCEL =====
  async excelToPdf(file: File): Promise<Blob> {
    return this.convert(file, '/api/excel-to-pdf');
  }

  async pdfToExcel(file: File): Promise<Blob> {
    return this.convert(file, '/api/pdf-to-excel');
  }

  // ===== POWERPOINT =====
  async pptToPdf(file: File): Promise<Blob> {
    return this.convert(file, '/api/ppt-to-pdf');
  }

  async pdfToPpt(file: File): Promise<Blob> {
    return this.convert(file, '/api/pdf-to-ppt');
  }

  // ===== COMPRIMIR =====
  async compressPdf(
    file: File,
    quality: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('quality', quality);

    return this.convert(formData, '/api/compress-pdf');
  }

  // ===== IMÁGENES =====
  async pdfToImage(
    file: File,
    format: 'jpg' | 'png' | 'webp' = 'jpg',
    quality: number = 90,
    dpi: number = 300
  ): Promise<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);
    formData.append('quality', quality.toString());
    formData.append('dpi', dpi.toString());

    return this.convert(formData, '/api/pdf-to-image');
  }

  // ===== SEGURIDAD =====
  async protectPdf(file: File, password: string): Promise<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);

    return this.convert(formData, '/api/protect-pdf');
  }

  async unlockPdf(file: File, password: string): Promise<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);

    return this.convert(formData, '/api/unlock-pdf');
  }

  // ===== MÉTODO GENÉRICO =====
  private async convert(
    input: File | FormData,
    endpoint: string
  ): Promise<Blob> {
    const formData = input instanceof FormData
      ? input
      : this.fileToFormData(input);

    const fullUrl = getApiUrl(`${this.baseUrl}${endpoint}`);

    const response = await fetch(fullUrl, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Conversion failed');
    }

    return response.blob();
  }

  private fileToFormData(file: File): FormData {
    const formData = new FormData();
    formData.append('file', file);
    return formData;
  }

  // ===== HEALTH CHECK =====
  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    services: Record<string, string>;
  }> {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.json();
  }
}

// Singleton instance
export const pdfWorkerClient = new PdfWorkerClient();


// Endpoints Disponibles
// ✅ POST /api/word-to-pdf       - Word → PDF
// ✅ POST /api/pdf-to-word       - PDF → Word
// ✅ POST /api/excel-to-pdf      - Excel → PDF
// ✅ POST /api/pdf-to-excel      - PDF → Excel
// ✅ POST /api/ppt-to-pdf        - PowerPoint → PDF
// ✅ POST /api/pdf-to-ppt        - PDF → PowerPoint
// ✅ POST /api/compress-pdf      - Comprimir PDF
// ✅ POST /api/pdf-to-image      - PDF → Imagen
// ✅ POST /api/protect-pdf       - Proteger con contraseña
// ✅ POST /api/unlock-pdf        - Desbloquear PDF