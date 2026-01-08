
// Core application types will go here
// For now, exporting common shared interfaces if any were missed, or placeholders
export interface ProcessingResult {
    success: boolean;
    blob?: Blob;
    fileName?: string;
    error?: string;
}

export interface UploadStats {
    uploadProgress: number;
    uploadSpeed: number;
    remainingTime: number;
}
