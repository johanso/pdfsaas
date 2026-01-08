/**
 * Factory Hook - Crea hooks especializados para herramientas PDF
 * 
 * Este factory elimina la duplicación de código entre hooks similares,
 * permitiendo crear hooks completos con solo configuración.
 * 
 * @example
 * ```ts
 * export const useGrayscalePdf = createPdfToolHook({
 *   toolId: "grayscale-pdf",
 *   endpoint: "/api/worker/grayscale-pdf",
 *   operationName: "Convirtiendo a escala de grises",
 *   buildFormData: (file, options) => [["contrast", options.contrast]],
 * });
 * ```
 */

import { useCallback } from "react";
import {
    useToolProcessor,
    type ProcessingResult,
    type UploadStats,
    type ProgressWeights,
} from "../core/useToolProcessor";
import { mapProcessorPhaseToLegacy, type LegacyPhase } from "../core/phase-mapper";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Entrada de FormData como tupla [key, value]
 */
export type FormDataEntry = [string, string | Blob];

/**
 * Configuración para crear un hook de herramienta PDF
 */
export interface PdfToolConfig<TOptions, TResult extends ProcessingResult = ProcessingResult> {
    /** ID único de la herramienta */
    toolId: string;

    /** Endpoint de la API (puede ser función para endpoints dinámicos) */
    endpoint: string | ((options: TOptions) => string);

    /** Nombre de la operación mostrado al usuario */
    operationName: string;

    /** 
     * Construye las entradas de FormData específicas de la herramienta
     * El archivo ya se agrega automáticamente
     */
    buildFormData: (file: File, options: TOptions) => FormDataEntry[];

    /** 
     * Obtiene el nombre del archivo resultante
     * @default Usa result.fileName o agrega sufijo al nombre original
     */
    getFileName?: (result: TResult, originalName: string) => string;

    /**
     * Pesos de progreso personalizados
     * @default { preparing: 5, uploading: 35, processing: 50, downloading: 10 }
     */
    progressWeights?: Partial<ProgressWeights>;

    /**
     * Usar compresión GZIP en la subida
     * @default true
     */
    useGzipCompression?: boolean;

    /**
     * Tipo de respuesta esperada
     * @default "json"
     */
    responseType?: "json" | "blob";

    /**
     * Sufijo por defecto para el nombre del archivo
     * Solo se usa si getFileName no está definido
     * @example "-comprimido" → "documento-comprimido.pdf"
     */
    defaultFileNameSuffix?: string;
}

/**
 * Estado retornado por el hook creado
 */
export interface PdfToolHookState<TResult extends ProcessingResult = ProcessingResult> {
    // Estado del procesamiento
    isProcessing: boolean;
    isComplete: boolean;
    progress: number;
    phase: LegacyPhase;
    operation: string;
    uploadStats: UploadStats | null;
    result: TResult | null;
}

/**
 * Acciones retornadas por el hook creado
 */
export interface PdfToolHookActions<TOptions, TResult extends ProcessingResult = ProcessingResult> {
    /** Procesa un archivo con las opciones dadas */
    process: (file: File, options: TOptions) => Promise<TResult | null>;

    /** Descarga nuevamente el resultado */
    handleDownloadAgain: () => void;

    /** Reinicia el hook para procesar un nuevo archivo */
    handleStartNew: () => void;

    /** Cancela la operación en curso */
    cancelOperation: () => void;
}

/**
 * Hook completo retornado por el factory
 */
export type PdfToolHook<TOptions, TResult extends ProcessingResult = ProcessingResult> =
    PdfToolHookState<TResult> & PdfToolHookActions<TOptions, TResult>;

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Crea un hook especializado para una herramienta PDF
 * 
 * Este factory centraliza la lógica común de procesamiento y permite
 * crear hooks completos con solo configuración, eliminando duplicación.
 * 
 * @param config - Configuración de la herramienta
 * @returns Hook listo para usar en componentes
 */
export function createPdfToolHook<TOptions extends { fileName: string }, TResult extends ProcessingResult = ProcessingResult>(
    config: PdfToolConfig<TOptions, TResult>
): () => PdfToolHook<TOptions, TResult> {

    return function usePdfTool(): PdfToolHook<TOptions, TResult> {
        // Configuración con defaults
        const {
            toolId,
            endpoint,
            operationName,
            buildFormData,
            getFileName,
            progressWeights = {
                preparing: 5,
                uploading: 35,
                processing: 50,
                downloading: 10,
            },
            useGzipCompression = true,
            responseType = "json",
            defaultFileNameSuffix = "-procesado",
        } = config;

        // Usar el procesador central
        const processor = useToolProcessor<TOptions, TResult>({
            toolId,
            endpoint,
            operationName,
            useGzipCompression,
            responseType,
            progressWeights,

            // Preparar FormData con el archivo + campos específicos
            prepareFormData: async (files, options) => {
                const formData = new FormData();
                const file = files[0];

                // Agregar archivo
                formData.append("file", file);

                // Agregar campos específicos de la herramienta
                const entries = buildFormData(file, options);
                for (const [key, value] of entries) {
                    formData.append(key, value);
                }

                return formData;
            },

            // Obtener nombre del archivo resultante
            getResultFileName: getFileName || ((result, originalName) => {
                if (result.fileName) return result.fileName;
                return originalName.replace(".pdf", `${defaultFileNameSuffix}.pdf`);
            }),
        });

        // Mapear fase a formato legacy para compatibilidad con UI
        const legacyPhase = mapProcessorPhaseToLegacy(processor.phase);

        // API simplificada para el hook
        const process = useCallback(
            async (file: File, options: TOptions): Promise<TResult | null> => {
                return processor.process([file], options, options.fileName);
            },
            [processor]
        );

        return {
            // Estado
            isProcessing: processor.isProcessing,
            isComplete: processor.isComplete,
            progress: processor.progress,
            phase: legacyPhase,
            operation: processor.operation,
            uploadStats: processor.uploadStats,
            result: processor.result,

            // Acciones
            process,
            handleDownloadAgain: processor.downloadAgain,
            handleStartNew: processor.reset,
            cancelOperation: processor.cancel,
        };
    };
}
