import { ToolPageData } from "./types";

export const grayscalePdfContent: ToolPageData = {
  id: "grayscale-pdf",

  metadata: {
    title: "PDF a Escala de Grises - Convertir a Blanco y Negro Online",
    description: "Convierte PDF a escala de grises (Blanco y Negro). Ahorra tinta de impresión y reduce el tamaño del archivo. 4 niveles de contraste para mejorar la lectura.",
    keywords: [
      "pdf a escala de grises",
      "convertir pdf a blanco y negro",
      "pdf grayscale online",
      "ahorrar tinta pdf",
      "imprimir pdf blanco y negro",
      "quitar color pdf",
      "mejorar contraste pdf",
      "reducir peso pdf grises"
    ],
    canonical: "/pdf-escala-de-grises",
    ogImage: "/og-images/grayscale-pdf.jpg",
  },

  titleSectionSteps: "Cómo convertir un PDF a blanco y negro con contraste ajustable",
  titleSectionBenefits: "¿Por qué usar nuestra herramienta de escala de grises?",
  titleSectionFAQ: "Preguntas Frecuentes sobre impresión y escala de grises",

  steps: [
    {
      number: "1",
      title: "Sube tu PDF a color",
      description:
        "Arrastra tu documento. Aceptamos archivos PDF nativos o escaneados con imágenes a color.",
    },
    {
      number: "2",
      title: "Selecciona el contraste",
      description:
        "Elige 'Normal' para una conversión estándar, 'Alto' para textos más nítidos o 'Claro' para documentos con fondo oscuro.",
    },
    {
      number: "3",
      title: "Convierte y Ahorra",
      description:
        "Haz clic en 'Convertir'. Procesaremos el archivo eliminando la información de color y optimizando el tamaño para la descarga.",
    },
  ],

  benefits: [
    {
      icon: "Droplets",
      title: "Ahorra Tinta y Tóner",
      description:
        "Imprimir gráficos a color en blanco y negro gasta mucha tinta negra. Al convertir a gris real y aumentar el contraste, reduces drásticamente el consumo de tu impresora.",
    },
    {
      icon: "Contrast",
      title: "4 Niveles de Contraste",
      description:
        "Único en su clase. ¿Tu escaneo salió muy oscuro? Usa el modo 'Claro'. ¿El texto se ve pálido? Usa el modo 'Alto Contraste' o 'Extremo' para revivirlo.",
    },
    {
      icon: "FileDown",
      title: "Reduce el Tamaño",
      description:
        "La información de color ocupa espacio. Al eliminar los canales de color (CMYK/RGB) y dejar solo el canal de luminancia, tu archivo pesará mucho menos.",
    },
    {
      icon: "ScanEye",
      title: "Mejora la Legibilidad",
      description:
        "Ideal para estudiantes y oficinas. Convierte diapositivas o documentos con fondos de colores molestos en textos limpios y fáciles de leer o subrayar.",
    },
  ],

  faqs: [
    // Preguntas Específicas
    {
      question: "¿Cuál es la diferencia entre 'Normal' y 'Alto Contraste'?",
      answer:
        "El modo **Normal** hace una conversión matemática directa de color a gris. El modo **Alto Contraste** oscurece los grises medios y aclara los fondos, haciendo que el texto resalte más, ideal para fotocopias o escaneos viejos.",
    },
    {
      question: "¿Se puede revertir el proceso y recuperar el color?",
      answer:
        "No. Al convertir a escala de grises, la información de color se elimina permanentemente del archivo para ahorrar espacio. Te recomendamos guardar una copia del original si la necesitas.",
    },
    {
      question: "¿Esta herramienta reduce el tamaño del archivo?",
      answer:
        "Sí, en la mayoría de los casos. Al eliminar los datos de color extra, el archivo suele volverse más ligero, lo que facilita su envío por correo electrónico.",
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
        "Sí, nuestra plataforma web es totalmente compatible con dispositivos móviles iOS y Android.",
    },
  ],

  cta: {
    title: "Prepara tus documentos para imprimir",
    description: "Elimina el color y mejora el contraste en segundos.",
    buttonLabel: "Convertir a Grises",
  },

  jsonLd: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Convertir PDF a Escala de Grises",
        applicationCategory: "ProductivityApplication",
        featureList: [
          "Conversión a escala de grises real",
          "Ajuste de brillo y contraste",
          "Modo de limpieza de escaneos (Extreme)",
          "Reducción de tamaño de archivo",
          "Optimización para impresión"
        ],
        applicationSubCategory: "Document Editor",
        fileFormat: ["application/pdf"],
        operatingSystem: "Any",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.7",
          ratingCount: "1320",
        },
      },
      {
        "@type": "HowTo",
        name: "Cómo pasar PDF a blanco y negro",
        step: [
          {
            "@type": "HowToStep",
            name: "Carga el PDF",
            text: "Sube tu archivo a color a la plataforma.",
          },
          {
            "@type": "HowToStep",
            name: "Elige el modo",
            text: "Selecciona el nivel de contraste deseado (Normal, Alto, etc).",
          },
          {
            "@type": "HowToStep",
            name: "Descarga",
            text: "Obtén el archivo convertido y optimizado.",
          },
        ],
      },
    ],
  },
};