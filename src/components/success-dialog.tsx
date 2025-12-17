"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, FileDown, ArrowRight, RotateCcw } from "lucide-react";

interface SuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: () => void;
  onStartNew: () => void;
  title?: string;
  description?: string;
}

export function SuccessDialog({
  open,
  onOpenChange,
  onContinue,
  onStartNew,
  title = "¡Descarga completada!",
  description = "¿Qué te gustaría hacer ahora?",
}: SuccessDialogProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (open) {
      setProgress(0);

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          // Non-linear progress simulation
          const remaining = 100 - prev;
          const increment = Math.max(1, Math.min(remaining, Math.ceil(remaining / 5)));
          return prev + increment;
        });
      }, 50); // Updates every 50ms, giving a smooth feel ~1-2s total

      return () => clearInterval(interval);
    }
  }, [open]);

  const isComplete = progress === 100;

  return (
    <Dialog open={open} onOpenChange={isComplete ? onOpenChange : undefined}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="justify-center p">
          <DialogTitle className="flex justify-center gap-2 mb-4">
            {isComplete ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                {title}
              </>
            ) : (
              <>
                <FileDown className="w-5 h-5 text-blue-500 animate-bounce" />
                Preparando descarga...
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-center mb-2">
            {isComplete ? description : "Tu archivo se está procesando y estará listo en unos segundos."}
          </DialogDescription>
        </DialogHeader>

        {!isComplete ? (
          <div className="py-6 space-y-4">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-center text-muted-foreground font-mono">
              {progress}% completado
            </p>
          </div>
        ) : null}

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-2">
          {isComplete && (
            <>
              <Button variant="outline" onClick={onContinue} className="sm:flex-1 order-2 sm:order-1">
                Seguir editando
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button onClick={onStartNew} className="sm:flex-1 order-1 sm:order-2">
                Nueva operación
                <RotateCcw className="w-4 h-4" />
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
