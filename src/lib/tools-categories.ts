export const TOOL_CATEGORIES = {
  ORGANIZE: {
    id: 'organize',
    name: 'Organizar',
    description: 'Reorganiza y estructura tus PDFs',
    icon: 'FolderTree',
    color: 'blue',
    tools: [
      'merge-pdf',
      'split-pdf',
      'extract-pages',
      'delete-pages',
      'rotate-pdf',
      'organize-pdf'
    ]
  },
  CONVERT_TO_PDF: {
    id: 'convert-to-pdf',
    name: 'Convertir a PDF',
    description: 'Crea PDFs desde otros formatos',
    icon: 'FileInput',
    color: 'green',
    tools: [
      'images-to-pdf',
      'word-to-pdf',
      'excel-to-pdf',
      'powerpoint-to-pdf',
      'html-to-pdf'
    ]
  },
  CONVERT_FROM_PDF: {
    id: 'convert-from-pdf',
    name: 'Convertir desde PDF',
    description: 'Exporta PDFs a otros formatos',
    icon: 'FileOutput',
    color: 'purple',
    tools: [
      'pdf-to-image',
      'pdf-to-word',
      'pdf-to-excel',
      'pdf-to-powerpoint',
      'pdf-to-greyscale'
    ]
  },
  EDIT: {
    id: 'edit',
    name: 'Editar',
    description: 'Modifica el contenido de tus PDFs',
    icon: 'Edit',
    color: 'orange',
    tools: [
      'crop-pages',
      'add-watermark',
      'add-page-numbers',
      'edit-metadata',
      'add-text',
      'add-images'
    ]
  },
  SECURITY: {
    id: 'security',
    name: 'Seguridad',
    description: 'Protege y asegura tus documentos',
    icon: 'Shield',
    color: 'red',
    tools: [
      'protect-pdf',
      'unlock-pdf',
      'remove-password',
      'sign-pdf',
      'redact-pdf'
    ]
  },
  OPTIMIZE: {
    id: 'optimize',
    name: 'Optimizar',
    description: 'Reduce tamaño y mejora rendimiento',
    icon: 'Gauge',
    color: 'yellow',
    tools: [
      'compress-pdf',
      'reduce-size',
      'optimize-images',
      'remove-duplicates'
    ]
  }
} as const;