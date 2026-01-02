import { ToolPageData } from "./types";

export const wordToPdfContent: ToolPageData = {
  id: "word-to-pdf",

  metadata: {
    title: "Word a PDF - Convertir DOCX y DOC a PDF con Formato Perfecto",
    description: "Convierte archivos Word (.doc, .docx) a PDF manteniendo el diseño original. Tecnología de servidor para máxima fidelidad en tablas e imágenes. Gratis y seguro.",
    keywords: [
      "word a pdf",
      "convertir word a pdf",
      "docx a pdf",
      "doc a pdf",
      "guardar word como pdf",
      "convertir documento word",
      "office a pdf online"
    ],
    canonical: "/word-a-pdf",
    ogImage: "/og-images/word-to-pdf.jpg",
  },

  titleSectionSteps: "Cómo pasar un documento Word a PDF sin perder formato",
  titleSectionBenefits: "¿Por qué nuestro conversor de DOCX es el más fiable?",
  titleSectionFAQ: "Preguntas Frecuentes sobre la conversión de Word",

  steps: [
    {
      number: "1",
      title: "Sube tu documento",
      description:
        "Selecciona tu archivo .DOCX o .DOC. Nuestro sistema lo analizará instantáneamente para preparar la conversión.",
    },
    {
      number: "2",
      title: "Procesamiento inteligente",
      description:
        "Convertimos tu archivo en servidores que utilizan tecnología avanzada para asegurar que las tablas y fuentes no se muevan.",
    },
    {
      number: "3",
      title: "Descarga el PDF",
      description:
        "Haz clic en 'Convertir'. En segundos tendrás un archivo PDF profesional listo para descargar y compartir.",
    },
  ],

  benefits: [
    {
      icon: "FileText",
      title: "Formato Exacto",
      description:
        "Olvídate de las tablas descolocadas. Usamos un motor de renderizado profesional (LibreOffice) en el servidor para garantizar que tu PDF se vea idéntico al Word original.",
    },
    {
      icon: "Files",
      title: "Soporte DOC y DOCX",
      description:
        "¿Tienes un archivo antiguo de Word 97-2003 (.doc) o uno moderno (.docx)? Soportamos ambos formatos sin problemas de compatibilidad.",
    },
    {
      icon: "ShieldCheck",
      title: "Limpieza Automática (10 min)",
      description:
        "Tu privacidad es sagrada. Los archivos convertidos se almacenan temporalmente y se eliminan automáticamente de nuestros servidores a los 10 minutos.",
    },
    {
      icon: "Laptop",
      title: "Universal",
      description:
        "No necesitas tener Microsoft Office instalado. Convierte tus documentos desde tu móvil, tablet, Mac o Linux sin gastar en licencias.",
    },
  ],

  faqs: [
    // Preguntas Específicas
    {
      question: "¿Se mantendrá el formato de mis tablas e imágenes?",
      answer:
        "Sí. A diferencia de otros conversores básicos, utilizamos un motor de procesamiento en el servidor robusto diseñado específicamente para interpretar estructuras complejas de Word, garantizando la máxima fidelidad.",
    },
    {
      question: "¿Puedo convertir archivos .DOC antiguos?",
      answer:
        "Por supuesto. Nuestra herramienta es totalmente compatible con el formato clásico .DOC (Word 97-2003) así como con el estándar moderno .DOCX.",
    },
    {
      question: "¿Cuánto tiempo se guarda mi archivo?",
      answer:
        "Solo el tiempo necesario para que lo descargues. Implementamos una política de seguridad estricta: todos los archivos se eliminan permanentemente de nuestros servidores 10 minutos después de la conversión.",
    },
    // Preguntas Generales
    {
      question: "¿El uso de esta herramienta es gratuito?",
      answer:
        "Sí, todas nuestras herramientas son 100% gratuitas y de uso ilimitado. No necesitas registrarte ni proporcionar datos de pago.",
    },
    {
      question: "¿Mis archivos están seguros?",
      answer:
        "Totalmente. Usamos conexiones encriptadas (SSL) y un sistema de borrado automático para que nadie más pueda acceder a tus documentos.",
    },
    {
      question: "¿Funciona en móviles?",
      answer:
        "Sí, la plataforma está optimizada para funcionar perfectamente en smartphones y tablets, permitiéndote convertir documentos sobre la marcha.",
    },
  ],

  cta: {
    title: "Convierte tus documentos en segundos",
    description: "Sin instalar programas, sin registros.",
    buttonLabel: "Elegir archivo Word",
  },

  jsonLd: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Convertir Word a PDF Online",
        applicationCategory: "ProductivityApplication",
        featureList: [
          "Conversión de DOC y DOCX a PDF",
          "Preservación de formato y diseño",
          "Procesamiento seguro en servidor",
          "Borrado automático tras 10 minutos",
          "Compatible con móviles y escritorio"
        ],
        applicationSubCategory: "Document Converter",
        fileFormat: ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/pdf"],
        operatingSystem: "Any",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          ratingCount: "3200",
        },
      },
      {
        "@type": "HowTo",
        name: "Cómo convertir Word a PDF",
        step: [
          {
            "@type": "HowToStep",
            name: "Sube el documento",
            text: "Carga tu archivo DOC o DOCX en la plataforma.",
          },
          {
            "@type": "HowToStep",
            name: "Procesa el archivo",
            text: "Nuestro servidor convertirá el documento manteniendo el formato.",
          },
          {
            "@type": "HowToStep",
            name: "Descarga",
            text: "Guarda el archivo PDF resultante en tu dispositivo.",
          },
        ],
      },
    ],
  },
};