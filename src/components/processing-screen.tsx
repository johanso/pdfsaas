import { useState, useEffect } from "react";
import {
  FileText,
  Sparkles,
  Zap,
  Shield,
  Clock,
  CheckCircle2,
  Download,
  Upload,
  Loader2,
  X,
  Settings2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "./ui/button";
import { formatBytes, formatTime } from "@/lib/format";

// Importar tipos desde el hook base consolidado
import type { UploadStats, ProcessingPhase } from "@/hooks/core/useToolProcessor";

// Re-exportar para compatibilidad con componentes que importan desde aquí
export type { UploadStats, ProcessingPhase };

// ============================================================================
// TYPES
// ============================================================================

/**
 * Fases de UI extendidas (incluye fases legacy para compatibilidad)
 */
export type UIPhase =
  | ProcessingPhase
  | "compressing" // Alias de "preparing" para UI
  | "ready"; // Alias de "complete" para UI

export interface SuccessDetails {
  originalSize?: number;
  compressedSize?: number;
  reductionPercentage?: number;
  savedBytes?: number;
}

export interface CustomTip {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}

export interface ProcessingScreenProps {
  /** Nombre del archivo siendo procesado */
  fileName?: string;

  /** Mensaje de operación actual */
  operation?: string;

  /** Progreso 0-100 */
  progress?: number;

  /** Si el proceso está completo */
  isComplete?: boolean;

  /** Fase actual del procesamiento */
  phase?: UIPhase;

  /** Estadísticas de upload en tiempo real */
  uploadStats?: UploadStats | null;

  /** Callback para descargar de nuevo */
  onDownload?: () => void;

  /** Callback para volver a editar */
  onEditAgain?: () => void;

  /** Callback para procesar otro archivo */
  onStartNew?: () => void;

  /** Callback para cancelar */
  onCancel?: () => void;

  /** Tip personalizado a mostrar */
  customTip?: string;

  /** Label del tip personalizado */
  customTipLabel?: string;

  /** Fun facts personalizados */
  customFunFacts?: string[];

  /** Tips personalizados con iconos */
  customTips?: CustomTip[];

  /** Descripción durante procesamiento */
  processingDescription?: string;

  /** Detalles de éxito (para compresión) */
  successDetails?: SuccessDetails;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_FUN_FACTS = [
  "El formato PDF fue creado por Adobe en 1993 y significa 'Portable Document Format'.",
  "Un PDF puede contener texto, imágenes, audio, video e incluso modelos 3D.",
  "El PDF más grande jamás creado tenía más de 1.5 millones de páginas.",
  "Los PDFs pueden protegerse con encriptación de hasta 256 bits.",
  "Más de 2.5 billones de PDFs se crean cada año en todo el mundo.",
  "El primer visor de PDF gratuito fue lanzado en 1994.",
  "Los PDFs pueden contener formularios interactivos y firmas digitales.",
  "Un PDF puede tener hasta 8.4 millones de páginas según la especificación.",
];

const DEFAULT_TIPS: CustomTip[] = [
  { icon: Zap, text: "Arrastra y suelta múltiples archivos para procesarlos en lote." },
  { icon: Shield, text: "Tus archivos se procesan de forma segura en nuestros servidores." },
  { icon: Clock, text: "El tiempo de procesamiento depende del tamaño y complejidad del PDF." },
  { icon: Sparkles, text: "Usa 'Organizar PDF' para reordenar páginas de forma visual." },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Normalizar fase de UI a fase interna
 */
function normalizePhase(phase: UIPhase): ProcessingPhase {
  switch (phase) {
    case "compressing":
      return "preparing";
    case "ready":
      return "complete";
    default:
      return phase as ProcessingPhase;
  }
}

/**
 * Obtener icono según la fase
 */
function getPhaseIcon(phase: UIPhase, isComplete: boolean) {
  if (isComplete) {
    return <CheckCircle2 className="h-12 w-12 text-green-500" />;
  }

  switch (phase) {
    case "preparing":
    case "compressing":
      return <Settings2 className="h-12 w-12 text-primary animate-pulse" />;
    case "uploading":
      return <Upload className="h-12 w-12 text-primary animate-pulse" />;
    case "processing":
      return <Loader2 className="h-12 w-12 text-primary animate-spin" />;
    case "downloading":
      return <Download className="h-12 w-12 text-primary animate-bounce" />;
    case "ready":
    case "complete":
      return <CheckCircle2 className="h-12 w-12 text-green-500 animate-bounce" />;
    case "error":
      return <X className="h-12 w-12 text-destructive" />;
    default:
      return <FileText className="h-12 w-12 text-primary animate-pulse" />;
  }
}

/**
 * Obtener clase de fondo del icono
 */
function getIconBgClass(phase: UIPhase, isComplete: boolean): string {
  if (isComplete || phase === "ready" || phase === "complete") {
    return "bg-green-500/20";
  }
  if (phase === "error") {
    return "bg-destructive/20";
  }
  return "bg-primary/10";
}

/**
 * Determinar si se puede cancelar en esta fase
 */
function canCancel(phase: UIPhase): boolean {
  return ["uploading", "compressing", "preparing"].includes(phase);
}

/**
 * Obtener texto de progreso según fase
 */
function getProgressText(
  phase: UIPhase,
  uploadStats: UploadStats | null
): string {
  if (phase === "uploading" && uploadStats) {
    return `${formatBytes(uploadStats.bytesUploaded)} / ${formatBytes(uploadStats.totalBytes)}`;
  }
  if (phase === "processing") {
    return "Procesando";
  }
  if (phase === "downloading") {
    return "Descargando";
  }
  return "Preparando";
}

// ============================================================================
// COMPONENT
// ============================================================================

const ProcessingScreen = ({
  fileName = "documento.pdf",
  operation = "Procesando",
  progress = 0,
  isComplete = false,
  phase = "uploading",
  uploadStats = null,
  onDownload,
  onEditAgain,
  onStartNew,
  onCancel,
  customTip,
  customTipLabel = "PROCESO",
  customFunFacts,
  customTips,
  processingDescription,
  successDetails,
}: ProcessingScreenProps) => {
  // Usar facts y tips personalizados o defaults
  const activeFunFacts = customFunFacts || DEFAULT_FUN_FACTS;
  const activeTips = customTips || DEFAULT_TIPS;

  // Estado local para rotación de contenido
  const [currentFact, setCurrentFact] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const [dots, setDots] = useState("");

  // Rotar fun facts cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % activeFunFacts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeFunFacts.length]);

  // Rotar tips cada 4 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % activeTips.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeTips.length]);

  // Animar puntos suspensivos
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const CurrentTipIcon = activeTips[currentTip].icon;
  const showCancelButton = canCancel(phase) && onCancel && !isComplete;
  const showProgressBar = !isComplete && phase !== "complete" && phase !== "ready";
  const showTipsAndFacts = !isComplete && phase !== "ready" && phase !== "complete";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xs">
      <div className="w-full max-w-lg px-6">
        {/* Main Card */}
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card p-8 shadow-xl">
          {/* Cancel Button */}
          {showCancelButton && (
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 z-10 flex items-center gap-1 px-3 py-1.5 bg-destructive text-white hover:bg-destructive/70 rounded-full text-xs font-medium transition-all cursor-pointer"
            >
              <X className="h-3 w-3" />
              <span className="leading-none">Cancelar</span>
            </button>
          )}

          {/* Animated Background Gradient */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div
              className="absolute -left-1/4 -top-1/4 h-96 w-96 animate-pulse rounded-full bg-primary/20 blur-3xl"
            />
            <div
              className="absolute -bottom-1/4 -right-1/4 h-96 w-96 animate-pulse rounded-full bg-accent/20 blur-3xl"
              style={{ animationDelay: "1s" }}
            />
          </div>

          <div className="relative z-10">
            {/* Icon Animation */}
            <div className="mb-6 flex justify-center">
              <div className="relative">
                {/* Spinning borders (only during active processing) */}
                {!isComplete && phase !== "ready" && phase !== "complete" && (
                  <>
                    <div
                      className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary"
                      style={{ animationDuration: "3s" }}
                    />
                    <div
                      className="absolute inset-2 animate-spin rounded-full border-4 border-transparent border-b-accent"
                      style={{ animationDuration: "2s", animationDirection: "reverse" }}
                    />
                  </>
                )}

                {/* Main icon container */}
                <div
                  className={`flex h-24 w-24 items-center justify-center rounded-full ${getIconBgClass(phase, isComplete)} transition-colors duration-500`}
                >
                  {getPhaseIcon(phase, isComplete)}
                </div>

                {/* Floating particles during upload */}
                {phase === "uploading" && !isComplete && (
                  <>
                    <div
                      className="absolute -right-2 top-4 h-2 w-2 animate-bounce rounded-full bg-primary"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="absolute -left-1 top-8 h-1.5 w-1.5 animate-bounce rounded-full bg-accent"
                      style={{ animationDelay: "0.3s" }}
                    />
                    <div
                      className="absolute bottom-2 right-0 h-1 w-1 animate-bounce rounded-full bg-primary"
                      style={{ animationDelay: "0.5s" }}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Status Text */}
            <div className="mb-4 text-center">
              <h2 className="mb-1 text-2xl font-bold text-foreground">
                {isComplete ? "¡Completado!" : `${operation}${dots}`}
              </h2>

              {/* Preparing/Compressing phase info */}
              {(phase === "compressing" || phase === "preparing") &&
                uploadStats &&
                !isComplete && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {uploadStats.currentFileName}
                      <span className="text-muted-foreground ml-2">
                        ({formatBytes(uploadStats.currentFileSize)})
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Preparando archivos...
                    </p>
                  </div>
                )}

              {/* Uploading phase info */}
              {phase === "uploading" && uploadStats && !isComplete && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {uploadStats.currentFileName}
                  </p>
                  {uploadStats.speed > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(uploadStats.speed)}/s • {formatTime(uploadStats.timeRemaining)} restante
                    </p>
                  )}
                </div>
              )}

              {/* Processing phase info */}
              {phase === "processing" && !isComplete && (
                <p className="text-sm text-muted-foreground">
                  {processingDescription || "Esto puede tardar unos segundos..."}
                </p>
              )}

              {/* Downloading phase info */}
              {phase === "downloading" && !isComplete && (
                <p className="text-sm text-muted-foreground">
                  Descargando resultado...
                </p>
              )}

              {/* Ready phase info */}
              {(phase === "ready" || phase === "complete") && !isComplete && (
                <p className="text-sm text-muted-foreground">
                  Tu archivo está listo
                </p>
              )}

              {/* Complete state info */}
              {isComplete && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Tu archivo se ha descargado exitosamente
                  </p>

                  {/* Success details (compression results) */}
                  {successDetails && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 mt-4 text-center">
                      <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">
                        Resultado de compresión
                      </p>
                      <div className="flex items-center justify-center gap-4">
                        <div className="text-left">
                          <p className="text-[10px] text-zinc-500 uppercase">Original</p>
                          <p className="text-sm font-bold">
                            {formatBytes(successDetails.originalSize || 0)}
                          </p>
                        </div>
                        <div className="h-8 w-px bg-green-500/30" />
                        <div className="text-left">
                          <p className="text-[10px] text-zinc-500 uppercase">Comprimido</p>
                          <p className="text-sm font-bold text-green-600 dark:text-green-400">
                            {formatBytes(successDetails.compressedSize || 0)}
                          </p>
                        </div>
                        <div className="h-8 w-px bg-green-500/30" />
                        <div className="text-left">
                          <p className="text-[10px] text-zinc-500 uppercase">Ahorro</p>
                          <p className="text-sm font-bold text-green-600 dark:text-green-400">
                            -{successDetails.reductionPercentage?.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {showProgressBar && (
              <div className="mb-6">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {getProgressText(phase, uploadStats)}
                  </span>
                  <span className="font-medium text-primary">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>
            )}

            {/* Completed Actions */}
            {isComplete && (
              <div className="space-y-4">
                <p className="text-sm font-medium text-center mb-4">
                  ¿Qué deseas hacer ahora?
                </p>

                {onDownload && (
                  <Button onClick={onDownload} className="w-full gap-2" size="lg">
                    <Download className="h-4 w-4" />
                    Descargar otra vez
                  </Button>
                )}

                <div className="flex flex-col lg:grid lg:grid-cols-2 gap-2">
                  {onEditAgain && (
                    <Button variant="outline" onClick={onEditAgain} className="w-full lg:w-auto">
                      Volver a editar
                    </Button>
                  )}
                  {onStartNew && (
                    <Button variant="outline" onClick={onStartNew} className="w-full lg:w-auto">
                      Procesar otro archivo
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Tip Section */}
            {showTipsAndFacts && (
              <div className="mb-4 rounded-xl border border-border/50 bg-muted/30 p-4 transition-all duration-500">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <CurrentTipIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {customTip ? customTipLabel : "CONSEJO"}
                    </p>
                    <p className="text-sm text-foreground leading-relaxed">
                      {customTip || activeTips[currentTip].text}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Fun Fact Section */}
            {showTipsAndFacts && (
              <div className="text-center">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  ¿SABÍAS QUE?
                </p>
                <p className="text-sm text-muted-foreground italic leading-relaxed transition-opacity duration-500">
                  "{activeFunFacts[currentFact]}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>Procesamiento seguro y privado</span>
        </div>
      </div>
    </div>
  );
};

export default ProcessingScreen;