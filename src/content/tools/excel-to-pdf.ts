import { ToolPageData } from "./types";

export const excelToPdfContent: ToolPageData = {
  id: "excel-to-pdf",

  metadata: {
    title: "Excel a PDF - Convertir XLSX y XLS a PDF con Formato Perfecto",
    description: "Convierte hojas de cálculo Excel a PDF online. Mantiene el formato de tablas y celdas. Soporta archivos .xlsx y .xls. Gratis, seguro y rápido.",
    keywords: [
      "excel a pdf",
      "convertir excel a pdf",
      "xlsx a pdf",
      "xls a pdf",
      "hoja de calculo a pdf",
      "guardar excel como pdf",
      "convertir tablas excel a pdf"
    ],
    canonical: "/excel-a-pdf",
    ogImage: "/og-images/excel-to-pdf.jpg",
  },

  titleSectionSteps: "Cómo pasar un Excel a PDF sin que se muevan las celdas",
  titleSectionBenefits: "¿Por qué convertir hojas de cálculo con nuestra herramienta?",
  titleSectionFAQ: "Preguntas Frecuentes sobre Excel y PDF",

  steps: [
    {
      number: "1",
      title: "Carga tu hoja de cálculo",
      description:
        "Sube tu archivo Excel. Aceptamos el formato estándar (.xlsx) y el clásico (.xls).",
    },
    {
      number: "2",
      title: "Conversión precisa",
      description:
        "Nuestro motor procesa archivos interpretando márgenes y saltos de página para que tus tablas no queden cortadas.",
    },
    {
      number: "3",
      title: "Descarga el documento",
      description:
        "Obtén un archivo PDF limpio y profesional, listo para imprimir o enviar por correo sin riesgo de edición.",
    },
  ],

  benefits: [
    {
      icon: "Table",
      title: "Tablas Perfectas",
      description:
        "Sabemos que lo más importante es que las columnas cuadren. Usamos tecnología de renderizado avanzada para respetar el diseño de tus celdas.",
    },
    {
      icon: "FileSpreadsheet",
      title: "Soporte Universal",
      description:
        "¿Tienes un archivo viejo de Excel 2003 (.xls) o uno reciente de Office 365 (.xlsx)? Nuestra herramienta maneja ambos formatos sin errores.",
    },
    {
      icon: "Calculator",
      title: "Datos Calculados",
      description:
        "El PDF final mostrará los valores resultantes de tus fórmulas, asegurando que quien reciba el archivo vea los datos finales correctos.",
    },
    {
      icon: "Lock",
      title: "Protección de Datos",
      description:
        "Al pasar a PDF, evitas que terceros modifiquen tus cifras por error. Además, borramos tu archivo original de nuestros servidores tras la descarga.",
    },
  ],

  faqs: [
    // Preguntas Específicas
    {
      question: "¿Se verán las fórmulas en el PDF?",
      answer:
        "No, el PDF mostrará únicamente el resultado final (el valor) de la celda, tal como se vería al imprimir la hoja. Tus fórmulas internas permanecen privadas.",
    },
    {
      question: "¿Qué pasa si mi Excel tiene varias hojas/pestañas?",
      answer:
        "Por defecto, la herramienta intentará convertir todas las hojas activas del libro de Excel en un solo documento PDF continuo, respetando el orden de las pestañas.",
    },
    {
      question: "¿Mis columnas se cortarán en el PDF?",
      answer:
        "Nuestro sistema intenta ajustar el contenido al ancho de la página estándar (A4/Carta). Para mejores resultados, te recomendamos configurar el 'Área de impresión' en tu Excel antes de subirlo si es muy ancho.",
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
        "Sí, puedes convertir archivos Excel recibidos por WhatsApp o correo directamente desde tu móvil Android o iPhone sin instalar aplicaciones extra.",
    },
  ],

  cta: {
    title: "Protege tus hojas de cálculo",
    description: "Convierte tus datos en un documento profesional ahora.",
    buttonLabel: "Elegir archivo Excel",
  },

  jsonLd: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Convertir Excel a PDF Online",
        applicationCategory: "ProductivityApplication",
        featureList: [
          "Conversión de XLSX y XLS a PDF",
          "Renderizado preciso de tablas",
          "Conversión de múltiples pestañas",
          "Privacidad de fórmulas",
          "Procesamiento seguro"
        ],
        applicationSubCategory: "Spreadsheet Converter",
        fileFormat: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel", "application/pdf"],
        operatingSystem: "Any",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.7",
          ratingCount: "1850",
        },
      },
      {
        "@type": "HowTo",
        name: "Cómo convertir un Excel a PDF",
        step: [
          {
            "@type": "HowToStep",
            name: "Sube el Excel",
            text: "Carga tu archivo .xlsx o .xls en la herramienta.",
          },
          {
            "@type": "HowToStep",
            name: "Espera la conversión",
            text: "El sistema procesará las hojas de cálculo para ajustarlas al formato PDF.",
          },
          {
            "@type": "HowToStep",
            name: "Descarga",
            text: "Guarda el documento resultante en tu dispositivo.",
          },
        ],
      },
    ],
  },
};