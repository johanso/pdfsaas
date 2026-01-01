import { ToolPageData } from "./types";

export const extractPdfContent: ToolPageData = {
  id: "extract-pages",

  metadata: {
    title: "Extraer Páginas de PDF - Seleccionar y Guardar Hojas Online",
    description: "Elige qué páginas quieres conservar de tu PDF. Extráelas como archivos sueltos o crea un nuevo documento solo con las hojas seleccionadas. Gratis y visual.",
    keywords: [
      "extraer paginas pdf",
      "sacar hojas pdf",
      "guardar paginas pdf",
      "eliminar paginas pdf",
      "seleccionar hojas pdf",
      "extract pdf pages",
      "crear pdf con paginas seleccionadas"
    ],
    canonical: "/extraer-paginas-pdf",
    ogImage: "/og-images/extract-pdf.jpg", // Asegúrate de crear esta imagen
  },

  titleSectionSteps: "Cómo extraer páginas de un PDF paso a paso",
  titleSectionBenefits: "¿Por qué elegir nuestra herramienta para sacar hojas PDF?",
  titleSectionFAQ: "Preguntas Frecuentes sobre extracción de páginas",

  steps: [
    {
      number: "1",
      title: "Carga tu archivo PDF",
      description:
        "Sube tu documento. Visualizarás automáticamente todas las páginas en una cuadrícula interactiva.",
    },
    {
      number: "2",
      title: "Selecciona las páginas",
      description:
        "Haz clic sobre las páginas que quieras extraer. Usa las opciones 'Seleccionar todo' o 'Invertir' para ir más rápido.",
    },
    {
      number: "3",
      title: "Elige el formato y descarga",
      description:
        "Decide si quieres descargar las páginas sueltas (ZIP) o fusionarlas en un nuevo PDF único. ¡Listo!",
    },
  ],

  benefits: [
    {
      icon: "CheckSquare",
      title: "Selección Visual Intuitiva",
      description:
        "Nada de escribir números confusos (ej: 1,4-6). Simplemente haz clic en las miniaturas de las páginas que quieres guardar.",
    },
    {
      icon: "FileOutput",
      title: "Modo Dual de Extracción",
      description:
        "Flexibilidad total: descarga cada página como un archivo PDF independiente (ZIP) o une tu selección en un solo documento nuevo.",
    },
    {
      icon: "MousePointerClick",
      title: "Herramientas de Selección Rápida",
      description:
        "¿Tienes un documento enorme? Usa 'Invertir selección' para descartar pocas páginas rápidamente o 'Seleccionar todo' para empezar de cero.",
    },
    {
      icon: "Smartphone",
      title: "Optimizado para Móviles",
      description:
        "Nuestra interfaz táctil hace que seleccionar páginas desde tu teléfono o tablet sea tan fácil como hacerlo en el ordenador.",
    },
  ],

  faqs: [
    {
      question: "¿Cuál es la diferencia entre 'Páginas separadas' y 'Fusionar'?",
      answer:
        "Si eliges 'Páginas separadas', descarguras un archivo .ZIP que contiene un PDF individual por cada página seleccionada. Si eliges 'Fusionar', crearemos un único archivo PDF nuevo que contendrá solo las páginas que hayas marcado, en el orden que desees.",
    },
    {
      question: "¿Puedo reordenar las páginas antes de extraerlas?",
      answer:
        "Sí. Si eliges el modo 'Fusionar en un PDF', puedes arrastrar y soltar las páginas seleccionadas para cambiar su orden en el documento final resultante.",
    },
    {
      question: "¿Cómo elimino páginas de un PDF con esta herramienta?",
      answer:
        "Es muy sencillo: utiliza la función 'Invertir selección' o simplemente selecciona todas las páginas EXCEPTO las que quieres eliminar. Al descargar, obtendrás un nuevo PDF limpio sin las páginas no deseadas.",
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
    title: "¿Listo para extraer tus páginas?",
    description: "Selecciona, extrae y guarda solo lo que necesitas.",
    buttonLabel: "Seleccionar páginas ahora",
  },

  jsonLd: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Extraer Páginas PDF Online",
        applicationCategory: "ProductivityApplication",
        featureList: [
          "Selección visual de páginas mediante cuadrícula",
          "Exportación a múltiples archivos PDF (ZIP)",
          "Fusión de selección en un nuevo documento",
          "Herramientas de inversión de selección",
          "Vista previa de alta calidad"
        ],
        applicationSubCategory: "Document Processing",
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
          ratingCount: "820",
        },
      },
      {
        "@type": "HowTo",
        name: "Cómo extraer páginas de un PDF",
        step: [
          {
            "@type": "HowToStep",
            name: "Carga el PDF",
            text: "Arrastra tu archivo a la herramienta para ver todas las páginas.",
          },
          {
            "@type": "HowToStep",
            name: "Marca las páginas",
            text: "Haz clic en las casillas de verificación de las páginas que deseas conservar.",
          },
          {
            "@type": "HowToStep",
            name: "Descarga la selección",
            text: "Elige entre descargar un ZIP con archivos sueltos o un solo PDF fusionado.",
          },
        ],
      },
    ],
  },
};