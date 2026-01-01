import { ToolPageData } from "./types";

export const deletePdfContent: ToolPageData = {
  id: "delete-pages",

  metadata: {
    title: "Eliminar Páginas PDF - Borrar y Quitar Hojas Online Gratis",
    description: "Elimina páginas no deseadas de tu PDF fácilmente. Selecciona visualmente las hojas a borrar o escribe el rango de páginas. Rápido, seguro y sin marcas de agua.",
    keywords: [
      "eliminar paginas pdf",
      "borrar hojas pdf",
      "quitar paginas pdf",
      "remover hojas pdf",
      "delete pdf pages",
      "cortar pdf online",
      "editor pdf eliminar hojas"
    ],
    canonical: "/eliminar-paginas-pdf",
    ogImage: "/og-images/delete-pages.jpg", 
  },

  titleSectionSteps: "Cómo borrar páginas de un PDF paso a paso",
  titleSectionBenefits: "¿Por qué usar nuestra herramienta para quitar hojas?",
  titleSectionFAQ: "Preguntas Frecuentes sobre eliminar páginas",

  steps: [
    {
      number: "1",
      title: "Sube tu archivo PDF",
      description:
        "Arrastra tu documento a la herramienta. Cargaremos una vista previa de todas las páginas en segundos.",
    },
    {
      number: "2",
      title: "Marca las páginas a borrar",
      description:
        "Haz clic sobre las hojas que NO quieres. Se marcarán en rojo con una X. También puedes escribir rangos (ej: 1-5).",
    },
    {
      number: "3",
      title: "Descarga el PDF limpio",
      description:
        "Haz clic en 'Guardar Documento'. Generaremos un nuevo PDF que contendrá solo las páginas que decidiste conservar.",
    },
  ],

  benefits: [
    {
      icon: "Eraser",
      title: "Eliminación Visual Intuitiva",
      description:
        "Nuestro sistema marca las páginas eliminadas con un borde rojo y una 'X' clara. Así nunca borrarás un documento importante por error.",
    },
    {
      icon: "Keyboard", 
      title: "Selección por Rangos",
      description:
        "¿Necesitas borrar de la página 50 a la 100? No hagas 50 clics. Simplemente escribe '50-100' en la caja de texto y nosotros hacemos el resto.",
    },
    {
      icon: "Zap",
      title: "Inversión de Selección",
      description:
        "¿Quieres borrar casi todo y dejar solo 2 páginas? Selecciona las que quieres guardar y pulsa 'Invertir selección' para borrar el resto automáticamente.",
    },
    {
      icon: "Shield",
      title: "Privacidad Total",
      description:
        "Procesamos tu archivo y lo eliminamos. Nadie lee tus documentos. Ideal para quitar páginas confidenciales antes de compartir un PDF.",
    },
  ],

  faqs: [
    {
      question: "¿Puedo recuperar las páginas una vez eliminadas?",
      answer:
        "El nuevo archivo que descargas ya no tiene esas páginas. Sin embargo, tu archivo original en tu computadora permanece intacto. Nuestra herramienta crea una copia modificada.",
    },
    {
      question: "¿Cómo borro muchas páginas seguidas rápidamente?",
      answer:
        "Utiliza la opción de 'Selección por rango' en la barra lateral. Escribe el intervalo (ejemplo: 10-25) y todas esas páginas se marcarán para eliminar automáticamente.",
    },
    {
      question: "¿Puedo borrar la primera y la última página a la vez?",
      answer:
        "Sí. Simplemente haz clic en la página 1 y en la última página de la cuadrícula, o escribe '1, [número final]' en el campo de rangos.",
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
    title: "¿Listo para limpiar tu PDF?",
    description: "Quita las páginas que sobran en segundos.",
    buttonLabel: "Eliminar páginas ahora",
  },

  jsonLd: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Eliminar Páginas PDF Online",
        applicationCategory: "ProductivityApplication",
        featureList: [
          "Selección visual para borrar páginas (Red X)",
          "Entrada de texto para eliminación por rangos",
          "Vista previa de documentos",
          "Herramienta de inversión de selección",
          "Procesamiento seguro y privado"
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
          ratingValue: "4.7",
          ratingCount: "640",
        },
      },
      {
        "@type": "HowTo",
        name: "Cómo eliminar hojas de un PDF",
        step: [
          {
            "@type": "HowToStep",
            name: "Sube el PDF",
            text: "Carga tu archivo para ver la cuadrícula de páginas.",
          },
          {
            "@type": "HowToStep",
            name: "Selecciona las hojas a borrar",
            text: "Haz clic en las páginas no deseadas o escribe el rango numérico.",
          },
          {
            "@type": "HowToStep",
            name: "Descarga el archivo",
            text: "Presiona guardar para descargar tu nuevo PDF sin las páginas seleccionadas.",
          },
        ],
      },
    ],
  },
};