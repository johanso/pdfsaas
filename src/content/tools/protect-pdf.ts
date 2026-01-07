import { ToolPageData } from "./types";

export const protectPdfContent: ToolPageData = {
  id: "protect-pdf",

  metadata: {
    title: "Proteger PDF - Poner Contraseña y Encriptar Online",
    description: "Pon contraseña a tus archivos PDF. Asegura tus documentos con encriptación AES-256 o AES-128. Herramienta gratuita para bloquear el acceso a PDFs.",
    keywords: [
      "proteger pdf",
      "poner contraseña pdf",
      "encriptar pdf",
      "bloquear pdf con clave",
      "seguridad pdf online",
      "aes-256 pdf",
      "password protect pdf",
      "cerrar pdf con llave"
    ],
    canonical: "/proteger-pdf",
    ogImage: "/og-images/protect-pdf.jpg",
  },

  titleSectionSteps: "Cómo poner contraseña a un PDF online",
  titleSectionBenefits: "¿Por qué encriptar tus documentos con nuestra herramienta?",
  titleSectionFAQ: "Preguntas Frecuentes sobre seguridad y contraseñas PDF",

  steps: [
    {
      number: "1",
      title: "Sube el documento",
      description:
        "Arrastra tu archivo PDF confidencial. La conexión es segura y encriptada (SSL) desde el primer momento.",
    },
    {
      number: "2",
      title: "Define tu contraseña",
      description:
        "Escribe una clave segura (mínimo 4 caracteres). También puedes elegir el nivel de encriptación: Estándar (128-bit) o Máxima (256-bit).",
    },
    {
      number: "3",
      title: "Protege y Descarga",
      description:
        "Haz clic en 'Proteger PDF'. El archivo se cifrará inmediatamente y podrás descargarlo. Nadie podrá abrirlo sin tu clave.",
    },
  ],

  benefits: [
    {
      icon: "ShieldCheck",
      title: "Encriptación AES-256",
      description:
        "Utilizamos el estándar de cifrado avanzado de 256 bits, el mismo que utilizan bancos y gobiernos. Es virtualmente imposible de hackear por fuerza bruta.",
    },
    {
      icon: "Lock",
      title: "Privacidad Absoluta",
      description:
        "Nosotros no guardamos tu contraseña ni podemos recuperar tu archivo si la olvidas. Tú tienes el control total de la llave de acceso.",
    },
    {
      icon: "MonitorSmartphone",
      title: "Modo Compatible (128-bit)",
      description:
        "¿Necesitas enviar el archivo a alguien con un ordenador muy antiguo? Ofrecemos compatibilidad con AES-128 para asegurar que se pueda abrir en cualquier lector.",
    },
    {
      icon: "Trash2",
      title: "Borrado Automático",
      description:
        "Tu archivo original y el protegido se eliminan de nuestros servidores automáticamente tras la descarga. No dejamos rastro de tus datos.",
    },
  ],

  faqs: [
    // Preguntas Específicas
    {
      question: "¿Qué pasa si olvido la contraseña que puse?",
      answer:
        "Lamentablemente, no podrás abrir el archivo. Por seguridad, no almacenamos tu contraseña ni tenemos una 'puerta trasera' para recuperarla. Asegúrate de recordarla o guardarla en un gestor de contraseñas.",
    },
    {
      question: "¿Cuál es la diferencia entre AES-128 y AES-256?",
      answer:
        "**AES-256** es el estándar más seguro y moderno, recomendado para la mayoría de casos. **AES-128** es menos robusto pero ofrece mayor compatibilidad con lectores de PDF antiguos (anteriores a Acrobat 7.0).",
    },
    {
      question: "¿Pueden ustedes leer mi documento protegido?",
      answer:
        "No. El proceso de encriptación ocurre de forma automatizada. Una vez aplicada la contraseña, el contenido se vuelve ilegible para cualquiera que no tenga la clave, incluyéndonos a nosotros.",
    },
    // Preguntas Generales
    {
      question: "¿El uso de esta herramienta es gratuito?",
      answer:
        "Sí, puedes proteger tus documentos PDF de forma gratuita sin necesidad de registrarte ni instalar software.",
    },
    {
      question: "¿Funciona en Mac y Linux?",
      answer:
        "Sí, nuestra herramienta es basada en navegador, por lo que funciona perfectamente en Windows, macOS, Linux, Android e iOS.",
    },
    {
      question: "¿Qué longitud debe tener la contraseña?",
      answer:
        "Recomendamos un mínimo de 8 caracteres combinando letras y números para una seguridad real, aunque nuestro sistema permite proteger archivos con claves desde 4 caracteres.",
    },
  ],

  cta: {
    title: "Mantén tus secretos a salvo",
    description: "Bloquea el acceso a tus archivos sensibles en segundos.",
    buttonLabel: "Proteger PDF ahora",
  },

  jsonLd: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Proteger PDF Online",
        applicationCategory: "SecurityApplication",
        featureList: [
          "Encriptación AES-256 y AES-128",
          "Protección con contraseña de usuario",
          "Procesamiento seguro sin registros",
          "Compatible con todos los lectores PDF"
        ],
        applicationSubCategory: "File Encryption",
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
          ratingCount: "1050",
        },
      },
      {
        "@type": "HowTo",
        name: "Cómo poner contraseña a un PDF",
        step: [
          {
            "@type": "HowToStep",
            name: "Sube el PDF",
            text: "Carga el documento que deseas proteger.",
          },
          {
            "@type": "HowToStep",
            name: "Establece la clave",
            text: "Introduce una contraseña segura y elige el nivel de encriptación.",
          },
          {
            "@type": "HowToStep",
            name: "Descarga",
            text: "Baja el archivo encriptado a tu dispositivo.",
          },
        ],
      },
    ],
  },
};