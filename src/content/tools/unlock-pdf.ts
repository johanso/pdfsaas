import { ToolPageData } from "./types";

export const unlockPdfContent: ToolPageData = {
  id: "unlock-pdf",

  metadata: {
    title: "Desbloquear PDF - Quitar Contraseña de PDF Online Gratis",
    description: "Elimina la contraseña de tus documentos PDF protegidos. Desbloquea PDFs de forma segura y rápida sin perder calidad.",
    keywords: [
      "desbloquear pdf",
      "quitar contraseña pdf",
      "unlock pdf",
      "remover password pdf",
      "abrir pdf protegido",
      "pdf sin contraseña"
    ],
    canonical: "/desbloquear-pdf",
    ogImage: "/og-images/unlock-pdf.png",
  },

  titleSectionSteps: "Cómo desbloquear un PDF",
  titleSectionBenefits: "¿Por qué usar nuestro desbloqueador?",
  titleSectionFAQ: "Preguntas Frecuentes sobre desbloqueo de PDF",

  steps: [
    {
      number: "1",
      title: "Sube tu PDF protegido",
      description: "Arrastra y suelta tu archivo PDF protegido con contraseña o haz clic para seleccionarlo.",
    },
    {
      number: "2",
      title: "Ingresa la contraseña",
      description: "Escribe la contraseña correcta del PDF. Si no la conoces, no podremos desbloquearlo.",
    },
    {
      number: "3",
      title: "Descarga el PDF desbloqueado",
      description: "Obtén tu archivo PDF sin restricciones, listo para usar, editar y compartir.",
    },
  ],

  benefits: [
    {
      icon: "Unlock",
      title: "Eliminación segura",
      description: "Elimina la contraseña sin comprometer la seguridad ni la integridad del documento.",
    },
    {
      icon: "Zap",
      title: "Proceso rápido",
      description: "Desbloquea tus PDFs en segundos con nuestro algoritmo optimizado.",
    },
    {
      icon: "ShieldCheck",
      title: "Sin pérdida de calidad",
      description: "El documento original se mantiene intacto, sin modificaciones ni pérdida de datos.",
    },
    {
      icon: "Globe",
      title: "100% online",
      description: "No necesitas instalar software. Funciona directamente en tu navegador.",
    },
  ],

  faqs: [
    {
      question: "¿Es seguro desbloquear un PDF?",
      answer: "Sí, nuestro proceso es seguro. Los archivos se procesan en servidores seguros y se eliminan automáticamente después de un tiempo. No almacenamos tus contraseñas ni documentos.",
    },
    {
      question: "¿Qué pasa si no conozco la contraseña?",
      answer: "Lamentablemente, si no conoces la contraseña del PDF, no podemos desbloquearlo. La protección de PDF está diseñada para ser segura y no hay forma de evitarla sin la contraseña correcta.",
    },
    {
      question: "¿El documento original se modifica?",
      answer: "No, el documento se mantiene exactamente igual. Solo eliminamos la restricción de contraseña, sin alterar el contenido, formato ni calidad del archivo.",
    },
    {
      question: "¿Puedo desbloquear cualquier PDF?",
      answer: "Podemos desbloquear la mayoría de los PDFs protegidos con contraseña estándar. Sin embargo, algunos métodos de encriptación muy avanzados pueden no ser compatibles.",
    },
    {
      question: "¿Cuánto tiempo tarda el proceso?",
      answer: "Generalmente toma solo unos segundos. El tiempo exacto depende del tamaño del archivo y de la complejidad de la encriptación.",
    },
    {
      question: "¿Es gratuito?",
      answer: "Sí, nuestro servicio de desbloqueo de PDF es 100% gratuito y no requiere registro ni tarjeta de crédito.",
    },
  ],

  cta: {
    title: "¿Tienes un PDF protegido?",
    description: "Desbloquéalo ahora y recupera el acceso completo a tu documento.",
    buttonLabel: "Desbloquear PDF Ahora",
  },

  jsonLd: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Desbloquear PDF",
        applicationCategory: "UtilityApplication",
        featureList: [
          "Eliminación de contraseña",
          "Verificación de encriptación",
          "Procesamiento rápido",
          "Sin pérdida de calidad",
          "Seguridad garantizada",
        ],
        applicationSubCategory: "File Security",
        fileFormat: ["application/pdf"],
        operatingSystem: "Any",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "HowTo",
        name: "Cómo desbloquear un PDF",
        step: [
          {
            "@type": "HowToStep",
            name: "Sube el PDF",
            text: "Carga tu archivo PDF protegido con contraseña.",
          },
          {
            "@type": "HowToStep",
            name: "Ingresa contraseña",
            text: "Escribe la contraseña correcta del documento.",
          },
          {
            "@type": "HowToStep",
            name: "Descarga",
            text: "Obtén el PDF desbloqueado sin restricciones.",
          },
        ],
      },
    ],
  },
};
