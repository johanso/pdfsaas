import { ToolPageData } from "./types";

export const signPdfContent: ToolPageData = {
    id: "firmar-pdf",

    metadata: {
        title: "Firmar PDF - Añade tu firma digital gratis online",
        description: "La mejor herramienta para firmar documentos PDF online. Dibuja tu firma, sube una imagen o escribe tu nombre. Fácil, rápido y seguro.",
        keywords: ["firmar pdf", "firma digital", "firmar documentos online", "firma electronica gratis"],
        canonical: "/firmar-pdf",
    },

    steps: [
        { number: "1", title: "Sube tu PDF", description: "Arrastra y suelta tu archivo o selecciónalo de tu dispositivo." },
        { number: "2", title: "Crea tu firma", description: "Dibuja, escribe o sube una imagen de tu firma." },
        { number: "3", title: "Firma y descarga", description: "Coloca la firma donde quieras y descarga tu documento firmado." },
    ],

    benefits: [
        { icon: "PenTool", title: "Múltiples opciones", description: "Dibuja tu firma, escribe tu nombre o sube una imagen." },
        { icon: "Shield", title: "100% Seguro", description: "Tus documentos se procesan de forma segura y se eliminan después." },
        { icon: "Zap", title: "Rápido y Fácil", description: "Interfaz intuitiva para firmar tus documentos en segundos." },
    ],

    faqs: [
        { question: "¿Es legal firmar PDFs online?", answer: "Sí, las firmas electrónicas son legalmente vinculantes en la mayoría de los países para muchos tipos de documentos." },
        { question: "¿Puedo firmar desde el móvil?", answer: "¡Absolutamente! Nuestra herramienta está optimizada para funcionar perfectamente en dispositivos táctiles." },
        { question: "¿Guardan mi firma?", answer: "No, tu firma se usa solo para el documento actual y no se almacena en nuestros servidores." },
    ],

    cta: {
        title: "¿Listo para firmar?",
        description: "Firma tus documentos de manera profesional en segundos.",
        buttonLabel: "Firmar PDF ahora",
    },

    jsonLd: {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Firmar PDF",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        }
    },
};
