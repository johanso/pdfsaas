import { ToolPageData } from "./types";

export const signPdfContent: ToolPageData = {
  id: "sign-pdf",

  metadata: {
    title: "Firmar PDF Online - Firma Electrónica Gratis y Sin Registro",
    description: "Firma documentos PDF online. Dibuja tu firma, escribe tu nombre o sube una imagen. Editor visual para colocar la firma donde quieras. Fácil y seguro.",
    keywords: [
      "firmar pdf",
      "firma digital pdf",
      "e-signature",
      "firmar documentos online",
      "dibujar firma en pdf",
      "agregar firma a pdf",
      "rubricar pdf",
      "sign pdf online free"
    ],
    canonical: "/firmar-pdf",
    ogImage: "/og-images/sign-pdf.jpg",
  },

  titleSectionSteps: "Cómo firmar un documento PDF electrónicamente",
  titleSectionBenefits: "¿Por qué usar nuestro firmador de PDF online?",
  titleSectionFAQ: "Preguntas Frecuentes sobre firma digital",

  steps: [
    {
      number: "1",
      title: "Crea tu firma",
      description:
        "Tienes 3 opciones: dibuja tu rúbrica con el dedo/mouse, escribe tu nombre con una fuente elegante o sube una imagen de tu sello.",
    },
    {
      number: "2",
      title: "Colócala en el documento",
      description:
        "Arrastra la firma y suéltala en la página y lugar exacto donde se requiere. Puedes ajustar el tamaño para que encaje perfectamente.",
    },
    {
      number: "3",
      title: "Descarga el PDF firmado",
      description:
        "Haz clic en 'Firmar y Descargar'. Tu documento estará listo para ser enviado con validez legal y profesionalismo.",
    },
  ],

  benefits: [
    {
      icon: "PenTool",
      title: "3 Métodos de Firma",
      description:
        "No necesitas tableta gráfica. Dibuja en tu móvil, usa nuestras tipografías manuscritas o sube una foto de tu firma en papel. Nos adaptamos a ti.",
    },
    {
      icon: "Move",
      title: "Posicionamiento Exacto",
      description:
        "Nuestro editor visual te permite navegar por todas las páginas y colocar la firma, iniciales o fechas exactamente donde marca la línea de puntos.",
    },
    {
      icon: "Smartphone",
      title: "Firma desde el Móvil",
      description:
        "La experiencia táctil es mejor. Abre nuestra web en tu smartphone y usa tu dedo para firmar con precisión natural, como si fuera papel.",
    },
    {
      icon: "Printer",
      title: "Adiós a Imprimir y Escanear",
      description:
        "Ahorra papel y tiempo. Ya no necesitas imprimir el contrato, firmarlo con bolígrafo, escanearlo y volver a convertirlo. Hazlo todo en digital.",
    },
  ],

  faqs: [
    {
      question: "¿Es legal firmar un PDF online?",
      answer:
        "Sí. Las firmas electrónicas son legalmente vinculantes en la mayoría de los países (eIDAS en Europa, ESIGN en EE.UU.) para la mayoría de contratos comerciales, acuerdos laborales y documentos administrativos.",
    },
    {
      question: "¿Puedo guardar mi firma para usarla después?",
      answer:
        "Sí. Mientras mantengas la sesión del navegador abierta, nuestra herramienta recordará tus firmas creadas para que puedas firmar múltiples documentos rápidamente sin volver a dibujar.",
    },
    {
      question: "¿Puedo firmar en varias páginas a la vez?",
      answer:
        "Por supuesto. Nuestro editor te permite navegar por el documento y arrastrar tu firma tantas veces como sea necesario, ideal para inicializar cada página de un contrato.",
    },
    // Preguntas Generales
    {
      question: "¿El uso de esta herramienta es gratuito?",
      answer:
        "Sí, puedes firmar todos los documentos que necesites de forma gratuita y sin necesidad de registrarte.",
    },
    {
      question: "¿Mis documentos son privados?",
      answer:
        "Absolutamente. Tu firma y tus documentos se procesan de forma segura. No almacenamos copias de tus contratos ni utilizamos tus firmas para nada más.",
    },
    {
      question: "¿Puedo subir una imagen de mi sello de empresa?",
      answer:
        "Sí. Utiliza la opción 'Subir' en el creador de firmas. Recomendamos usar imágenes PNG con fondo transparente para un resultado más profesional.",
    },
  ],

  cta: {
    title: "Cierra tratos más rápido",
    description: "Firma contratos y documentos en segundos desde cualquier lugar.",
    buttonLabel: "Crear firma ahora",
  },

  jsonLd: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Firmar PDF Online",
        applicationCategory: "BusinessApplication",
        featureList: [
          "Dibujo de firma manuscrita",
          "Generador de firma tipográfica",
          "Carga de imagen/sello",
          "Editor visual Drag & Drop",
          "Soporte para múltiples firmas"
        ],
        applicationSubCategory: "Electronic Signature",
        fileFormat: ["application/pdf"],
        operatingSystem: "Any",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          ratingCount: "2300",
        },
      },
      {
        "@type": "HowTo",
        name: "Cómo firmar un PDF digitalmente",
        step: [
          {
            "@type": "HowToStep",
            name: "Sube el documento",
            text: "Carga el PDF que necesitas firmar.",
          },
          {
            "@type": "HowToStep",
            name: "Crea la firma",
            text: "Dibuja tu firma, escribe tu nombre o sube una imagen.",
          },
          {
            "@type": "HowToStep",
            name: "Coloca y Descarga",
            text: "Arrastra la firma al lugar correcto y descarga el archivo firmado.",
          },
        ],
      },
    ],
  },
};