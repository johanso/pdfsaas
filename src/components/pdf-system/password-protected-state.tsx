"use client";

import { Lock, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface PasswordProtectedStateProps {
  fileName?: string;
  onReset?: () => void;
}

export function PasswordProtectedState({
  fileName,
  onReset
}: PasswordProtectedStateProps) {
  const router = useRouter();

  const handleGoToUnlock = () => {
    router.push("/desbloquear-pdf");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[350px] p-6 text-center animate-fade-in-up">
      {/* Icon - Editorial Style Compact */}
      <div className="relative mb-5">
        <div className="w-20 h-20 rounded-2xl bg-accent/10 border-2 border-accent/20 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-accent/10">
          <Lock className="w-10 h-10 text-accent" />
        </div>
        <div className="absolute -top-1.5 -right-1.5 w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary/30 animate-pulse">
          <AlertCircle className="w-5 h-5 text-primary-foreground" />
        </div>
      </div>

      {/* Title - Using Display Font */}
      <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2 tracking-tight">
        Archivo Protegido
      </h3>

      {/* Filename Badge */}
      {fileName && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 rounded-full bg-primary-soft border border-primary/20 backdrop-blur-sm">
          <span className="text-xs font-medium text-foreground truncate max-w-[220px]">
            {fileName}
          </span>
        </div>
      )}

      {/* Description */}
      <p className="text-sm md:text-base text-muted-foreground max-w-md mb-6 leading-relaxed">
        Este PDF está protegido con contraseña. Usa la herramienta de desbloqueo para continuar.
      </p>

      {/* Action Buttons - Editorial Style Compact */}
      <div className="flex flex-col sm:flex-row gap-2.5 mb-6">
        <Button
          onClick={handleGoToUnlock}
          size="default"
          className="group gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-5 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
        >
          <Lock className="w-4 h-4" />
          Ir a Desbloquear PDF
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>

        {onReset && (
          <Button
            onClick={onReset}
            variant="outline"
            size="default"
            className="px-6 py-5 rounded-xl border-2 hover:bg-secondary-soft hover:border-secondary/30"
          >
            Intentar con otro archivo
          </Button>
        )}
      </div>

      {/* Info Card - Editorial Style Compact */}
      <div className="p-4 bg-gradient-card border border-border/50 rounded-xl max-w-md shadow-xl backdrop-blur-sm">
        <div className="flex gap-2.5 items-start">
          <div className="w-7 h-7 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
            <span className="text-base">💡</span>
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-foreground mb-0.5">
              Nota de seguridad
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Si no conoces la contraseña, no podremos procesar el documento por razones de seguridad.
            </p>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
