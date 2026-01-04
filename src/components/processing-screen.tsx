import { useState, useEffect } from "react";
import {
  FileText, Sparkles, Zap, Shield, Clock, CheckCircle2, Download,
  Upload, Loader2, Gauge, X
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "./ui/button";
import { formatBytes, formatTime, type UploadStats } from "@/hooks/usePdfProcessing";

interface ProcessingScreenProps {
  fileName?: string;
  operation?: string;
  progress?: number;
  isComplete?: boolean;
  phase?: "idle" | "compressing" | "uploading" | "processing" | "ready";
  uploadStats?: UploadStats | null;
  onDownload?: () => void;
  onEditAgain?: () => void;
  onStartNew?: () => void;
  onCancel?: () => void;
  customTip?: string;
  customTipLabel?: string;
  customFunFacts?: string[];
  customTips?: { icon: any; text: string }[];
  processingDescription?: string;
  successDetails?: {
    originalSize?: number;
    compressedSize?: number;
    reductionPercentage?: number;
    savedBytes?: number;
  };
}

const funFacts = [
  "El formato PDF fue creado por Adobe en 1993 y significa 'Portable Document Format'.",
  "Un PDF puede contener texto, imágenes, audio, video e incluso modelos 3D.",
  "El PDF más grande jamás creado tenía más de 1.5 millones de páginas.",
  "Los PDFs pueden protegerse con encriptación de hasta 256 bits.",
  "Más de 2.5 billones de PDFs se crean cada año en todo el mundo.",
  "El primer visor de PDF gratuito fue lanzado en 1994.",
  "Los PDFs pueden contener formularios interactivos y firmas digitales.",
  "Un PDF puede tener hasta 8.4 millones de páginas según la especificación.",
];

const tips = [
  { icon: Zap, text: "Arrastra y suelta múltiples archivos para procesarlos en lote." },
  { icon: Shield, text: "Tus archivos se procesan de forma segura en nuestros servidores." },
  { icon: Clock, text: "El tiempo de procesamiento depende del tamaño y complejidad del PDF." },
  { icon: Sparkles, text: "Usa 'Organizar PDF' para reordenar páginas de forma visual." },
];

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
  const activeFunFacts = customFunFacts || funFacts;
  const activeTips = customTips || tips;

  const [currentFact, setCurrentFact] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const [dots, setDots] = useState("");

  // Rotate fun facts
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % activeFunFacts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeFunFacts.length]);

  // Rotate tips
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % activeTips.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeTips.length]);

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const CurrentTipIcon = activeTips[currentTip].icon;

  // Icono según fase
  const getPhaseIcon = () => {
    if (isComplete) {
      return <CheckCircle2 className="h-12 w-12 text-green-500" />;
    }
    switch (phase) {
      case "compressing":
        return <Upload className="h-12 w-12 text-primary animate-pulse" />;
      case "uploading":
        return <Upload className="h-12 w-12 text-primary animate-pulse" />;
      case "processing":
        return <Loader2 className="h-12 w-12 text-primary animate-spin" />;
      case "ready":
        return <Download className="h-12 w-12 text-green-500 animate-bounce" />;
      default:
        return <FileText className="h-12 w-12 text-primary animate-pulse" />;
    }
  };

  // Color del fondo del icono
  const getIconBgClass = () => {
    if (isComplete || phase === "ready") return "bg-green-500/20";
    return "bg-primary/10";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xs">
      <div className="w-full max-w-lg px-6">
        {/* Main Card */}
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card p-8 shadow-xl">
          {(phase === "uploading" || phase === "compressing") && onCancel && (
            <div onClick={onCancel} className={`absolute top-4 right-4 z-10 flex items-center gap-1 px-3 py-1.5 bg-destructive text-white hover:bg-destructive/70 rounded-full text-xs font-medium transition-all cursor-pointer`}>
              <X className="h-3 w-3" />
              <span className="leading-none">Cancelar</span>
            </div>
          )}

          {/* Animated Background Gradient */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute -left-1/4 -top-1/4 h-96 w-96 animate-pulse rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-1/4 -right-1/4 h-96 w-96 animate-pulse rounded-full bg-accent/20 blur-3xl" style={{ animationDelay: "1s" }} />
          </div>

          <div className="relative z-10">
            {/* Icon Animation */}
            <div className="mb-6 flex justify-center">
              <div className="relative">
                {!isComplete && phase !== "ready" && (
                  <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" style={{ animationDuration: "3s" }} />
                )}
                {!isComplete && phase !== "ready" && (
                  <div className="absolute inset-2 animate-spin rounded-full border-4 border-transparent border-b-accent" style={{ animationDuration: "2s", animationDirection: "reverse" }} />
                )}
                <div className={`flex h-24 w-24 items-center justify-center rounded-full ${getIconBgClass()} transition-colors duration-500`}>
                  {getPhaseIcon()}
                </div>
                {phase === "uploading" && !isComplete && (
                  <>
                    <div className="absolute -right-2 top-4 h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0.1s" }} />
                    <div className="absolute -left-1 top-8 h-1.5 w-1.5 animate-bounce rounded-full bg-accent" style={{ animationDelay: "0.3s" }} />
                    <div className="absolute bottom-2 right-0 h-1 w-1 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0.5s" }} />
                  </>
                )}
              </div>
            </div>

            {/* Status Text */}
            <div className="mb-4 text-center">
              <h2 className="mb-1 text-2xl font-bold text-foreground">
                {isComplete ? "¡Completado!" : `${operation}${dots}`}
              </h2>

              {phase === "compressing" && uploadStats && !isComplete && (
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

              {phase === "uploading" && uploadStats && !isComplete && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {uploadStats.currentFileName}
                  </p>
                  <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Restante: <span className="font-medium text-foreground">{formatTime(uploadStats.timeRemaining)}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Gauge className="h-3 w-3" />
                      <span className="font-medium text-foreground">{formatBytes(uploadStats.speed)}/s</span>
                    </span>
                  </div>
                </div>
              )}

              {phase === "processing" && !isComplete && (
                <p className="text-sm text-muted-foreground">
                  {processingDescription || "Esto puede tardar unos segundos..."}
                </p>
              )}

              {phase === "ready" && !isComplete && (
                <p className="text-sm text-muted-foreground">
                  Tu archivo está listo
                </p>
              )}

              {isComplete && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Tu archivo se ha descargado exitosamente
                  </p>
                  {successDetails && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 mt-4 text-center">
                      <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">
                        Resultado de compresión
                      </p>
                      <div className="flex items-center justify-center gap-4">
                        <div className="text-left">
                          <p className="text-[10px] text-zinc-500 uppercase">Original</p>
                          <p className="text-sm font-bold">{formatBytes(successDetails.originalSize || 0)}</p>
                        </div>
                        <div className="h-8 w-px bg-green-500/30"></div>
                        <div className="text-left">
                          <p className="text-[10px] text-zinc-500 uppercase">Comprimido</p>
                          <p className="text-sm font-bold text-green-600 dark:text-green-400">{formatBytes(successDetails.compressedSize || 0)}</p>
                        </div>
                        <div className="h-8 w-px bg-green-500/30"></div>
                        <div className="text-left">
                          <p className="text-[10px] text-zinc-500 uppercase">Ahorro</p>
                          <p className="text-sm font-bold text-green-600 dark:text-green-400">-{successDetails.reductionPercentage?.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {!isComplete && (
              <div className="mb-6">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {phase === "uploading" && uploadStats
                      ? `${formatBytes(uploadStats.bytesUploaded)} / ${formatBytes(uploadStats.totalBytes)}`
                      : phase === "processing"
                        ? "Procesando"
                        : "Preparando"
                    }
                  </span>
                  <span className="font-medium text-primary">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>
            )}

            {/* Completed actions */}
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
                  <Button variant="outline" onClick={onEditAgain} className="w-full lg:w-auto">
                    Volver a editar
                  </Button>
                  <Button variant="outline" onClick={onStartNew} className="w-full lg:w-auto">
                    Procesar otro archivo
                  </Button>
                </div>
              </div>
            )}

            {/* Tip Section - Solo durante upload/processing */}
            {!isComplete && phase !== "ready" && (
              <div className="mb-4 rounded-xl border border-border/50 bg-muted/30 p-4 transition-all duration-500">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <CurrentTipIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    {customTip ? (
                      <p className="text-xs font-medium text-muted-foreground mb-1">{customTipLabel}</p>
                    ) : (
                      <p className="text-xs font-medium text-muted-foreground mb-1">CONSEJO</p>
                    )}
                    <p className="text-sm text-foreground leading-relaxed">
                      {customTip || activeTips[currentTip].text}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Fun Fact - Solo durante upload/processing */}
            {!isComplete && phase !== "ready" && (
              <div className="text-center">
                <p className="text-xs font-medium text-muted-foreground mb-2">¿SABÍAS QUE?</p>
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