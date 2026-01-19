"use client";

import { Lock, AlertCircle } from "lucide-react";
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
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
            <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Lock className="w-10 h-10 text-amber-600 dark:text-amber-500" />
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500" />
                </div>
            </div>

            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Archivo Protegido con Contraseña
            </h3>

            {fileName && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                    <span className="font-medium">{fileName}</span>
                </p>
            )}

            <p className="text-base text-zinc-700 dark:text-zinc-300 max-w-md mb-6">
                El PDF que estás intentando subir está protegido con contraseña.
                Por favor, desbloquéalo primero usando nuestra herramienta de desbloqueo.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
                <Button
                    onClick={handleGoToUnlock}
                    className="gap-2"
                >
                    <Lock className="w-4 h-4" />
                    Ir a Desbloquear PDF
                </Button>

                {onReset && (
                    <Button
                        onClick={onReset}
                        variant="outline"
                    >
                        Intentar con otro archivo
                    </Button>
                )}
            </div>

            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg max-w-md">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                    <strong>💡 Consejo:</strong> Si no conoces la contraseña del PDF,
                    lamentablemente no podremos procesarlo por razones de seguridad.
                </p>
            </div>
        </div>
    );
}
