import { ToolPageData } from "./types";

export const pdfToImageContent: ToolPageData = {
  id: "pdf-to-image",

  metadata: {
    title: "PDF a Imagen - Convertir PDF a JPG, PNG y TIFF (Alta Calidad)",
    description: "Convierte páginas PDF a imágenes JPG, PNG, WebP o TIFF. Ajusta la calidad y los DPI (hasta 600 DPI). Extrae fotos de tus documentos gratis y seguro.",
    keywords: [
      "pdf a imagen",
      "pdf a jpg",
      "pdf a png",
      "convertir pdf a foto",
      "extraer imagenes de pdf",
      "pdf a tiff alta calidad",
      "pdf a webp",
      "convertir pdf a imagen alta resolucion"
    ],
    canonical: "/pdf-a-imagen",
    ogImage: "/og-images/pdf-to-image.jpg",
  },

  titleSectionSteps: "Cómo pasar un PDF a foto con alta resolución",
  titleSectionBenefits: "¿Por qué nuestro conversor de PDF a JPG es el mejor?",
  titleSectionFAQ: "Preguntas Frecuentes sobre extraer imágenes de PDF",

  steps: [
    {
      number: "1",
      title: "Sube el documento PDF",
      description:
        "Arrastra tu archivo. Visualizarás cada página como una miniatura individual lista para convertir.",
    },
    {
      number: "2",
      title: "Elige formato y calidad",
      description:
        "Selecciona el formato (JPG, PNG, WebP, TIFF) y la resolución (DPI). Usa 300 DPI si planeas imprimir las imágenes.",
    },
    {
      number: "3",
      title: "Descarga las imágenes",
      description:
        "Descarga una sola imagen o, si convertiste múltiples páginas, bájate un archivo ZIP con todas las fotos organizadas.",
    },
  ],

  benefits: [
    {
      icon: "Image",
      title: "5 Formatos Soportados",
      description:
        "Más allá de lo básico. Convertimos a JPG y PNG, pero también al moderno WebP para web, y a TIFF o BMP para usos profesionales.",
    },
    {
      icon: "Settings",
      title: "Control de DPI (Alta Resolución)",
      description:
        "No te conformes con imágenes borrosas. Elige 300 DPI o incluso 600 DPI para obtener imágenes ultra nítidas aptas para impresión profesional.",
    },
    {
      icon: "Layers",
      title: "Selección de Páginas",
      description:
        "No necesitas convertir todo el documento. Selecciona solo las páginas específicas que quieres volver imagen y ahorra tiempo.",
    },
    {
      icon: "Zap",
      title: "Procesamiento Inteligente",
      description:
        "Para conversiones rápidas en JPG/PNG, usamos tu navegador para máxima privacidad. Para TIFF o alta calidad, usamos nuestros potentes servidores.",
    },
  ],

  faqs: [
    // Preguntas Específicas
    {
      question: "¿Qué formato debo elegir: JPG o PNG?",
      answer:
        "Elige **JPG** si son documentos con fotos y quieres archivos ligeros. Elige **PNG** si el PDF tiene texto y gráficos vectoriales, ya que mantiene los bordes más nítidos y sin ruido de compresión.",
    },
    {
      question: "¿Qué significa DPI y cuál debo usar?",
      answer:
        "DPI son 'Puntos Por Pulgada'. Usa **72 DPI** para ver en pantallas o web. Usa **150 DPI** para buena calidad general. Usa **300 DPI** si necesitas imprimir la imagen o hacer zoom sin que se pixele.",
    },
    {
      question: "¿Cómo descargo todas las páginas a la vez?",
      answer:
        "Si seleccionas múltiples páginas (o todas), nuestra herramienta generará automáticamente un archivo comprimido .ZIP que contiene todas las imágenes numeradas en orden.",
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
        "Totalmente. En el modo local (JPG/PNG estándar), el archivo no sale de tu PC. En el modo servidor (TIFF/Alta calidad), se borra automáticamente tras la conversión.",
    },
    {
      question: "¿Funciona en móviles?",
      answer:
        "Sí, puedes convertir PDFs a imágenes directamente desde tu galería de archivos en Android o iOS.",
    },
  ],

  cta: {
    title: "Extrae imágenes de tu PDF",
    description: "Obtén fotos nítidas de tus documentos ahora.",
    buttonLabel: "Convertir a Imagen",
  },

  jsonLd: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Convertir PDF a Imagen Online",
        applicationCategory: "ProductivityApplication",
        featureList: [
          "Conversión a JPG, PNG, WebP, TIFF y BMP",
          "Soporte de alta resolución (hasta 600 DPI)",
          "Extracción selectiva de páginas",
          "Descarga en lote (ZIP)",
          "Opciones de compresión personalizables"
        ],
        applicationSubCategory: "Image Converter",
        fileFormat: ["application/pdf", "image/jpeg", "image/png", "image/tiff"],
        operatingSystem: "Any",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          ratingCount: "1650",
        },
      },
      {
        "@type": "HowTo",
        name: "Cómo convertir PDF a JPG alta calidad",
        step: [
          {
            "@type": "HowToStep",
            name: "Carga el PDF",
            text: "Sube tu archivo para ver las páginas.",
          },
          {
            "@type": "HowToStep",
            name: "Configura la salida",
            text: "Selecciona el formato (ej: JPG) y la calidad (ej: 300 DPI).",
          },
          {
            "@type": "HowToStep",
            name: "Convierte",
            text: "Descarga las imágenes resultantes en tu dispositivo.",
          },
        ],
      },
    ],
  },
};