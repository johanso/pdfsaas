import { ToolPageData } from "./types";

export const ocrPdfContent: ToolPageData = {
  id: "ocr-pdf",

  metadata: {
    title: "OCR PDF - Convertir PDF Escaneado a Texto Seleccionable",
    description: "Aplica OCR a tus PDFs escaneados para hacerlos seleccionables y buscables. Soporta múltiples idiomas incluyendo español e inglés. Gratis y seguro.",
    keywords: [
      "ocr pdf",
      "pdf escaneado a texto",
      "reconocimiento optico de caracteres",
      "convertir pdf escaneado",
      "pdf a texto seleccionable",
      "extraer texto de pdf",
      "ocr español",
      "ocr multilenguaje"
    ],
    canonical: "/ocr-pdf",
    ogImage: "/og-images/ocr-pdf.jpg",
  },

  titleSectionSteps: "Cómo aplicar OCR a un PDF escaneado",
  titleSectionBenefits: "¿Por qué nuestra herramienta de OCR es la mejor?",
  titleSectionFAQ: "Preguntas Frecuentes sobre OCR PDF",

  steps: [
    {
      number: "1",
      title: "Sube el PDF escaneado",
      description:
        "Arrastra tu archivo PDF escaneado. El sistema detectará automáticamente si necesita OCR y te mostrará un badge indicando su estado.",
    },
    {
      number: "2",
      title: "Configura idiomas y calidad",
      description:
        "Selecciona los idiomas del documento (puedes elegir varios). Elige la calidad de procesamiento: 150 DPI para velocidad, 300 DPI estándar, o 600 DPI para máxima precisión.",
    },
    {
      number: "3",
      title: "Procesa y descarga",
      description:
        "Haz clic en procesar y espera a que se complete el OCR. Descargarás el mismo PDF pero con texto seleccionable y buscable.",
    },
  ],

  benefits: [
    {
      icon: "Languages",
      title: "Soporte Multilenguaje",
      description:
        "Detecta texto en más de 50 idiomas simultáneamente. Perfecto para documentos en español, inglés, portugués, francés y muchos más.",
    },
    {
      icon: "ScanText",
      title: "Detección Automática",
      description:
        "El sistema analiza tu PDF y te indica si necesita OCR o si ya tiene texto seleccionable, ahorrándote tiempo de procesamiento innecesario.",
    },
    {
      icon: "Settings2",
      title: "3 Calidades de Procesamiento",
      description:
        "Elige entre 150 DPI (rápido), 300 DPI (estándar) o 600 DPI (alta calidad) según tus necesidades de precisión y tiempo de procesamiento.",
    },
    {
      icon: "Search",
      title: "Texto Buscable",
      description:
        "El PDF resultante tiene texto seleccionable y buscable. Puedes copiar, pegar y buscar dentro del documento como cualquier PDF digital.",
    },
  ],

  faqs: [
    {
      question: "¿Qué es OCR y para qué sirve?",
      answer:
        "OCR significa 'Reconocimiento Óptico de Caracteres'. Convierte imágenes de texto (como en PDFs escaneados) en texto digital seleccionable y editable.",
    },
    {
      question: "¿Cómo sé si mi PDF necesita OCR?",
      answer:
        "Nuestra herramienta detecta automáticamente esto. Si ves un badge 'Escaneado' en rojo, tu PDF necesita OCR. Si ves 'Ya tiene texto' en verde, ya tiene texto digital.",
    },
    {
      question: "¿Puedo seleccionar múltiples idiomas?",
      answer:
        "Sí, puedes seleccionar varios idiomas simultáneamente. Esto es ideal para documentos bilingües o que contienen texto en diferentes idiomas.",
    },
    {
      question: "¿Qué calidad de DPI debo usar?",
      answer:
        "Usa **150 DPI** para documentos claros y procesamiento rápido. **300 DPI** es estándar y funciona para la mayoría de casos. **600 DPI** es para documentos con texto pequeño o baja calidad de escaneo.",
    },
    {
      question: "¿El procesamiento es gratuito?",
      answer:
        "Sí, todas nuestras herramientas son 100% gratuitas y de uso ilimitado. No necesitas registrarte ni proporcionar datos de pago.",
    },
    {
      question: "¿Mis archivos están seguros?",
      answer:
        "Totalmente. Los archivos se procesan en nuestros servidores seguros y se eliminan automáticamente después de la conversión. No almacenamos tus documentos.",
    },
    {
      question: "¿Puedo buscar texto en el PDF resultante?",
      answer:
        "Sí, después de aplicar OCR, el PDF tendrá texto seleccionable y podrás buscar, copiar y pegar texto como cualquier PDF digital nativo.",
    },
  ],

  cta: {
    title: "Convierte tus PDFs escaneados",
    description: "Haz que tus documentos sean seleccionables y buscables.",
    buttonLabel: "Aplicar OCR",
  },

  jsonLd: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "OCR PDF Online - Reconocimiento Óptico de Caracteres",
        applicationCategory: "ProductivityApplication",
        featureList: [
          "Detección automática de necesidad de OCR",
          "Soporte multilenguaje (50+ idiomas)",
          "3 calidades de procesamiento (150, 300, 600 DPI)",
          "Texto seleccionable y buscable",
          "Procesamiento en la nube seguro"
        ],
        applicationSubCategory: "OCR Tool",
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
          ratingCount: "2100",
        },
      },
      {
        "@type": "HowTo",
        name: "Cómo aplicar OCR a un PDF escaneado",
        step: [
          {
            "@type": "HowToStep",
            name: "Sube el PDF",
            text: "Carga tu archivo PDF escaneado en la herramienta.",
          },
          {
            "@type": "HowToStep",
            name: "Configura idiomas",
            text: "Selecciona los idiomas del documento y la calidad deseada.",
          },
          {
            "@type": "HowToStep",
            name: "Aplica OCR",
            text: "Procesa el documento y descarga el PDF con texto seleccionable.",
          },
        ],
      },
    ],
  },
};
