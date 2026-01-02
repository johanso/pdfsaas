import { ToolPageData } from "./types";

export const organizePdfContent: ToolPageData = {
  id: "organize-pdf",

  metadata: {
    title: "Organizar PDF - Ordenar, Insertar y Duplicar Páginas Gratis",
    description: "Reorganiza tus PDFs arrastrando y soltando. Añade páginas en blanco, duplica hojas, elimina las que sobran y combina múltiples archivos. Control total.",
    keywords: [
      "organizar pdf",
      "ordenar paginas pdf",
      "reordenar pdf",
      "insertar pagina en blanco pdf",
      "duplicar paginas pdf",
      "cambiar orden pdf",
      "organizador pdf online",
      "añadir pdf a otro pdf"
    ],
    canonical: "/organizar-pdf",
    ogImage: "/og-images/organize-pdf.jpg",
  },

  titleSectionSteps: "Cómo organizar y reordenar un PDF paso a paso",
  titleSectionBenefits: "¿Por qué usar nuestro organizador de PDF todo en uno?",
  titleSectionFAQ: "Preguntas Frecuentes sobre la organización de documentos",

  steps: [
    {
      number: "1",
      title: "Carga tus archivos",
      description:
        "Sube uno o varios archivos PDF. Nuestro sistema cargará todas las páginas en una mesa de trabajo visual.",
    },
    {
      number: "2",
      title: "Ordena y Edita",
      description:
        "Arrastra las páginas para cambiar el orden. Usa las herramientas para rotar, eliminar, duplicar o insertar hojas en blanco donde necesites.",
    },
    {
      number: "3",
      title: "Guarda el nuevo orden",
      description:
        "Haz clic en 'Guardar Documento'. Procesaremos la nueva estructura y descargaremos tu PDF perfectamente organizado.",
    },
  ],

  benefits: [
    {
      icon: "Move",
      title: "Drag & Drop Fluido",
      description:
        "Cambiar el orden es tan natural como mover papeles en un escritorio. Simplemente arrastra y suelta las páginas en la posición exacta que deseas.",
    },
    {
      icon: "Copy",
      title: "Duplicar e Insertar",
      description:
        "Funciones avanzadas gratuitas: ¿Necesitas repetir una página? Duplícala con un clic. ¿Necesitas un separador? Inserta una hoja en blanco al instante.",
    },
    {
      icon: "Files",
      title: "Mezcla Múltiples PDFs",
      description:
        "No te limites a un solo archivo. Usa el botón 'Añadir PDF' para cargar documentos adicionales y mezclar sus páginas en un solo archivo maestro.",
    },
    {
      icon: "CheckSquare",
      title: "Edición en Lote",
      description:
        "Ahorra tiempo seleccionando varias páginas a la vez para rotarlas, eliminarlas o moverlas en grupo. Ideal para documentos extensos.",
    },
  ],

  faqs: [
    {
      question: "¿Puedo añadir páginas de otro archivo PDF?",
      answer:
        "¡Sí! Puedes usar el botón 'Añadir PDF' tantas veces como quieras para cargar documentos adicionales. Todas las páginas aparecerán en la misma cuadrícula para que las mezcles y ordenes a tu gusto.",
    },
    {
      question: "¿Es posible duplicar una página existente?",
      answer:
        "Sí. Selecciona la página que quieres copiar y pulsa el botón de duplicar. Se creará una copia exacta justo al lado de la original.",
    },
    {
      question: "¿Puedo insertar una página en blanco para separar secciones?",
      answer:
        "Exacto. Utiliza la opción 'Insertar página en blanco' y aparecerá una hoja vacía que puedes arrastrar y colocar donde necesites dentro del documento.",
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
    title: "Pon orden en tus documentos",
    description: "La forma más fácil de estructurar tus PDFs.",
    buttonLabel: "Organizar PDF ahora",
  },

  jsonLd: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Organizar PDF Online",
        applicationCategory: "ProductivityApplication",
        featureList: [
          "Reordenar páginas con arrastrar y soltar",
          "Insertar páginas en blanco",
          "Duplicar páginas existentes",
          "Combinar páginas de múltiples archivos",
          "Rotación y eliminación en lote"
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
          ratingValue: "4.9",
          ratingCount: "1100",
        },
      },
      {
        "@type": "HowTo",
        name: "Cómo organizar páginas de un PDF",
        step: [
          {
            "@type": "HowToStep",
            name: "Carga los archivos",
            text: "Sube uno o más PDFs a la herramienta de organización.",
          },
          {
            "@type": "HowToStep",
            name: "Reorganiza la estructura",
            text: "Arrastra las páginas para ordenar, duplica o inserta espacios en blanco.",
          },
          {
            "@type": "HowToStep",
            name: "Guarda el documento",
            text: "Descarga el nuevo PDF con la estructura modificada.",
          },
        ],
      },
    ],
  },
};