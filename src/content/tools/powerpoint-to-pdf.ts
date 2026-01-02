import { ToolPageData } from "./types";

export const powerpointToPdfContent: ToolPageData = {
  id: "powerpoint-to-pdf",

  metadata: {
    title: "PowerPoint a PDF - Convertir PPT y PPTX a PDF Gratis",
    description: "Convierte tus presentaciones PowerPoint a PDF online. Mantén el diseño de tus diapositivas intacto. Compatible con PPT y PPTX. Sin instalación.",
    keywords: [
      "powerpoint a pdf",
      "convertir ppt a pdf",
      "pptx a pdf",
      "guardar powerpoint como pdf",
      "convertir diapositivas a pdf",
      "presentacion a pdf",
      "ppt to pdf"
    ],
    canonical: "/powerpoint-a-pdf",
    ogImage: "/og-images/ppt-to-pdf.jpg",
  },

  titleSectionSteps: "Cómo guardar un PowerPoint como PDF fácilmente",
  titleSectionBenefits: "¿Por qué pasar tus presentaciones a formato PDF?",
  titleSectionFAQ: "Preguntas Frecuentes sobre PPT y PDF",

  steps: [
    {
      number: "1",
      title: "Sube tu presentación",
      description:
        "Arrastra tu archivo .PPTX o .PPT. Procesamos archivos de cualquier versión de Microsoft PowerPoint.",
    },
    {
      number: "2",
      title: "Conversión Fiel",
      description:
        "Nuestro sistema congela tus diapositivas, asegurando que las fuentes y gráficos se vean exactamente como los diseñaste.",
    },
    {
      number: "3",
      title: "Descarga y Comparte",
      description:
        "Obtén un archivo PDF ligero y universal, ideal para enviar por correo, subir a la web o imprimir como folleto.",
    },
  ],

  benefits: [
    {
      icon: "Presentation",
      title: "Diseño Inalterable",
      description:
        "Al convertir a PDF, 'congelas' el diseño. Evita el temido problema de que las imágenes se muevan o las fuentes cambien al abrir la presentación en otro ordenador.",
    },
    {
      icon: "Files",
      title: "PPT y PPTX",
      description:
        "No importa si tu presentación es de 2003 (.ppt) o de la última versión (.pptx). Soportamos todos los formatos de diapositivas estándar.",
    },
    {
      icon: "Share2",
      title: "Fácil de Compartir",
      description:
        "Los archivos PDF suelen pesar menos que un PowerPoint lleno de medios y se pueden abrir en cualquier móvil o navegador sin necesitar Office.",
    },
    {
      icon: "Printer",
      title: "Listo para Imprimir",
      description:
        "El formato PDF es el estándar para impresión. Convierte tus diapositivas para asegurar que salgan en papel con la máxima calidad y márgenes correctos.",
    },
  ],

  faqs: [
    // Preguntas Específicas
    {
      question: "¿Se mantienen las animaciones y transiciones?",
      answer:
        "No. El formato PDF es un documento estático, no un video. Al convertir, obtendrás una página por cada diapositiva final, pero los efectos de movimiento y sonido no se reproducirán.",
    },
    {
      question: "¿Se conservan las notas del orador?",
      answer:
        "Por defecto, la conversión genera un PDF visual de las diapositivas tal como se verían en pantalla completa (modo presentación), sin incluir las notas ocultas del orador.",
    },
    {
      question: "¿Puedo convertir presentaciones antiguas (.ppt)?",
      answer:
        "Sí, nuestro convertidor es totalmente compatible con el formato clásico de PowerPoint 97-2003 (.ppt) y el formato moderno XML (.pptx).",
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
        "Sí. Si recibes una presentación en tu móvil y no tienes la app de PowerPoint, puedes usar nuestra web para convertirla a PDF y leerla cómodamente.",
    },
  ],

  cta: {
    title: "Haz tus diapositivas universales",
    description: "Convierte tu presentación en un documento PDF ahora.",
    buttonLabel: "Elegir archivo PowerPoint",
  },

  jsonLd: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Convertir PowerPoint a PDF Online",
        applicationCategory: "ProductivityApplication",
        featureList: [
          "Conversión de PPTX y PPT a PDF",
          "Preservación de diseño de diapositivas",
          "Compatible con móviles y tablets",
          "Conversión rápida sin software",
          "Seguridad con borrado automático"
        ],
        applicationSubCategory: "Presentation Converter",
        fileFormat: ["application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/pdf"],
        operatingSystem: "Any",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          ratingCount: "1450",
        },
      },
      {
        "@type": "HowTo",
        name: "Cómo convertir PPT a PDF",
        step: [
          {
            "@type": "HowToStep",
            name: "Sube la presentación",
            text: "Carga tu archivo .pptx o .ppt en la plataforma.",
          },
          {
            "@type": "HowToStep",
            name: "Procesamiento",
            text: "El sistema convierte cada diapositiva en una página del PDF.",
          },
          {
            "@type": "HowToStep",
            name: "Descarga",
            text: "Guarda el documento PDF resultante.",
          },
        ],
      },
    ],
  },
};