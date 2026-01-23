// lib/tools-data.ts
export interface Tool {
  id: string;
  name: string;
  description: string;
  path: string;
  icon: string;
  category: string;
  isAvailable: boolean;
  isPremium?: boolean;
  comingSoon?: boolean;
}

export const TOOLS: Record<string, Tool> = {
  // --- ORGANIZE ---
  'merge-pdf': {
    id: 'merge-pdf',
    name: 'Unir PDF',
    description: 'Combina múltiples documentos en un solo archivo ordenado.',
    path: '/unir-pdf',
    icon: 'Combine',
    category: 'organize',
    isAvailable: true
  },
  'split-pdf': {
    id: 'split-pdf',
    name: 'Dividir PDF',
    description: 'Extrae páginas o separa un documento grande en partes.',
    path: '/dividir-pdf',
    icon: 'Split',
    category: 'organize',
    isAvailable: true
  },
  'delete-pages': {
    id: 'delete-pages',
    name: 'Eliminar Páginas',
    description: 'Remueve páginas específicas',
    path: '/eliminar-paginas-pdf',
    icon: 'Trash2',
    category: 'organize',
    isAvailable: true
  },
  'extract-pages': {
    id: 'extract-pages',
    name: 'Extraer Páginas',
    description: 'Extrae páginas seleccionadas',
    path: '/extraer-paginas-pdf',
    icon: 'FileDown',
    category: 'organize',
    isAvailable: true
  },
  'organize-pdf': {
    id: 'organize-pdf',
    name: 'Organizar PDF',
    description: 'Ordena, rota o elimina páginas innecesarias de tu documento.',
    path: '/organizar-pdf',
    icon: 'Layers',
    category: 'organize',
    isAvailable: true
  },
  'reorder-pages': {
    id: 'reorder-pages',
    name: 'Reordenar Páginas',
    description: 'Cambia el orden de las páginas',
    path: '/reordenar-paginas',
    icon: 'GripVertical',
    category: 'organize',
    isAvailable: false,
    comingSoon: true
  },

  // --- CONVERT FROM PDF ---
  'pdf-to-image': {
    id: 'pdf-to-image',
    name: 'PDF a Imagen',
    description: 'Convierte páginas de PDF a imágenes JPG, PNG o WebP de alta calidad.',
    path: '/pdf-a-imagen',
    icon: 'Image',
    category: 'convert-from-pdf',
    isAvailable: true
  },
  'pdf-to-word': {
    id: 'pdf-to-word',
    name: 'PDF a Word',
    description: 'Convierte PDF a documentos editables',
    path: '/pdf-a-word',
    icon: 'FileText',
    category: 'convert-from-pdf',
    isAvailable: false,
    comingSoon: true
  },
  'pdf-to-excel': {
    id: 'pdf-to-excel',
    name: 'PDF a Excel',
    description: 'Extrae tablas a hojas de cálculo',
    path: '/pdf-a-excel',
    icon: 'FileSpreadsheet',
    category: 'convert-from-pdf',
    isAvailable: false,
    comingSoon: true
  },
  'pdf-to-powerpoint': {
    id: 'pdf-to-powerpoint',
    name: 'PDF a PPTX',
    description: 'Convierte a presentaciones',
    path: '/pdf-a-powerpoint',
    icon: 'Presentation',
    category: 'convert-from-pdf',
    isAvailable: false,
    comingSoon: true
  },

  // --- CONVERT TO PDF ---
  'images-to-pdf': {
    id: 'images-to-pdf',
    name: 'Imagen a PDF',
    description: 'Transforma imágenes (JPG, PNG) o documentos Office a PDF.',
    path: '/imagen-a-pdf',
    icon: 'Images',
    category: 'convert-to-pdf',
    isAvailable: true,
    comingSoon: false
  },
  'word-to-pdf': {
    id: 'word-to-pdf',
    name: 'Word a PDF',
    description: 'Convierte .docx a PDF',
    path: '/word-a-pdf',
    icon: 'FileText',
    category: 'convert-to-pdf',
    isAvailable: true,
    comingSoon: false
  },
  'excel-to-pdf': {
    id: 'excel-to-pdf',
    name: 'Excel a PDF',
    description: 'Convierte .xlsx a PDF',
    path: '/excel-a-pdf',
    icon: 'FileSpreadsheet',
    category: 'convert-to-pdf',
    isAvailable: true,
    comingSoon: false
  },
  'powerpoint-to-pdf': {
    id: 'powerpoint-to-pdf',
    name: 'PPT a PDF',
    description: 'Convierte .pptx a PDF',
    path: '/powerpoint-a-pdf',
    icon: 'Presentation',
    category: 'convert-to-pdf',
    isAvailable: true,
    comingSoon: false
  },
  'html-to-pdf': {
    id: 'html-to-pdf',
    name: 'HTML a PDF',
    description: 'Convierte webs a PDF',
    path: '/html-a-pdf',
    icon: 'Code',
    category: 'convert-to-pdf',
    isAvailable: true,
    comingSoon: false
  },

  // --- EDIT ---
  'rotate-pdf': {
    id: 'rotate-pdf',
    name: 'Rotar PDF',
    description: 'Gira páginas en cualquier dirección',
    path: '/rotar-pdf',
    icon: 'RotateCw',
    category: 'edit',
    isAvailable: true
  },
  'crop-pages': {
    id: 'crop-pages',
    name: 'Recortar',
    description: 'Ajusta los márgenes del PDF',
    path: '/recortar-pdf',
    icon: 'Crop',
    category: 'edit',
    isAvailable: false,
    comingSoon: true
  },
  'add-watermark': {
    id: 'add-watermark',
    name: 'Marca de Agua',
    description: 'Protege con texto o imagen',
    path: '/marca-de-agua',
    icon: 'Droplet',
    category: 'edit',
    isAvailable: true,
    comingSoon: false
  },
  'add-page-numbers': {
    id: 'add-page-numbers',
    name: 'Números de Página',
    description: 'Agrega numeración automática',
    path: '/agregar-numeros-pagina',
    icon: 'Hash',
    category: 'edit',
    isAvailable: false,
    comingSoon: true
  },
  'edit-metadata': {
    id: 'edit-metadata',
    name: 'Editar Metadatos',
    description: 'Cambia autor, título y fechas',
    path: '/editar-metadatos',
    icon: 'Info',
    category: 'edit',
    isAvailable: false,
    comingSoon: true
  },
  'add-text': {
    id: 'add-text',
    name: 'Añadir Texto',
    description: 'Escribe sobre tu documento',
    path: '/añadir-texto',
    icon: 'Type',
    category: 'edit',
    isAvailable: false,
    comingSoon: true
  },
  'add-images': {
    id: 'add-images',
    name: 'Añadir Imágenes',
    description: 'Inserta fotos en tu PDF',
    path: '/añadir-imagenes',
    icon: 'ImagePlus',
    category: 'edit',
    isAvailable: false,
    comingSoon: true
  },

  // --- SECURITY ---
  'protect-pdf': {
    id: 'protect-pdf',
    name: 'Proteger PDF',
    description: 'Encripta tus archivos con contraseña para máxima seguridad.',
    path: '/proteger-pdf',
    icon: 'Lock',
    category: 'security',
    isAvailable: true,
    comingSoon: false
  },
  'unlock-pdf': {
    id: 'unlock-pdf',
    name: 'Desbloquear',
    description: 'Elimina contraseñas de seguridad de archivos PDF.',
    path: '/desbloquear-pdf',
    icon: 'Unlock',
    category: 'security',
    isAvailable: true,
    comingSoon: false
  },
  'sign-pdf': {
    id: 'sign-pdf',
    name: 'Firmar PDF',
    description: 'Dibuja tu firma digital y sella tus documentos legalmente.',
    path: '/firmar-pdf',
    icon: 'PenTool',
    category: 'security',
    isAvailable: true,
    comingSoon: false
  },
  'redact-pdf': {
    id: 'redact-pdf',
    name: 'Censurar',
    description: 'Oculta información sensible',
    path: '/censurar-pdf',
    icon: 'Eraser',
    category: 'security',
    isAvailable: false,
    comingSoon: true
  },

  // --- OPTIMIZE ---
  'compress-pdf': {
    id: 'compress-pdf',
    name: 'Comprimir PDF',
    description: 'Reduce el peso de tu archivo manteniendo la mejor calidad.',
    path: '/comprimir-pdf',
    icon: 'Minimize2',
    category: 'optimize',
    isAvailable: true,
    comingSoon: false
  },
  'ocr-pdf': {
    id: 'ocr-pdf',
    name: 'OCR PDF',
    description: 'Reconoce texto en documentos escaneados y hazlos buscables.',
    path: '/ocr-pdf',
    icon: 'ScanText',
    category: 'optimize',
    isAvailable: true,
    comingSoon: false
  },
  'pdf-to-grayscale': {
    id: 'pdf-to-grayscale',
    name: 'Escala de Grises',
    description: 'Convierte a blanco y negro para ahorrar tinta',
    path: '/pdf-escala-grises',
    icon: 'Contrast',
    category: 'optimize',
    isAvailable: true,
    comingSoon: false
  },
  'flatten-pdf': {
    id: 'flatten-pdf',
    name: 'Aplanar PDF',
    description: 'Fusiona capas y formularios para evitar la edición del contenido.',
    path: '/aplanar-pdf',
    icon: 'Layers',
    category: 'optimize',
    isAvailable: true,
    comingSoon: false
  },
  'repair-pdf': {
    id: 'repair-pdf',
    name: 'Reparar PDF',
    description: 'Intenta recuperar PDFs corruptos o dañados',
    path: '/reparar-pdf',
    icon: 'Wrench',
    category: 'optimize',
    isAvailable: true,
    comingSoon: false
  }
};