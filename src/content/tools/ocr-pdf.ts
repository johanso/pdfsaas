import { ToolPageData } from "./types";

export const ocrPdfContent: ToolPageData = {
  id: "ocr-pdf",

  metadata: {
    title: "OCR PDF - Reconocimiento de Texto Online y PDF Buscable",
    description: "Convierte PDF escaneado a texto seleccionable (OCR). Haz tu PDF buscable gratis. Soporta español, inglés y alta resolución (600 DPI).",
    keywords: [
      "ocr pdf",
      "ocr online",
      "reconocimiento de texto pdf",
      "pdf buscable",
      "convertir pdf escaneado a texto",
      "hacer pdf searchable",
      "ocr pdf español",
      "copiar texto de pdf escaneado"
    ],
    canonical: "/ocr-pdf",
    ogImage: "/og-images/ocr-pdf.jpg",
  },

  titleSectionSteps: "Cómo hacer un PDF buscable (Searchable) con OCR",
  titleSectionBenefits: "¿Por qué usar nuestra herramienta de reconocimiento de texto?",
  titleSectionFAQ: "Preguntas Frecuentes sobre OCR y PDF escaneados",

  steps: [
    {
      number: "1",
      title: "Sube tu PDF escaneado",
      description:
        "Carga el documento. Nuestro sistema detectará automáticamente si el archivo es una imagen y necesita reconocimiento de texto.",
    },
    {
      number: "2",
      title: "Configura el idioma",
      description:
        "Selecciona el idioma del documento (ej: Español) para aumentar la precisión. Puedes elegir también la calidad (300 DPI recomendado).",
    },
    {
      number: "3",
      title: "Aplica el OCR",
      description:
        "Haz clic en 'Aplicar OCR'. Generaremos una capa de texto invisible sobre tu imagen para que puedas buscar, seleccionar y copiar el contenido.",
    },
  ],

  benefits: [
    {
      icon: "Search",
      title: "Hazlo Buscable (Searchable)",
      description:
        "La magia del OCR. Transformamos esa imagen estática en un documento vivo donde puedes usar 'Control + F' para encontrar cualquier palabra al instante.",
    },
    {
      icon: "Languages",
      title: "Soporte Multi-idioma",
      description:
        "Nuestro motor Tesseract está entrenado para reconocer Español, Inglés, Francés, Alemán y más. Incluso maneja tildes y caracteres especiales perfectamente.",
    },
    {
      icon: "ScanLine",
      title: "Detección Inteligente",
      description:
        "No pierdas tiempo. Nuestra herramienta analiza tu archivo y te avisa si realmente necesita OCR o si ya tiene texto, optimizando tu flujo de trabajo.",
    },
    {
      icon: "Settings2",
      title: "Calidad hasta 600 DPI",
      description:
        "¿Necesitas máxima precisión para documentos legales? Activa el modo 'Alta Calidad' (600 DPI) para reconocer hasta la letra más pequeña.",
    },
  ],

  faqs: [
    // Preguntas Específicas
    {
      question: "¿Qué es un PDF 'Searchable' o Buscable?",
      answer:
        "Un PDF escaneado es solo una foto. Un PDF 'Searchable' tiene una capa de texto oculta detrás de esa foto. Esto te permite seleccionar el texto, copiarlo y pegarlo en Word, o buscar palabras clave dentro del documento.",
    },
    {
      question: "¿Puedo procesar documentos con varios idiomas?",
      answer:
        "Sí. Puedes seleccionar el idioma principal del documento para ayudar al motor de reconocimiento. Funciona excelente con documentos en español, inglés y la mayoría de idiomas europeos.",
    },
    {
      question: "¿Qué resolución (DPI) debo elegir?",
      answer:
        "Para la mayoría de documentos, **300 DPI** es el equilibrio perfecto entre velocidad y precisión. Usa **600 DPI** solo si el documento original es muy antiguo, tiene letra muy pequeña o está borroso.",
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
        "Totalmente. Usamos conexiones encriptadas y tus documentos se eliminan de forma automática y permanente de nuestros servidores tras el procesamiento.",
    },
    {
      question: "¿Funciona en documentos escritos a mano?",
      answer:
        "El OCR funciona mejor en texto mecanografiado (impreso). El reconocimiento de texto manuscrito es experimental y puede no ser tan preciso dependiendo de la caligrafía.",
    },
  ],

  cta: {
    title: "Digitaliza tus documentos",
    description: "Haz que el texto de tus escaneos sea útil de nuevo.",
    buttonLabel: "Aplicar OCR ahora",
  },

  jsonLd: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "OCR PDF Online Gratis",
        applicationCategory: "ProductivityApplication",
        featureList: [
          "Reconocimiento de texto (OCR)",
          "Generación de PDF buscable (Searchable)",
          "Soporte multi-idioma (Español, Inglés, etc.)",
          "Opciones de alta resolución (600 DPI)",
          "Detección automática de escaneos"
        ],
        applicationSubCategory: "Text Recognition",
        fileFormat: ["application/pdf"],
        operatingSystem: "Any",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          ratingCount: "890",
        },
      },
      {
        "@type": "HowTo",
        name: "Cómo convertir PDF imagen a texto",
        step: [
          {
            "@type": "HowToStep",
            name: "Carga el PDF",
            text: "Sube el documento escaneado a la plataforma.",
          },
          {
            "@type": "HowToStep",
            name: "Selecciona idioma",
            text: "Elige el idioma del texto para mejorar la precisión.",
          },
          {
            "@type": "HowToStep",
            name: "Procesa y Descarga",
            text: "Aplica el OCR y descarga el PDF con capa de texto.",
          },
        ],
      },
    ],
  },
};