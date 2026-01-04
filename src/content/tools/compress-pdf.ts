import { ToolPageData } from "./types";

export const compressPdfContent: ToolPageData = {
  id: "compress-pdf",

  metadata: {
    title: "Comprimir PDF - Reducir tamaño de archivos PDF online gratis",
    description:
      "Comprime archivos PDF online y reduce su tamaño manteniendo la mejor calidad posible. Elige entre compresión extrema, recomendada o baja. Gratis y seguro.",
    keywords: [
      "comprimir pdf",
      "reducir tamaño pdf",
      "optimizar pdf",
      "hacer pdf mas pequeño",
      "comprimir pdf online gratis",
      "bajar peso a pdf",
      "comprimir pdf sin perder calidad",
    ],
    canonical: "/comprimir-pdf",
    ogImage: "/og-images/compress-pdf.jpg",
  },

  titleSectionSteps: "Cómo comprimir archivos PDF online",
  titleSectionBenefits:
    "¿Por qué usar nuestra herramienta de compresión de PDF?",
  titleSectionFAQ: "Preguntas Frecuentes sobre comprimir PDF",

  steps: [
    {
      number: "1",
      title: "Selecciona el archivo PDF",
      description:
        "Sube el documento PDF que deseas comprimir desde tu dispositivo o arrástralo directamente.",
    },
    {
      number: "2",
      title: "Elige el nivel de compresión",
      description:
        "Selecciona entre compresión extrema, recomendada o baja. También puedes usar el modo avanzado para ajustes personalizados.",
    },
    {
      number: "3",
      title: "Descarga tu PDF optimizado",
      description:
        "Haz clic en 'Comprimir' y en unos segundos podrás descargar tu archivo con un tamaño mucho menor.",
    },
  ],

  benefits: [
    {
      icon: "Zap",
      title: "Máxima Compresión",
      description:
        "Nuestra tecnología avanzada permite reducir drásticamente el peso de tus archivos PDF sin comprometer la legibilidad.",
    },
    {
      icon: "Shield",
      title: "100% Seguro",
      description:
        "Tus archivos se procesan de forma segura y se eliminan automáticamente de nuestros servidores después del proceso.",
    },
    {
      icon: "Settings",
      title: "Control Total",
      description:
        "Usa los modos preestablecidos para un proceso rápido o ajusta los DPI y la calidad de imagen manualmente.",
    },
    {
      icon: "Layout",
      title: "Vista Previa",
      description:
        "Visualiza tu documento antes de comprimirlo para asegurarte de que es el archivo correcto.",
    },
  ],

  faqs: [
    {
      question: "¿Se pierde mucha calidad al comprimir?",
      answer:
        "Nuestra **Compresión Recomendada** ofrece el mejor balance entre ahorro de espacio y calidad visual. La **Compresión Extrema** reduce más el tamaño pero puede afectar la nitidez de las imágenes.",
    },
    {
      question: "¿Cuánto puedo reducir el tamaño de mi PDF?",
      answer:
        "Depende del contenido original. PDFs con muchas imágenes de alta resolución pueden reducirse hasta un 80% o 90%. Documentos solo de texto tienen una reducción menor.",
    },
    {
      question: "¿Es gratis comprimir archivos PDF?",
      answer:
        "Sí, puedes comprimir todos los archivos que necesites de forma totalmente gratuita y sin necesidad de registro.",
    },
    {
      question: "¿Qué archivos puedo comprimir?",
      answer:
        "Cualquier archivo en formato PDF estándar. Si tu archivo está protegido con contraseña, primero deberás desbloquearlo.",
    },
  ],

  cta: {
    title: "Reduce el peso de tus PDF ahora",
    description: "Consigue archivos más ligeros y fáciles de compartir.",
    buttonLabel: "Comprimir PDF",
  },

  jsonLd: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Comprimir PDF Online",
        applicationCategory: "ProductivityApplication",
        featureList: [
          "Diferentes niveles de compresión",
          "Modo avanzado personalizable",
          "Ahorro de hasta un 90% de espacio",
          "Seguridad y privacidad garantizada",
          "Totalmente gratuito",
        ],
        applicationSubCategory: "PDF Tool",
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
    ],
  },
};
