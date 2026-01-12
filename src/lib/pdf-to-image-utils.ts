/**
 * Constantes y utilidades para conversión de PDF a Imagen
 */

import { ImageFormat, DpiOption } from "@/types";

// ============================================================================
// TYPES
// ============================================================================

export interface FormatInfo {
    label: string;
    description: string;
    supportsQuality: boolean;
    requiresServer: boolean;
    recommended?: boolean;
}

export type ProcessingMode = "client" | "server" | "auto";

// ============================================================================
// CONSTANTS
// ============================================================================

export const SERVER_ONLY_FORMATS: ImageFormat[] = ["tiff", "bmp"];

export const CLIENT_LIMITS = {
    maxFileSize: 20 * 1024 * 1024, // 20MB
    maxPages: 30,
    maxSelectedPages: 50,
};

export const FORMAT_INFO: Record<ImageFormat, FormatInfo> = {
    jpg: {
        label: "JPG",
        description: "Ideal para fotos",
        supportsQuality: true,
        requiresServer: false,
        recommended: true,
    },
    png: {
        label: "PNG",
        description: "Sin pérdida",
        supportsQuality: false,
        requiresServer: false,
    },
    webp: {
        label: "WebP",
        description: "Moderno",
        supportsQuality: true,
        requiresServer: false,
    },
    tiff: {
        label: "TIFF",
        description: "Profesional",
        supportsQuality: false,
        requiresServer: true,
    },
    bmp: {
        label: "BMP",
        description: "Legacy",
        supportsQuality: false,
        requiresServer: true,
    },
};

// ============================================================================
// HELPERS
// ============================================================================

export function shouldUseServer(
    file: File | null,
    totalPages: number,
    format: ImageFormat,
    dpi?: DpiOption
): { useServer: boolean; reason?: string } {
    if (!file) return { useServer: false };

    if (SERVER_ONLY_FORMATS.includes(format)) {
        return {
            useServer: true,
            reason: `El formato ${format.toUpperCase()} requiere procesamiento en servidor`,
        };
    }

    if (dpi && dpi > 300) {
        return {
            useServer: true,
            reason: "DPI alto requiere procesamiento en servidor",
        };
    }

    if (file.size > CLIENT_LIMITS.maxFileSize) {
        return {
            useServer: true,
            reason: "Archivo grande, procesando en servidor",
        };
    }

    if (totalPages > CLIENT_LIMITS.maxPages) {
        return {
            useServer: true,
            reason: "PDF con muchas páginas, procesando en servidor",
        };
    }


    return { useServer: false };
}

export function getFormatInfo(format: ImageFormat): FormatInfo {
    return FORMAT_INFO[format];
}

export function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
