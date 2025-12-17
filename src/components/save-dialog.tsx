"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface SaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultName: string;
  onSave: (name: string) => void;
  isProcessing: boolean;
  title?: string;
  description?: string;
  extension?: string;
}

// Caracteres no permitidos en nombres de archivo
const INVALID_CHARS = /[<>:"/\\|?*\x00-\x1F]/g;

export function SaveDialog({
  open,
  onOpenChange,
  defaultName,
  onSave,
  isProcessing,
  title = "Guardar archivo",
  description = "Asigna un nombre a tu archivo PDF antes de descargarlo.",
  extension = "pdf"
}: SaveDialogProps) {
  const [name, setName] = useState(defaultName);
  const [error, setError] = useState<string | null>(null);

  // Reset name when dialog opens or defaultName changes
  useEffect(() => {
    if (open) {
      setName(defaultName);
      setError(null);
    }
  }, [open, defaultName]);

  const validateName = (value: string): string | null => {
    if (!value.trim()) {
      return "El nombre no puede estar vacío";
    }
    if (INVALID_CHARS.test(value)) {
      return 'Caracteres no permitidos: < > : " / \\ | ? *';
    }
    if (value.length > 255) {
      return "El nombre es demasiado largo (máx. 255 caracteres)";
    }
    return null;
  };

  const handleNameChange = (value: string) => {
    setName(value);
    const validationError = validateName(value);
    setError(validationError);
  };

  const handleSave = () => {
    const validationError = validateName(name);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Sanitize name by removing invalid chars
    const sanitizedName = name.replace(INVALID_CHARS, "").trim();
    onSave(sanitizedName);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !error && !isProcessing) {
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="filename" className="text-right">
              Nombre
            </Label>
            <div className="col-span-3 space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  id="filename"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={cn(
                    "flex-1",
                    error && "border-red-500 focus-visible:ring-red-500"
                  )}
                  placeholder="nombre-archivo"
                  disabled={isProcessing}
                />
                <span className="text-sm text-zinc-500 shrink-0">.{extension}</span>
              </div>
              {error && (
                <p className="text-xs text-red-500">{error}</p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isProcessing || !!error}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              "Descargar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}