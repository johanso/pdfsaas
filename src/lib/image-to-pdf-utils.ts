/**
 * Constantes y utilidades para conversión de Imagen a PDF
 */

export type ImageQuality = "original" | "compressed";

// ============================================================================
// CONSTANTS
// ============================================================================

export const CLIENT_LIMIT = 50;

export const PAGE_SIZES = {
    a4: { width: 595.28, height: 841.89 },
    letter: { width: 612, height: 792 },
    legal: { width: 612, height: 1008 },
};

export const MARGINS = {
    none: 0,
    small: 20,
    normal: 40,
};

// ============================================================================
// HELPERS
// ============================================================================

export function shouldUseServer(imageCount: number): {
    useServer: boolean;
    reason?: string;
} {
    if (imageCount >= CLIENT_LIMIT) {
        return {
            useServer: true,
            reason: `Más de ${CLIENT_LIMIT} imágenes, procesando en servidor`,
        };
    }
    return { useServer: false };
}

export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({ width: img.width, height: img.height });
            URL.revokeObjectURL(img.src);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

export async function imageToBytes(file: File, quality: ImageQuality): Promise<Uint8Array> {
    const buf = await file.arrayBuffer();
    if (quality === "compressed" && !file.type.includes("png")) {
        return convertToJpeg(file, 0.8);
    }
    return new Uint8Array(buf);
}

export async function convertToJpeg(file: File, quality = 0.9): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext("2d")!;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)));
                    } else {
                        reject(new Error("Error convirtiendo imagen"));
                    }
                },
                "image/jpeg",
                quality
            );

            URL.revokeObjectURL(img.src);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
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
