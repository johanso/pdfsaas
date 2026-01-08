/**
 * Constantes y configuración para OCR PDF
 * Extraídas de useOcrPdf para mejor organización
 */

import { Loader2, Check, Info } from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

export type DpiOption = 150 | 300 | 600;

export interface Language {
    code: string;
    name: string;
}

// ============================================================================
// DPI OPTIONS
// ============================================================================

export const DPI_OPTIONS: { value: DpiOption; label: string; description: string }[] = [
    { value: 150, label: "150 DPI", description: "Rápido" },
    { value: 300, label: "300 DPI", description: "Estándar" },
    { value: 600, label: "600 DPI", description: "Alta calidad" },
];

// ============================================================================
// LANGUAGES
// ============================================================================

export const DEFAULT_LANGUAGES: Language[] = [
    { code: "spa", name: "Español" },
    { code: "eng", name: "English" },
    { code: "fra", name: "Français" },
    { code: "deu", name: "Deutsch" },
    { code: "por", name: "Português" },
    { code: "ita", name: "Italiano" },
];

// ============================================================================
// UI MESSAGES
// ============================================================================

export const OPERATION_MESSAGES = {
    processing: [
        "Reconociendo texto...",
        "Analizando documento...",
        "Procesando páginas...",
        "Aplicando OCR...",
        "Extrayendo contenido...",
    ],
};

export const PROCESSING_TIPS = [
    "No cierres el navegador mientras se procesa el archivo.",
    "El tiempo depende del número de páginas y la calidad seleccionada.",
    "Los documentos escaneados pueden tardar más en procesarse.",
    "Estamos convirtiendo tu PDF en texto seleccionable.",
    "Casi listo... finalizando el procesamiento.",
];

// ============================================================================
// FUN FACTS & TIPS
// ============================================================================

export const OCR_FUN_FACTS = [
    "El OCR (Reconocimiento Óptico de Caracteres) fue inventado en 1914 por Emanuel Goldberg.",
    "Ray Kurzweil desarrolló el primer sistema OCR capaz de leer cualquier tipo de letra en 1974.",
    "El OCR es fundamental para digitalizar bibliotecas enteras en Google Books.",
    "La tecnología OCR moderna usa redes neuronales profundas para mejorar la precisión.",
    "Tesseract es uno de los motores OCR de código abierto más populares en la actualidad.",
];

export const OCR_TIPS = [
    { icon: Loader2, text: "Un PDF más nítido resulta en un OCR más preciso." },
    { icon: Check, text: "Seleccionar el idioma correcto mejora drásticamente los resultados." },
    { icon: Info, text: "300 DPI es la resolución recomendada para la mayoría de documentos." },
];
