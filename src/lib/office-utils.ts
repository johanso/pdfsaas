import JSZip from 'jszip';

export async function getOfficePageCount(file: File): Promise<number> {
  const extension = file.name.toLowerCase().split('.').pop();

  // Solo operamos en formatos OOXML (ZIP)
  const isModern = ['docx', 'pptx', 'xlsx'].includes(extension || '');
  if (!isModern) return 1;

  try {
    const zip = await JSZip.loadAsync(file);

    // --- PPTX: Más fiable contar archivos de diapositivas ---
    if (extension === 'pptx') {
      const slideFiles = Object.keys(zip.files).filter(name =>
        name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
      );
      if (slideFiles.length > 0) return slideFiles.length;
    }

    // --- XLSX: Contar hojas ---
    if (extension === 'xlsx') {
      const sheetFiles = Object.keys(zip.files).filter(name =>
        name.startsWith('xl/worksheets/sheet') && name.endsWith('.xml')
      );
      return sheetFiles.length || 1;
    }

    // --- Metadatos generales (app.xml) ---
    const appXml = await zip.file('docProps/app.xml')?.async('text');
    if (!appXml) return 1;

    // Búsqueda por Regex para evitar problemas con namespaces de DOMParser
    if (extension === 'docx') {
      const pagesMatch = appXml.match(/<Pages>(\d+)<\/Pages>/);
      return pagesMatch ? parseInt(pagesMatch[1], 10) : 1;
    }

    if (extension === 'pptx') {
      const slidesMatch = appXml.match(/<Slides>(\d+)<\/Slides>/);
      return slidesMatch ? parseInt(slidesMatch[1], 10) : 1;
    }

    return 1;
  } catch (error) {
    console.error('Error al leer metadatos de Office:', error);
    return 1;
  }
}
