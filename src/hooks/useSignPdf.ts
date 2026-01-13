import { createPdfToolHook } from "./factories/createPdfToolHook";
import type { ProcessingResult } from "./core/useToolProcessor";

export interface Signature {
    id: string;
    pageNumber: number;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    opacity: number;
    image: string; // base64
}

export interface SignPdfOptions {
    fileName: string;
    signatures: Signature[];
}

export interface SignPdfResult extends ProcessingResult {
    signaturesApplied: number;
    pages: number[];
}

export const useSignPdf = createPdfToolHook<SignPdfOptions, SignPdfResult>({
    toolId: "sign-pdf",
    endpoint: "/api/worker/sign-pdf",
    operationName: "Firmando PDF",

    buildFormData: (file, options) => {
        // Validar que haya al menos una firma
        if (!options.signatures || options.signatures.length === 0) {
            throw new Error("Se requiere al menos una firma para procesar el documento");
        }

        return [
            ["fileName", options.fileName],
            ["signatures", JSON.stringify(options.signatures)],
        ];
    },

    getFileName: (result, original) =>
        result.fileName || original.replace(".pdf", "-firmado.pdf"),

    progressWeights: {
        preparing: 10,
        uploading: 30,
        processing: 50,
        downloading: 10,
    },
});
