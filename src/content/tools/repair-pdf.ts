import { ToolPageData } from "./types";

export const repairPdfContent: ToolPageData = {
  id: "repair-pdf",

  metadata: {
    title: "Reparar PDF - Recuperar Archivos Corruptos o Dañados Online",
    description: "Herramienta gratuita para reparar PDFs que no abren. Diagnostica errores y recupera datos de archivos corruptos, descargas incompletas o discos dañados.",
    keywords: [
      "reparar pdf",
      "recuperar pdf dañado",
      "arreglar pdf corrupto",
      "pdf no abre",
      "reparador pdf online",
      "error formato pdf",
      "fix pdf online",
      "reconstruir pdf"
    ],
    canonical: "/reparar-pdf",
    ogImage: "/og-images/repair-pdf.jpg",
  },

  titleSectionSteps: "Cómo arreglar un PDF dañado paso a paso",
  titleSectionBenefits: "¿Por qué confiar en nuestro reparador de documentos?",
  titleSectionFAQ: "Preguntas Frecuentes sobre archivos PDF corruptos",

  steps: [
    {
      number: "1",
      title: "Sube el archivo corrupto",
      description:
        "Carga el PDF que da error. Nuestro sistema ejecutará un análisis de integridad inmediato (Diagnóstico gratuito) para detectar el problema.",
    },
    {
      number: "2",
      title: "Elige el modo de recuperación",
      description:
        "Usa 'Automático' para errores comunes o 'Reparación Profunda' (Agresiva) si el archivo está muy dañado y necesita reconstrucción total.",
    },
    {
      number: "3",
      title: "Recupera tu documento",
      description:
        "Haz clic en 'Reparar'. El sistema reconstruirá las tablas de referencias y objetos internos para generarte un nuevo archivo funcional.",
    },
  ],

  benefits: [
    {
      icon: "Stethoscope",
      title: "Diagnóstico Inteligente",
      description:
        "Antes de intentar arreglarlo, te decimos qué está mal. Detectamos tablas cruzadas (xref) rotas, streams corruptos o finales de archivo inválidos.",
    },
    {
      icon: "Hammer",
      title: "Reconstrucción Agresiva",
      description:
        "A diferencia de otros, no solo 'parchamos' el archivo. Nuestro modo agresivo desmonta y vuelve a ensamblar la estructura del PDF desde cero para salvar la mayor cantidad de datos.",
    },
    {
      icon: "Globe",
      title: "Optimización Web (Linearize)",
      description:
        "Además de reparar, podemos 'linearizar' tu PDF (Fast Web View). Esto permite que el archivo se abra instantáneamente en navegadores sin esperar a que se descargue completo.",
    },
    {
      icon: "Files",
      title: "Cualquier Origen",
      description:
        "Reparamos archivos dañados por descargas interrumpidas, fallos de disco duro, errores de envío por correo o generadores de PDF defectuosos.",
    },
  ],

  faqs: [
    // Preguntas Específicas
    {
      question: "¿Pueden recuperar cualquier archivo dañado?",
      answer:
        "Hacemos magia, pero no milagros. Si el archivo está vacío (0 bytes) o la información binaria ha sido sobrescrita completamente, es imposible recuperarlo. Sin embargo, tenemos una tasa de éxito muy alta en errores estructurales.",
    },
    {
      question: "¿Qué es el modo 'Reparación Profunda'?",
      answer:
        "Es un proceso intensivo donde ignoramos la estructura dañada y buscamos objetos recuperables (texto, imágenes) uno por uno para reconstruir un nuevo PDF válido. Úsalo si el modo automático falla.",
    },
    {
      question: "¿Mi archivo sigue teniendo el mismo contenido?",
      answer:
        "Sí. Nuestro objetivo es restaurar el acceso a tu contenido. En casos muy severos, es posible que se pierda alguna página específica que estaba irrecuperable, pero salvaremos el resto del documento.",
    },
    // Preguntas Generales
    {
      question: "¿El uso de esta herramienta es gratuito?",
      answer:
        "Sí, el análisis y la reparación son gratuitos. Queremos ayudarte a recuperar tu trabajo sin costes.",
    },
    {
      question: "¿Mis datos son privados?",
      answer:
        "Absolutamente. Nadie revisa el contenido de tus archivos dañados. Se procesan de forma automatizada y se eliminan de nuestros servidores tras la reparación.",
    },
    {
      question: "¿Por qué se daña un PDF?",
      answer:
        "Las causas más comunes son: descargas incompletas (corte de internet), fallos al guardar en un USB, virus, o errores al enviar el archivo por email.",
    },
  ],

  cta: {
    title: "¿No puedes abrir tu PDF?",
    description: "Intenta recuperarlo ahora con nuestra tecnología avanzada.",
    buttonLabel: "Reparar PDF ahora",
  },

  jsonLd: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Reparar PDF Online",
        applicationCategory: "UtilitiesApplication",
        featureList: [
          "Diagnóstico de integridad de archivo",
          "Recuperación de tablas XREF dañadas",
          "Modo de reconstrucción agresiva",
          "Linearización para vista web rápida",
          "Soporte para archivos corruptos"
        ],
        applicationSubCategory: "File Repair",
        fileFormat: ["application/pdf"],
        operatingSystem: "Any",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.6",
          ratingCount: "850",
        },
      },
      {
        "@type": "HowTo",
        name: "Cómo arreglar un PDF que no abre",
        step: [
          {
            "@type": "HowToStep",
            name: "Sube el archivo",
            text: "Carga el documento PDF corrupto para su análisis.",
          },
          {
            "@type": "HowToStep",
            name: "Verifica el estado",
            text: "Revisa el diagnóstico automático de errores.",
          },
          {
            "@type": "HowToStep",
            name: "Repara",
            text: "Ejecuta la recuperación y descarga el archivo restaurado.",
          },
        ],
      },
    ],
  },
};