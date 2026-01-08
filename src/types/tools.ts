
// PDF to Image / Image to PDF conversion types
export type ImageFormat = "jpg" | "png" | "webp" | "tiff" | "bmp";
export type DpiOption = 72 | 150 | 300 | 600;

export interface FormatInfo {
    label: string;
    description: string;
    supportsQuality: boolean;
    requiresServer: boolean;
    recommended?: boolean;
}
