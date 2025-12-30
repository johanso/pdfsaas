import { useState, useEffect } from "react";
import {
  FileText, Sparkles, Zap, Shield, Clock, CheckCircle2, Download,
  Upload, Loader2, Gauge
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "./ui/button";
import { formatBytes, formatTime, type UploadStats } from "@/hooks/usePdfProcessing";

interface ProcessingScreenProps {
  fileName?: string;
  operation?: string;
  progress?: number;
  isComplete?: boolean;
  phase?: "idle" | "uploading" | "processing" | "ready";
  uploadStats?: UploadStats | null;
  onDownload?: () => void;
  onEditAgain?: () => void;
  onStartNew?: () => void;
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
  onStartNew
}: ProcessingScreenProps) => {
  const [currentFact, setCurrentFact] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const [dots, setDots] = useState("");

  // Rotate fun facts
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % funFacts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Rotate tips
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const CurrentTipIcon = tips[currentTip].icon;

  // Icono según fase
  const getPhaseIcon = () => {
    if (isComplete) {
      return <CheckCircle2 className="h-12 w-12 text-green-500" />;
    }
    switch (phase) {
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

              {/* Upload Stats - Similar a iLovePDF */}
              {phase === "uploading" && uploadStats && !isComplete && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {uploadStats.currentFileName}
                    <span className="text-muted-foreground ml-2">
                      ({formatBytes(uploadStats.currentFileSize)})
                    </span>
                  </p>
                  <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Tiempo restante: <span className="font-medium text-foreground">{formatTime(uploadStats.timeRemaining)}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Gauge className="h-3 w-3" />
                      Velocidad: <span className="font-medium text-foreground">{formatBytes(uploadStats.speed)}/s</span>
                    </span>
                  </div>
                </div>
              )}

              {phase === "processing" && !isComplete && (
                <p className="text-sm text-muted-foreground">
                  Esto puede tardar unos segundos...
                </p>
              )}

              {phase === "ready" && !isComplete && (
                <p className="text-sm text-muted-foreground">
                  Tu archivo está listo
                </p>
              )}

              {isComplete && (
                <p className="text-sm text-muted-foreground">
                  Tu archivo se ha descargado exitosamente
                </p>
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

                {/* Porcentaje grande estilo iLovePDF */}
                <div className="mt-4 text-center">
                  <span className="text-4xl font-bold text-foreground">{Math.round(progress)}%</span>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                    {phase === "uploading" ? "SUBIDO" : phase === "processing" ? "PROCESANDO" : "COMPLETADO"}
                  </p>
                </div>
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
                    <p className="text-xs font-medium text-muted-foreground mb-1">CONSEJO</p>
                    <p className="text-sm text-foreground leading-relaxed">
                      {tips[currentTip].text}
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
                  "{funFacts[currentFact]}"
                </p>
              </div>
            )}

            {/* Processing Steps Indicator */}
            {!isComplete && (
              <div className="mt-6 flex justify-center gap-2">
                <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${phase === "uploading"
                    ? "bg-primary text-primary-foreground"
                    : phase === "processing" || phase === "ready"
                      ? "bg-green-500/20 text-green-600"
                      : "bg-muted text-muted-foreground"
                  }`}>
                  <Upload className="h-3 w-3" />
                  <span>Subir</span>
                </div>
                <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${phase === "processing"
                    ? "bg-primary text-primary-foreground"
                    : phase === "ready"
                      ? "bg-green-500/20 text-green-600"
                      : "bg-muted text-muted-foreground"
                  }`}>
                  <Loader2 className={`h-3 w-3 ${phase === "processing" ? "animate-spin" : ""}`} />
                  <span>Procesar</span>
                </div>
                <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${phase === "ready"
                    ? "bg-green-500 text-white"
                    : "bg-muted text-muted-foreground"
                  }`}>
                  <Download className="h-3 w-3" />
                  <span>Descargar</span>
                </div>
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