import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw } from "lucide-react";
import ProcessingScreen from "../processing-screen";
import { toast } from "sonner";

const ProcessingDemo = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isProcessing && !isComplete) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsComplete(true);
            clearInterval(interval);
            return 100;
          }
          return prev + Math.random() * 3 + 1;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [isProcessing, isComplete]);

  const startDemo = () => {
    setIsProcessing(true);
    setProgress(0);
    setIsComplete(false);
  };

  const resetDemo = () => {
    setIsProcessing(false);
    setProgress(0);
    setIsComplete(false);
  };

  const handleDownload = () => {
    toast.info("Descarga iniciada", {
      description: "Tu archivo está listo para descargar",
    })
    resetDemo();
  }

  const handleEditAgain = () => {
    toast.info("Volviendo a editar", {
      description: "Puedes seguir editando tu archivo",
    })
    resetDemo();
  }

  const handleDelete = () => {
    toast.error("Archivo eliminado", {
      description: "Tu archivo ha sido eliminado",
    })
    resetDemo();
  }

  const handleStartNew = () => {
    toast.info("Proceso reiniciado", {
      description: "Puedes subir un nuevo archivo",
    })
    resetDemo();
  }

  return (
    <>
      <div className="flex gap-4 justify-center">
        <Button onClick={startDemo} disabled={isProcessing && !isComplete}>
          <Play className="mr-2 h-4 w-4" />
          Ver Demo de Procesamiento
        </Button>
        {isProcessing && !isComplete && (
          <Button variant="outline" onClick={resetDemo}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reiniciar
          </Button>
        )}
      </div>

      {isProcessing && (
        <ProcessingScreen
          fileName="mi-documento-importante.pdf"
          operation="Uniendo PDFs"
          progress={Math.min(progress, 100)}
          isComplete={isComplete}
          onDownload={handleDownload}
          onEditAgain={handleEditAgain}
          onStartNew={handleStartNew}
        />
      )}
    </>
  );
};

export default ProcessingDemo;
