import { ToolPageData } from "./types";

export const mergePdfContent: ToolPageData = {
  id: "merge-pdf",

  metadata: {
    title: "Unir PDF Rápido - Compresión Inteligente y Carga Veloz",
    description:
      "Une archivos PDF grandes en segundos gracias a nuestra tecnología de compresión local Gzip. Monitor de subida en tiempo real, 100% seguro y gratis.",
    keywords: [
      "unir pdf",
      "combinar pdf",
      "juntar pdf online",
      "fusionar pdf gratis",
      "merge pdf",
      "unir pdf rapido",
      "combinar pdf archivos grandes",
      "unir pdf con barra de progreso",
      "juntar pdf sin perder calidad",
      "merge pdf compressed upload",
    ],
    canonical: "/unir-pdf",
    ogImage: "/og-images/merge-pdf.jpg",
  },

  titleSectionSteps: "Cómo combinar y unir archivos PDF paso a paso",
  titleSectionBenefits: "¿Por qué elegir nuestra herramienta para juntar PDFs?",
  titleSectionFAQ: "Preguntas Frecuentes sobre la fusión de documentos",

  steps: [
    {
      number: "1",
      title: "Selecciona tus documentos",
      description:
        "Arrastra tus PDFs al recuadro o haz clic en 'Añadir PDF'. Puedes subir hasta 50 archivos a la vez.",
    },
    {
      number: "2",
      title: "Organiza y Ordena",
      description:
        "Arrastra las páginas para cambiar el orden o usa nuestros filtros automáticos (A-Z) para organizarlos al instante.",
    },
    {
      number: "3",
      title: "Fusionar y Descargar",
      description:
        "Haz clic en 'Unir y Descargar PDF'. Tu nuevo documento estará listo en segundos con la máxima calidad.",
    },
  ],

  benefits: [
    {
      icon: "Zap",
      title: "Gran Capacidad (500MB)",
      description:
        "A diferencia de otros, permitimos lotes de hasta 500MB y archivos individuales de 100MB. Ideal para documentos pesados.",
    },
    {
      icon: "Shield",
      title: "100% seguro",
      description:
        "Tus archivos se procesan en servidores seguros y se eliminan permanentemente justo después de la descarga.",
    },
    {
      icon: "Clock",
      title: "Ordenamiento Inteligente",
      description:
        "¿Muchos archivos? No pierdas tiempo. Usa nuestra función de ordenamiento alfabético o reorganiza visualmente en nuestra cuadrícula interactiva.",
    },
    {
      icon: "CheckCircle2",
      title: "Calidad Intacta",
      description:
        "Utilizamos algoritmos de compresión inteligente para unir tus documentos sin perder la nitidez del texto ni las imágenes.",
    },
  ],

  faqs: [
    {
      question: "¿Es gratis unir archivos PDF?",
      answer:
        "Sí, nuestra herramienta es completamente gratuita. No necesitas registrarte ni pagar suscripciones para combinar tus documentos.",
    },
    {
      question: "¿Qué pasa con mis archivos después de unirlos?",
      answer:
        "La seguridad es nuestra prioridad. Nuestro sistema ejecuta una limpieza automática que borra tus datos de nuestros servidores inmediatamente después del procesamiento.",
    },
    {
      question: "¿Cuántos archivos puedo combinar a la vez?",
      answer:
        "Puedes subir y unir hasta 50 archivos PDF simultáneamente, siempre que el total no supere los 500MB.",
    },
    {
      question: "¿Puedo cambiar el orden de las páginas?",
      answer:
        "Sí, puedes reorganizar el orden de los archivos antes de unirlos. Simplemente arrastra y suelta los archivos en el orden deseado.",
    },
    {
      question: "¿Puedo unir PDFs protegidos con contraseña?",
      answer:
        "Por seguridad, debes desbloquear o saber la contraseña del archivo antes de subirlo. El sistema te avisará si detecta un archivo encriptado.",
    },
  ],

  cta: {
    title: "¿Listo para unir tus PDFs?",
    description: "Empieza ahora mismo. Sin registro, sin complicaciones.",
    buttonLabel: "Subir archivos",
  },

  jsonLd: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Unir PDF Online",
        applicationCategory: "ProductivityApplication",
        featureList: [
          "Compresión Gzip en cliente para subidas rápidas",
          "Soporte para archivos de hasta 100MB",
          "Estimación de tiempo de subida en tiempo real",
          "Cancelación de procesos en curso",
          "Limpieza automática de servidores",
        ],
        applicationSubCategory: "Document Processing",
        fileFormat: "application/pdf",
        browserRequirements: "Requires JavaScript. Supports HTML5.",
        operatingSystem: "Any",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          ratingCount: "1250",
        },
      },
      {
        "@type": "HowTo",
        name: "Cómo unir archivos PDF gratis",
        step: [
          {
            "@type": "HowToStep",
            name: "Sube tus archivos",
            text: "Arrastra o selecciona hasta 50 archivos PDF que desees combinar.",
          },
          {
            "@type": "HowToStep",
            name: "Ordena los documentos",
            text: "Organiza el orden de las páginas arrastrando los archivos en la cuadrícula.",
          },
          {
            "@type": "HowToStep",
            name: "Descarga el resultado",
            text: "Pulsa el botón de unir y descarga tu nuevo archivo PDF fusionado.",
          },
        ],
      },
    ],
  },
};