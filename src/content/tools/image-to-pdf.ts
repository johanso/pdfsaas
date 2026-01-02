import { ToolPageData } from "./types";

export const imageToPdfContent: ToolPageData = {
  id: "images-to-pdf",

  metadata: {
    title: "Convertir Imagen a PDF - JPG a PDF Rápido y Privado",
    description: "Convierte JPG, PNG, WEBP y fotos a PDF. Elige tamaño de hoja (A4, Carta), márgenes y orientación. Procesamiento local seguro y soporte para lotes grandes.",
    keywords: [
      "convertir imagen a pdf",
      "jpg a pdf",
      "png a pdf",
      "fotos a pdf",
      "convertir fotos a documento",
      "unir imagenes en pdf",
      "jpeg a pdf online",
      "convertir wepb a pdf"
    ],
    canonical: "/imagen-a-pdf",
    ogImage: "/og-images/image-to-pdf.jpg",
  },

  titleSectionSteps: "Cómo pasar fotos a PDF y ajustar el diseño",
  titleSectionBenefits: "¿Por qué nuestro conversor de imágenes es superior?",
  titleSectionFAQ: "Preguntas Frecuentes sobre convertir imágenes a PDF",

  steps: [
    {
      number: "1",
      title: "Sube tus fotos",
      description:
        "Arrastra tus imágenes (JPG, PNG, GIF, BMP, WEBP). Aceptamos lotes pequeños para procesamiento instantáneo o masivos de hasta 200 fotos.",
    },
    {
      number: "2",
      title: "Personaliza el documento",
      description:
        "Elige el tamaño de hoja (A4, Carta, Legal), ajusta la orientación, define los márgenes y selecciona la calidad de compresión.",
    },
    {
      number: "3",
      title: "Genera el PDF",
      description:
        "Haz clic en 'Crear PDF'. Si son pocas imágenes, se procesarán en tu dispositivo al instante sin subir nada a internet.",
    },
  ],

  benefits: [
    {
      icon: "Zap",
      title: "Tecnología Híbrida Inteligente",
      description:
        "Para trabajos normales (menos de 50 fotos), la conversión se hace 100% en tu navegador. Es instantáneo y tus fotos nunca salen de tu dispositivo.",
    },
    {
      icon: "Settings2",
      title: "Control Total de Diseño",
      description:
        "No solo une fotos. Te dejamos elegir si quieres hojas A4 o Carta, márgenes limpios o fotos a página completa ('Ajustar').",
    },
    {
      icon: "Image",
      title: "Soporte Multiformato",
      description:
        "No nos limitamos a JPG. Convertimos PNG, WEBP, GIF e incluso BMP. Mezcla diferentes formatos en un solo documento PDF.",
    },
    {
      icon: "Maximize",
      title: "Compresión a Medida",
      description:
        "¿Necesitas enviar el PDF por correo? Usa nuestra opción de 'Calidad Comprimida' para reducir el peso del archivo final automáticamente.",
    },
  ],

  faqs: [
    {
      question: "¿Mis fotos se suben a internet?",
      answer:
        "Depende de la cantidad. Si conviertes menos de 50 imágenes, nuestro sistema usa 'Procesamiento Local', lo que significa que las fotos NO salen de tu ordenador. Si subes más, usamos servidores seguros que eliminan los archivos tras procesarlos.",
    },
    {
      question: "¿Qué formatos de imagen aceptan?",
      answer:
        "Soportamos la mayoría de formatos web y de fotografía: JPG, JPEG, PNG, WEBP, GIF y BMP. Puedes mezclar distintos formatos en un mismo PDF.",
    },
    {
      question: "¿Puedo poner varias fotos en tamaño A4?",
      answer:
        "Sí. En el panel lateral selecciona 'Tamaño de página: A4'. El sistema ajustará automáticamente tus imágenes para que encajen perfectamente en hojas A4, respetando los márgenes que elijas.",
    },
    {
      question: "¿Cómo cambio el orden de las fotos?",
      answer:
        "Es muy fácil. Antes de crear el PDF, simplemente arrastra y suelta las miniaturas de las imágenes para ordenarlas como quieras.",
    },
    {
      question: "¿El uso de esta herramienta es gratuito?",
      answer:
        "Sí, todas nuestras herramientas son 100% gratuitas y de uso ilimitado. No necesitas registrarte ni proporcionar datos de pago.",
    },
    {
      question: "¿Mis archivos están seguros?",
      answer:
        "Totalmente. En el modo local, los archivos no salen de tu PC. En el modo servidor (para lotes grandes), ejecutamos una limpieza automática inmediata.",
    },
  ],

  cta: {
    title: "Convierte tus recuerdos en documentos",
    description: "La forma más rápida de pasar fotos a PDF.",
    buttonLabel: "Convertir imágenes ahora",
  },

  jsonLd: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Convertir Imagen a PDF Online",
        applicationCategory: "ProductivityApplication",
        featureList: [
          "Conversión local de alta velocidad (Client-side)",
          "Soporte para A4, Carta y Legal",
          "Ajuste de márgenes y orientación automática",
          "Compresión de imágenes integrada",
          "Soporte masivo de hasta 200 imágenes"
        ],
        applicationSubCategory: "Image Converter",
        fileFormat: ["image/jpeg", "image/png", "application/pdf"],
        operatingSystem: "Any",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          ratingCount: "2150",
        },
      },
      {
        "@type": "HowTo",
        name: "Cómo convertir JPG a PDF",
        step: [
          {
            "@type": "HowToStep",
            name: "Selecciona las imágenes",
            text: "Carga tus fotos JPG, PNG o WEBP en la herramienta.",
          },
          {
            "@type": "HowToStep",
            name: "Ajusta el formato",
            text: "Elige el tamaño de papel (ej: A4) y los márgenes deseados.",
          },
          {
            "@type": "HowToStep",
            name: "Descarga el PDF",
            text: "Presiona 'Crear PDF' para combinar todas las fotos en un solo documento.",
          },
        ],
      },
    ],
  },
};