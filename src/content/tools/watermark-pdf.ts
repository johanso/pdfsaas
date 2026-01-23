import { ToolPageData } from "./types";

export const watermarkPdfContent: ToolPageData = {
  id: "add-watermark",

  metadata: {
    title: "Marca de Agua PDF - Poner Logo, Texto o Sello Online",
    description: "Añade marcas de agua a tus PDFs. Inserta texto (Confidencial, Borrador) o imágenes (Logos). Personaliza la posición, transparencia y rotación. Gratis y seguro.",
    keywords: [
      "marca de agua pdf",
      "poner logo en pdf",
      "watermark pdf online",
      "sello de agua pdf",
      "insertar texto en pdf",
      "proteger pdf con marca",
      "marca de agua confidencial",
      "add watermark pdf"
    ],
    canonical: "/marca-de-agua",
    ogImage: "/og-images/watermark-pdf.jpg",
  },

  titleSectionSteps: "Cómo insertar una marca de agua en PDF online",
  titleSectionBenefits: "¿Por qué marcar tus documentos con nuestra herramienta?",
  titleSectionFAQ: "Preguntas Frecuentes sobre marcas de agua",

  steps: [
    {
      number: "1",
      title: "Sube el archivo",
      description:
        "Carga el PDF que deseas proteger. Puedes visualizar todas las páginas para asegurarte de dónde quedará la marca.",
    },
    {
      number: "2",
      title: "Personaliza tu marca",
      description:
        "Elige entre Texto o Imagen. Escribe 'CONFIDENCIAL' o sube tu logo. Ajusta la transparencia, rotación y posición con un clic.",
    },
    {
      number: "3",
      title: "Aplica y Descarga",
      description:
        "Haz clic en 'Aplicar marca de agua'. El sello se fusionará con el documento y podrás descargar tu PDF protegido al instante.",
    },
  ],

  benefits: [
    {
      icon: "Stamp",
      title: "Texto e Imagen",
      description:
        "Versatilidad total. Escribe textos rápidos con fuentes profesionales o sube tu propio logotipo corporativo (PNG con transparencia soportado).",
    },
    {
      icon: "Move",
      title: "Control de Posición",
      description:
        "No te limites al centro. Coloca tu marca en las esquinas, rotada 45 grados o en una posición específica que no tape el texto importante.",
    },
    {
      icon: "EyeOff",
      title: "Transparencia Ajustable",
      description:
        "Define la opacidad perfecta para que tu marca de agua sea visible para proteger, pero lo suficientemente sutil para no dificultar la lectura.",
    },
    {
      icon: "Layers",
      title: "Selección de Páginas",
      description:
        "¿Solo quieres el sello en la primera página? ¿O en todas menos la portada? Tú decides en qué páginas se aplica la marca.",
    },
  ],

  faqs: [
    // Preguntas Específicas
    {
      question: "¿Puedo poner una imagen como marca de agua?",
      answer:
        "Sí. Puedes subir cualquier imagen en formato JPG o PNG. Recomendamos usar PNG con fondo transparente para que el resultado sea profesional y no tape el contenido del documento con un recuadro blanco.",
    },
    {
      question: "¿La marca de agua se puede borrar?",
      answer:
        "Nuestra herramienta fusiona la marca de agua con el contenido del PDF, haciéndola difícil de eliminar con editores básicos. Sin embargo, no es un método de seguridad infalible como la encriptación.",
    },
    {
      question: "¿Puedo aplicar la marca solo a algunas páginas?",
      answer:
        "Absolutamente. En las opciones de configuración, puedes especificar un rango de páginas (ej: 1-5) o seleccionar páginas individuales para aplicar el sello solo donde lo necesites.",
    },
    // Preguntas Generales
    {
      question: "¿El uso de esta herramienta es gratuito?",
      answer:
        "Sí, puedes añadir marcas de agua a todos tus documentos sin coste alguno y sin necesidad de registrarte.",
    },
    {
      question: "¿Mis archivos son privados?",
      answer:
        "Sí. El procesamiento de marcas de agua simples se realiza directamente en tu navegador (modo cliente), por lo que tus archivos no necesitan salir de tu dispositivo para ser marcados.",
    },
    {
      question: "¿Funciona en móviles?",
      answer:
        "Sí, nuestra interfaz es totalmente compatible con pantallas táctiles, permitiéndote marcar documentos desde tu teléfono o tablet.",
    },
  ],

  cta: {
    title: "Protege tu autoría",
    description: "Añade tu sello personal a tus documentos en segundos.",
    buttonLabel: "Poner Marca de Agua",
  },

  jsonLd: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Marca de Agua PDF Online",
        applicationCategory: "ProductivityApplication",
        featureList: [
          "Marca de agua de texto personalizable",
          "Marca de agua de imagen (Logo)",
          "Control de opacidad y rotación",
          "Posicionamiento en esquinas o centro",
          "Procesamiento local seguro"
        ],
        applicationSubCategory: "Document Watermarking",
        fileFormat: ["application/pdf", "image/png", "image/jpeg"],
        operatingSystem: "Any",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          ratingCount: "1150",
        },
      },
      {
        "@type": "HowTo",
        name: "Cómo poner marca de agua en PDF",
        step: [
          {
            "@type": "HowToStep",
            name: "Sube el PDF",
            text: "Carga el documento que quieres marcar.",
          },
          {
            "@type": "HowToStep",
            name: "Configura la marca",
            text: "Escribe el texto o sube tu logo y ajusta la opacidad.",
          },
          {
            "@type": "HowToStep",
            name: "Aplica y Guarda",
            text: "Inserta la marca y descarga el nuevo archivo PDF.",
          },
        ],
      },
    ],
  },
};