import { ToolPageData } from "./types";

export const compressPdfContent: ToolPageData = {
  id: "compress-pdf",

  metadata: {
    title: "Comprimir PDF - Reducir Tamaño de Archivo PDF Gratis Online",
    description: "Reduce el peso de tus PDFs sin perder calidad. Herramienta online gratuita con 3 niveles de compresión y ajustes avanzados de DPI. Rápido y seguro.",
    keywords: [
      "comprimir pdf",
      "reducir tamaño pdf",
      "bajar peso pdf",
      "optimizar pdf",
      "achicar pdf",
      "compress pdf online",
      "reducir pdf para correo",
      "compresor pdf gratis"
    ],
    canonical: "/comprimir-pdf",
    ogImage: "/og-images/compress-pdf.jpg",
  },

  titleSectionSteps: "Cómo reducir el peso de un PDF sin perder calidad",
  titleSectionBenefits: "¿Por qué nuestro optimizador de PDF es diferente?",
  titleSectionFAQ: "Preguntas Frecuentes sobre compresión de documentos",

  steps: [
    {
      number: "1",
      title: "Sube tu archivo pesado",
      description:
        "Arrastra tu documento PDF. Nuestro sistema utiliza compresión previa (Gzip) para que la subida sea ultrarrápida.",
    },
    {
      number: "2",
      title: "Elige el nivel de compresión",
      description:
        "Selecciona 'Recomendada' para el mejor balance, 'Extrema' para máximo ahorro o usa el 'Modo Avanzado' para ajustar DPI y calidad manualmente.",
    },
    {
      number: "3",
      title: "Comprime y Descarga",
      description:
        "Haz clic en 'Comprimir'. En segundos verás cuánto espacio has ahorrado (ej: -70%) y podrás descargar tu archivo optimizado.",
    },
  ],

  benefits: [
    {
      icon: "Settings2",
      title: "Control Avanzado Real",
      description:
        "A diferencia de otros, te damos el control. Si eres experto, despliega las 'Opciones avanzadas' para ajustar los DPI y la calidad de imagen al milímetro.",
    },
    {
      icon: "Zap",
      title: "3 Presets Inteligentes",
      description:
        "¿Prisa? Usa nuestros modos predefinidos: 'Baja compresión' (Alta calidad), 'Recomendada' (Estándar) o 'Extrema' (Para enviar por email).",
    },
    {
      icon: "Cpu",
      title: "Motor Inteligente",
      description:
        "Utilizamos la tecnología de procesamiento Ghostscript, garantizando una reducción de tamaño agresiva sin romper la estructura del documento.",
    },
    {
      icon: "BarChart3",
      title: "Informe de Ahorro",
      description:
        "Transparencia total. Al finalizar, te diremos exactamente cuánto peso le hemos quitado a tu archivo en megabytes y porcentaje.",
    },
  ],

  faqs: [
    // Preguntas Específicas
    {
      question: "¿Cuánto puedo reducir el tamaño de mi PDF?",
      answer:
        "Depende del contenido. Los archivos con muchas imágenes pueden reducirse hasta un 80-90% usando el modo 'Extremo'. Los documentos de solo texto suelen comprimirse menos.",
    },
    {
      question: "¿Perderé calidad al comprimir?",
      answer:
        "Si eliges el modo 'Recomendada' o 'Baja Compresión', la pérdida visual es casi imperceptible. El modo 'Extremo' reduce la resolución de las imágenes (DPI), lo cual puede notarse al imprimir pero es perfecto para pantallas.",
    },
    {
      question: "¿Qué es el DPI y cómo afecta el peso?",
      answer:
        "DPI (Puntos Por Pulgada) define la nitidez. Bajar de 300 DPI a 144 DPI o 72 DPI reduce drásticamente el peso del archivo, ideal para compartir por web o WhatsApp.",
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
        "Totalmente. Usamos conexiones encriptadas (SSL) y un sistema de borrado automático que elimina los archivos a los 10 minutos de ser procesados.",
    },
    {
      question: "¿Funciona en móviles?",
      answer:
        "Sí, nuestra plataforma web está optimizada para comprimir archivos directamente desde tu iPhone o Android sin instalar apps.",
    },
  ],

  cta: {
    title: "¿Tu PDF es demasiado grande?",
    description: "Hazlo más ligero en segundos para poder enviarlo.",
    buttonLabel: "Comprimir PDF ahora",
  },

  jsonLd: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Comprimir PDF Online",
        applicationCategory: "ProductivityApplication",
        featureList: [
          "Compresión con Ghostscript",
          "Ajuste manual de DPI y Calidad",
          "3 Presets de optimización",
          "Informe de reducción de tamaño",
          "Procesamiento seguro"
        ],
        applicationSubCategory: "File Compressor",
        fileFormat: ["application/pdf"],
        operatingSystem: "Any",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          ratingCount: "4100",
        },
      },
      {
        "@type": "HowTo",
        name: "Cómo reducir tamaño PDF",
        step: [
          {
            "@type": "HowToStep",
            name: "Sube el PDF",
            text: "Carga tu archivo pesado en la plataforma.",
          },
          {
            "@type": "HowToStep",
            name: "Selecciona nivel",
            text: "Elige entre compresión recomendada, extrema o personalizada.",
          },
          {
            "@type": "HowToStep",
            name: "Descarga",
            text: "Obtén el archivo optimizado con menor peso.",
          },
        ],
      },
    ],
  },
};