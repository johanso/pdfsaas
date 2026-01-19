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
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center animate-fade-in-up">
            {/* Icon - Editorial Style */}
            <div className="relative mb-8">
                <div className="w-24 h-24 rounded-2xl bg-accent/10 border-2 border-accent/20 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-accent/10">
                    <Lock className="w-12 h-12 text-accent" />
                </div>
                <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary/30 animate-pulse">
                    <AlertCircle className="w-6 h-6 text-primary-foreground" />
                </div>
            </div>

            {/* Title - Using Display Font */}
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3 tracking-tight">
                Archivo Protegido
            </h3>

            {/* Filename Badge */}
            {fileName && (
                <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-primary-soft border border-primary/20 backdrop-blur-sm">
                    <span className="text-sm font-medium text-foreground truncate max-w-[250px]">
                        {fileName}
                    </span>
                </div>
            )}

            {/* Description */}
            <p className="text-base md:text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
                Este PDF está protegido con contraseña y requiere desbloqueo.
                Usa nuestra herramienta especializada para continuar.
            </p>

            {/* Action Buttons - Editorial Style */}
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Button
                    onClick={handleGoToUnlock}
                    size="lg"
                    className="group gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
                >
                    <Lock className="w-4 h-4" />
                    Ir a Desbloquear PDF
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>

                {onReset && (
                    <Button
                        onClick={onReset}
                        variant="outline"
                        size="lg"
                        className="px-8 py-6 rounded-xl border-2 hover:bg-secondary-soft hover:border-secondary/30"
                    >
                        Intentar con otro archivo
                    </Button>
                )}
            </div>

            {/* Info Card - Editorial Style */}
            <div className="p-6 bg-gradient-card border border-border/50 rounded-2xl max-w-lg shadow-xl backdrop-blur-sm">
                <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-lg">💡</span>
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-semibold text-foreground mb-1">
                            Nota de seguridad
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Si no conoces la contraseña del PDF, no podremos procesarlo.
                            Esta limitación protege la privacidad y seguridad de los documentos.
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
