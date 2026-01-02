import { ToolPageData } from "./types";

export const htmlToPdfContent: ToolPageData = {
  id: "html-to-pdf",

  metadata: {
    title: "HTML a PDF - Convertir URL y Web a PDF con Estilo Perfecto",
    description: "Convierte URLs y archivos HTML a PDF. Elige vista móvil o escritorio. Nuestro motor basado en Chromium procesa JavaScript y elimina popups de cookies automáticamente.",
    keywords: [
      "html a pdf",
      "url a pdf",
      "convertir web a pdf",
      "guardar pagina web como pdf",
      "imprimir web a pdf",
      "html to pdf online",
      "descargar pagina web pdf"
    ],
    canonical: "/html-a-pdf",
    ogImage: "/og-images/html-to-pdf.jpg",
  },

  titleSectionSteps: "Cómo guardar una página web en PDF con alta calidad",
  titleSectionBenefits: "¿Por qué usar nuestro conversor de Web a PDF?",
  titleSectionFAQ: "Preguntas Frecuentes sobre conversión web",

  steps: [
    {
      number: "1",
      title: "Introduce la URL o Archivo",
      description:
        "Pega la dirección de la página web que quieres capturar o sube tu propio archivo .html/.htm local.",
    },
    {
      number: "2",
      title: "Elige la vista (Viewport)",
      description:
        "¿Quieres ver la web como en un móvil o como en un PC? Selecciona la resolución y ajusta los márgenes a tu gusto.",
    },
    {
      number: "3",
      title: "Genera el PDF",
      description:
        "Nuestro motor navegará por la web, cargará todo el contenido dinámico y generará un archivo PDF limpio y listo para descargar.",
    },
  ],

  benefits: [
    {
      icon: "Chromium",
      title: "Renderizado Real (Chromium)",
      description:
        "Usamos un navegador real en el servidor. Esto significa que las webs modernas con JavaScript, gráficos y fuentes complejas se ven perfectas, tal como en tu pantalla.",
    },
    {
      icon: "Smartphone",
      title: "Diseño Responsivo",
      description:
        "Único en su clase: elige generar el PDF con vista de 'Móvil', 'Tablet' o 'Escritorio'. Ideal para testear diseños o guardar artículos en formato lectura.",
    },
    {
      icon: "Ghost",
      title: "Bloqueo de Popups",
      description:
        "Nuestro sistema intenta detectar y cerrar automáticamente los molestos banners de cookies y ventanas modales antes de tomar la captura para el PDF.",
    },
    {
      icon: "Layout",
      title: "Márgenes Personalizables",
      description:
        "¿Lo quieres para leer o para imprimir? Ajusta los márgenes a 'Estrechos' para aprovechar el papel o 'Sin márgenes' para un diseño continuo.",
    },
  ],

  faqs: [
    // Preguntas Específicas
    {
      question: "¿Puedo convertir páginas que requieren contraseña?",
      answer:
        "No. Por seguridad, nuestra herramienta solo puede acceder a páginas web públicas. Si necesitas convertir una página privada (como tu banca online), guarda el archivo HTML en tu PC y súbelo aquí.",
    },
    {
      question: "¿Por qué el PDF se ve diferente a la web?",
      answer:
        "Las webs son dinámicas y el PDF es estático. Sin embargo, ofrecemos la opción de cambiar el 'Viewport' (Resolución). Si la web se ve cortada, prueba seleccionando la opción 'Escritorio Grande'.",
    },
    {
      question: "¿Se cargan las imágenes diferidas (Lazy Loading)?",
      answer:
        "Sí. Nuestro motor hace un desplazamiento automático (scroll) por toda la página antes de generar el PDF para asegurar que todas las imágenes y gráficos se carguen correctamente.",
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
        "Totalmente. Los archivos HTML subidos y los PDFs generados se eliminan automáticamente de nuestros servidores a los 10 minutos.",
    },
    {
      question: "¿Funciona en móviles?",
      answer:
        "Sí, puedes pegar una URL desde tu navegador móvil y obtener el PDF al instante.",
    },
  ],

  cta: {
    title: "Captura la web en PDF",
    description: "Guarda artículos, facturas y diseños web al instante.",
    buttonLabel: "Convertir ahora",
  },

  jsonLd: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "HTML a PDF Online",
        applicationCategory: "ProductivityApplication",
        featureList: [
          "Conversión de URL pública a PDF",
          "Conversión de archivos HTML locales",
          "Selector de Viewport (Móvil/Desktop)",
          "Eliminación automática de banners de cookies",
          "Soporte para JavaScript y CSS3"
        ],
        applicationSubCategory: "Web Converter",
        fileFormat: ["text/html", "application/pdf"],
        operatingSystem: "Any",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          ratingCount: "980",
        },
      },
      {
        "@type": "HowTo",
        name: "Cómo convertir una URL a PDF",
        step: [
          {
            "@type": "HowToStep",
            name: "Ingresa la URL",
            text: "Copia y pega la dirección web o sube un archivo HTML.",
          },
          {
            "@type": "HowToStep",
            name: "Configura la vista",
            text: "Elige si quieres la versión móvil o escritorio de la web.",
          },
          {
            "@type": "HowToStep",
            name: "Descarga",
            text: "Obtén el archivo PDF renderizado con alta fidelidad.",
          },
        ],
      },
    ],
  },
};