import JSZip from 'jszip';

export async function getOfficePageCount(file: File): Promise<number> {
  const extension = file.name.toLowerCase().split('.').pop();

  // Solo operamos en formatos OOXML (ZIP)
  const isModern = ['docx', 'pptx', 'xlsx'].includes(extension || '');
  if (!isModern) return 1;

  try {
    const zip = await JSZip.loadAsync(file);

    // --- DOCX: Múltiples métodos ---
    if (extension === 'docx') {
      // Método 1: Leer app.xml
      const appXml = await zip.file('docProps/app.xml')?.async('text');
      if (appXml) {
        // Intentar con diferentes variantes de namespace
        const patterns = [
          /<Pages>(\d+)<\/Pages>/,
          /<vt:i4>(\d+)<\/vt:i4>/g, // A veces está dentro de vt:vector
          /Pages<\/vt:lpstr><vt:i4>(\d+)<\/vt:i4>/,
        ];

        for (const pattern of patterns) {
          const match = appXml.match(pattern);
          if (match && match[1]) {
            const pages = parseInt(match[1], 10);
            if (pages > 0) return pages;
          }
        }

        // Método alternativo: buscar en todo el XML
        const allNumbers = appXml.match(/Pages.*?(\d+)/i);
        if (allNumbers && allNumbers[1]) {
          const pages = parseInt(allNumbers[1], 10);
          if (pages > 0 && pages < 10000) return pages; // Validar rango razonable
        }
      }

      // Método 2: Contar saltos de página en document.xml (aproximado)
      const docXml = await zip.file('word/document.xml')?.async('text');
      if (docXml) {
        // Contar <w:br w:type="page"/> (saltos de página explícitos)
        const pageBreaks = (docXml.match(/<w:br[^>]*w:type="page"[^>]*\/>/g) || []).length;
        if (pageBreaks > 0) {
          return pageBreaks + 1; // +1 porque los saltos dividen, no cuentan la primera página
        }
      }

      // Fallback: Estimación basada en párrafos (muy aproximado)
      if (docXml) {
        const paragraphs = (docXml.match(/<w:p[\s>]/g) || []).length;
        // Asumiendo ~50 párrafos por página (muy aproximado)
        const estimatedPages = Math.max(1, Math.ceil(paragraphs / 50));
        console.log(`[DOCX] Estimación por párrafos: ${paragraphs} → ${estimatedPages} páginas`);
        return estimatedPages;
      }

      return 1;
    }

    // --- PPTX: Más fiable contar archivos de diapositivas ---
    if (extension === 'pptx') {
      const slideFiles = Object.keys(zip.files).filter(name =>
        name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
      );
      if (slideFiles.length > 0) return slideFiles.length;

      // Fallback: app.xml
      const appXml = await zip.file('docProps/app.xml')?.async('text');
      if (appXml) {
        const slidesMatch = appXml.match(/<Slides>(\d+)<\/Slides>/);
        if (slidesMatch) return parseInt(slidesMatch[1], 10);
      }

      return 1;
    }

    // --- XLSX: Contar hojas ---
    if (extension === 'xlsx') {
      const sheetFiles = Object.keys(zip.files).filter(name =>
        name.startsWith('xl/worksheets/sheet') && name.endsWith('.xml')
      );
      return sheetFiles.length || 1;
    }

    return 1;
  } catch (error) {
    console.error('Error al leer metadatos de Office:', error);
    return 1;
  }
}