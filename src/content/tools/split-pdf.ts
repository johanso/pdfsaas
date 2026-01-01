import { ToolPageData } from "./types";

export const splitPdfContent: ToolPageData = {
  id: "split-pdf",

  metadata: {
    title: "Dividir PDF - Separar Páginas y Cortar PDF Online Gratis",
    description: "Herramienta visual para dividir archivos PDF. Usa las tijeras virtuales para separar páginas, extraer rangos o dividir por lotes. Rápido, visual y sin registro.",
    keywords: [
      "dividir pdf",
      "separar pdf",
      "cortar pdf online",
      "extraer paginas pdf",
      "separar hojas pdf",
      "split pdf visual",
      "dividir pdf en partes iguales"
    ],
    canonical: "/dividir-pdf",
    ogImage: "/og-images/split-pdf.jpg",
  },

  titleSectionSteps: " Cómo separar y cortar archivos PDF fácilmente",
  titleSectionBenefits: "¿Por qué usar nuestro cortador de PDF visual?",
  titleSectionFAQ: "Preguntas Frecuentes sobre cómo separar hojas PDF",

  steps: [
    {
      number: "1",
      title: "Sube tu archivo PDF",
      description:
        "Arrastra tu documento al área de carga. Verás al instante todas las páginas organizadas en una cuadrícula visual.",
    },
    {
      number: "2",
      title: "Elige tu modo de corte",
      description:
        "Usa el modo 'Rangos' para cortar con tijeras visuales o el modo 'Cantidad' para dividir en partes iguales automáticamente.",
    },
    {
      number: "3",
      title: "Descarga tus archivos",
      description:
        "Previsualiza los grupos por colores y haz clic en 'Dividir'. Si resultan varios archivos, se descargarán en un ZIP ordenado.",
    },
  ],

  benefits: [
    {
      icon: "Scissors",
      title: "Cortador Visual Interactivo",
      description:
        "Olvídate de escribir rangos complejos. Usa nuestras tijeras virtuales para marcar visualmente dónde quieres separar el documento.",
    },
    {
      icon: "Layers",
      title: "División por Lotes",
      description:
        "Ideal para escaneos masivos. Divide un documento grande en archivos individuales de 1, 2 o 5 páginas automáticamente.",
    },
    {
      icon: "Shield",
      title: "100% Seguro y Privado",
      description:
        "Tus archivos se procesan localmente o en servidores seguros y se eliminan automáticamente tras la descarga.",
    },
    {
      icon: "FileArchive",
      title: "Descarga Inteligente (ZIP)",
      description:
        "Si generas múltiples archivos, no llenamos tu carpeta de descargas. Te entregamos todo organizado en un único archivo ZIP.",
    },
  ],

  faqs: [
    {
      question: "¿Puedo separar cada página en un archivo PDF distinto?",
      answer:
        "Sí. En el panel de la derecha, elige el modo \"Cantidad\" y establece el valor \"Páginas por archivo\" en 1. La herramienta generará automáticamente un PDF individual por cada página del documento original.",
    },
    {
      question: "¿Cómo elimino una división si me equivoco?",
      answer:
        "Es muy fácil. En el modo \"Rangos\", simplemente vuelve a hacer clic en el icono de las tijeras que marcaste. La división desaparecerá y los grupos se volverán a unir al instante.",
    },
    {
      question: "Si divido un PDF en 10 partes, ¿cómo lo descargo?",
      answer:
        "Nuestro sistema es inteligente. Cuando el resultado es más de un archivo, los empaquetamos todos juntos en un único archivo .ZIP para que puedas descargarlos de una sola vez, ya organizados.",
    },
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
    title: "¿Listo para dividir tu PDF?",
    description: "Separa páginas o extrae documentos en segundos.",
    buttonLabel: "Dividir PDF ahora",
  },

  jsonLd: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Dividir PDF Online",
        applicationCategory: "ProductivityApplication",
        featureList: [
          "Selector visual con tijeras interactivas",
          "División automática por cantidad fija",
          "Vista previa de miniaturas en alta calidad",
          "Descarga en ZIP para múltiples archivos",
          "Procesamiento seguro sin registro"
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
          ratingValue: "4.8",
          ratingCount: "950",
        },
      },
      {
        "@type": "HowTo",
        name: "Cómo dividir un archivo PDF",
        step: [
          {
            "@type": "HowToStep",
            name: "Sube el archivo",
            text: "Arrastra tu PDF a la herramienta para cargar la vista previa de las páginas.",
          },
          {
            "@type": "HowToStep",
            name: "Selecciona los cortes",
            text: "Usa las tijeras visuales para marcar dónde dividir o elige un número fijo de páginas por archivo.",
          },
          {
            "@type": "HowToStep",
            name: "Divide y Descarga",
            text: "Haz clic en 'Dividir PDF' y descarga los documentos resultantes (en PDF o ZIP).",
          },
        ],
      },
    ],
  },
};