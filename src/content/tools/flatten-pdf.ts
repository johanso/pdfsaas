import { ToolPageData } from "./types";

export const flattenPdfContent: ToolPageData = {
  id: "flatten-pdf",

  metadata: {
    title: "Aplanar PDF - Unir Capas y Bloquear Formularios Online",
    description: "Aplana tus archivos PDF para evitar la edición. Convierte formularios rellenables y comentarios en texto fijo. Ideal para impresión y seguridad.",
    keywords: [
      "aplanar pdf",
      "flatten pdf online",
      "unir capas pdf",
      "bloquear formulario pdf",
      "convertir pdf a estatico",
      "impedir edicion pdf",
      "aplanar comentarios pdf",
      "imprimir pdf con comentarios"
    ],
    canonical: "/aplanar-pdf",
    ogImage: "/og-images/flatten-pdf.jpg",
  },

  titleSectionSteps: "Cómo aplanar un PDF para que no se pueda editar",
  titleSectionBenefits: "¿Para qué sirve aplanar un documento PDF?",
  titleSectionFAQ: "Preguntas Frecuentes sobre aplanar capas y formularios",

  steps: [
    {
      number: "1",
      title: "Sube el PDF interactivo",
      description:
        "Carga tu archivo con formularios, capas o comentarios. Detectaremos automáticamente los elementos editables.",
    },
    {
      number: "2",
      title: "Configura el aplanado",
      description:
        "Elige si quieres aplanar todo el documento, solo los campos del formulario o solo las anotaciones. También puedes optimizar el tamaño.",
    },
    {
      number: "3",
      title: "Bloquea y Descarga",
      description:
        "Haz clic en 'Aplanar PDF'. Fusionaremos todas las capas en una sola imagen visual y podrás descargar un documento seguro y estático.",
    },
  ],

  benefits: [
    {
      icon: "ShieldLock",
      title: "Bloqueo de Formularios",
      description:
        "Convierte los campos rellenables (inputs, checkboxes) en texto plano. Evita que los destinatarios modifiquen la información que has introducido.",
    },
    {
      icon: "Layers",
      title: "Fusión de Capas",
      description:
        "Une el contenido visual con el fondo. Esto soluciona errores comunes de impresión donde las firmas o comentarios no aparecen en el papel.",
    },
    {
      icon: "MousePointerClick",
      title: "Control Selectivo",
      description:
        "¿Quieres fijar los comentarios pero dejar el formulario activo? Nuestra herramienta te permite elegir exactamente qué elementos deseas aplanar.",
    },
    {
      icon: "FileCheck",
      title: "Compatibilidad Total",
      description:
        "Al aplanar el PDF, aseguras que el documento se vea idéntico en cualquier visor (Chrome, Mac, Móvil), eliminando problemas de visualización de elementos dinámicos.",
    },
  ],

  faqs: [
    // Preguntas Específicas
    {
      question: "¿Qué significa 'Aplanar' un PDF?",
      answer:
        "Aplanar un PDF es el proceso de fusionar todos los elementos interactivos (campos de formulario, botones, capas, anotaciones) en el contenido principal del documento. El resultado es un PDF estándar que se ve igual pero ya no es editable.",
    },
    {
      question: "¿Puedo recuperar los campos editables después?",
      answer:
        "No. El proceso es irreversible porque convertimos los elementos dinámicos en parte de la 'imagen' de la página. Te recomendamos guardar una copia del archivo original si crees que necesitarás editarlo en el futuro.",
    },
    {
      question: "¿Por qué debería aplanar antes de imprimir?",
      answer:
        "Muchas impresoras tienen problemas para interpretar las capas de anotaciones o formularios, resultando en impresiones en blanco. Aplanar el documento garantiza que lo que ves en pantalla es exactamente lo que sale impreso.",
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
        "Sí, nuestra plataforma web funciona en cualquier dispositivo móvil, permitiéndote asegurar documentos antes de compartirlos por WhatsApp o correo.",
    },
  ],

  cta: {
    title: "Asegura el contenido de tu PDF",
    description: "Evita cambios no deseados en tus formularios y notas.",
    buttonLabel: "Aplanar PDF ahora",
  },

  jsonLd: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Aplanar PDF Online",
        applicationCategory: "ProductivityApplication",
        featureList: [
          "Aplanado de formularios PDF",
          "Fusión de capas y anotaciones",
          "Opciones de aplanado selectivo",
          "Compresión integrada",
          "Prevención de edición de documentos"
        ],
        applicationSubCategory: "Document Security",
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
          ratingCount: "950",
        },
      },
      {
        "@type": "HowTo",
        name: "Cómo aplanar capas de un PDF",
        step: [
          {
            "@type": "HowToStep",
            name: "Sube el documento",
            text: "Carga tu PDF con elementos interactivos.",
          },
          {
            "@type": "HowToStep",
            name: "Selecciona modo",
            text: "Elige si aplanar formularios, anotaciones o todo.",
          },
          {
            "@type": "HowToStep",
            name: "Procesa",
            text: "Convierte el documento a formato estático y descarga.",
          },
        ],
      },
    ],
  },
};