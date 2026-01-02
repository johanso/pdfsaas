import { ToolPageData } from "./types";

export const rotatePdfContent: ToolPageData = {
  id: "rotate-pdf",

  metadata: {
    title: "Rotar PDF Permanente - Girar Hojas y Guardar Gratis",
    description: "Endereza documentos PDF escaneados. Rota páginas individuales o todo el archivo a la izquierda o derecha y guarda los cambios permanentemente.",
    keywords: [
      "rotar pdf",
      "girar pdf",
      "voltear pdf",
      "cambiar orientacion pdf",
      "rotate pdf online",
      "rotar pdf y guardar",
      "enderezar pdf escaneado"
    ],
    canonical: "/rotar-pdf",
    ogImage: "/og-images/rotate-pdf.jpg",
  },

  titleSectionSteps: "Cómo girar un PDF y guardar la orientación",
  titleSectionBenefits: "¿Por qué usar nuestra herramienta para voltear PDF?",
  titleSectionFAQ: "Preguntas Frecuentes sobre rotación de documentos",

  steps: [
    {
      number: "1",
      title: "Sube tu archivo PDF",
      description:
        "Arrastra tu documento. Generaremos miniaturas de cada página para que identifiques cuáles están mal orientadas.",
    },
    {
      number: "2",
      title: "Gira las páginas",
      description:
        "Usa los botones para rotar páginas sueltas o gira todo el documento a la vez (90°, 180° o 270°).",
    },
    {
      number: "3",
      title: "Aplica y Descarga",
      description:
        "Haz clic en 'Aplicar Giro'. Procesaremos el archivo para que la nueva orientación quede guardada permanentemente.",
    },
  ],

  benefits: [
    {
      icon: "RefreshCw",
      title: "Control Granular",
      description:
        "A diferencia de otros editores, aquí puedes rotar la página 1 a la derecha y la página 5 a la izquierda. Tú tienes el control total de cada hoja.",
    },
    {
      icon: "FileScan",
      title: "Ideal para Escaneos",
      description:
        "¿Escaneaste un contrato y salió al revés? No necesitas volver a escanearlo. Súbelo, gíralo y guárdalo en segundos.",
    },
    {
      icon: "Save",
      title: "Cambios Permanentes",
      description:
        "Lo que rotas aquí, se queda así. Descarga un archivo nuevo con la orientación corregida compatible con cualquier visor de PDF.",
    },
    {
      icon: "Trash2",
      title: "Limpieza Rápida",
      description:
        "¿Viste una página en blanco o duplicada mientras rotabas? Puedes eliminarla directamente desde esta misma pantalla.",
    },
  ],

  faqs: [
    // Preguntas Específicas
    {
      question: "¿Puedo rotar solo una página específica?",
      answer:
        "Sí. Pasa el cursor sobre la página que deseas corregir y utiliza los botones de giro que aparecen en la tarjeta. Las demás páginas permanecerán intactas.",
    },
    {
      question: "¿El cambio de orientación es permanente?",
      answer:
        "Absolutamente. A diferencia de rotar la vista en un lector de PDF (que solo es temporal), nuestra herramienta crea un nuevo archivo donde las páginas están rotadas internamente para siempre.",
    },
    {
      question: "¿Puedo girar todo el documento a la vez?",
      answer:
        "Sí. Utiliza los botones generales 'Rotar todo a la derecha' o 'Izquierda' en la barra lateral para corregir la orientación de todas las páginas con un solo clic.",
    },
    // Preguntas Generales (Transversales)
    {
      question: "¿El uso de esta herramienta es gratuito?",
      answer:
        "Sí, todas nuestras herramientas son 100% gratuitas y de uso ilimitado. No necesitas registrarte ni proporcionar datos de pago para procesar tus documentos.",
    },
    {
      question: "¿Mis archivos están seguros en esta plataforma?",
      answer:
        "La seguridad es nuestra máxima prioridad. Todos los archivos que subes se procesan de forma segura y se eliminan permanentemente de nuestros servidores mediante un proceso de limpieza automático.",
    },
    {
      question: "¿Funciona en móviles, Mac o Windows?",
      answer:
        "Sí, nuestra plataforma es totalmente web y está diseñada para funcionar en cualquier dispositivo moderno con un navegador, ya sea un PC con Windows, un Mac, un móvil Android o un iPhone.",
    },
  ],

  cta: {
    title: "¿Tus PDFs están al revés?",
    description: "Endereza tus documentos ahora mismo.",
    buttonLabel: "Rotar PDF ahora",
  },

  jsonLd: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Rotar PDF Online",
        applicationCategory: "ProductivityApplication",
        featureList: [
          "Rotación individual de páginas",
          "Rotación en lote (bulk rotation)",
          "Vista previa de miniaturas",
          "Guardado permanente de orientación",
          "Eliminación de páginas integrada"
        ],
        applicationSubCategory: "Document Editor",
        fileFormat: "application/pdf",
        operatingSystem: "Any",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          ratingCount: "750",
        },
      },
      {
        "@type": "HowTo",
        name: "Cómo rotar y guardar un PDF",
        step: [
          {
            "@type": "HowToStep",
            name: "Carga el documento",
            text: "Sube tu PDF para visualizar las páginas.",
          },
          {
            "@type": "HowToStep",
            name: "Aplica la rotación",
            text: "Gira las páginas necesarias 90, 180 o 270 grados.",
          },
          {
            "@type": "HowToStep",
            name: "Guarda los cambios",
            text: "Descarga el nuevo archivo con la orientación corregida.",
          },
        ],
      },
    ],
  },
};