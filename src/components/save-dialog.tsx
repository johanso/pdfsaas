"use client";

import { useState } from "react";
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
}

export function SaveDialog({
    open,
    onOpenChange,
    defaultName,
    onSave,
    isProcessing,
    title = "Guardar archivo",
    description = "Asigna un nombre a tu archivo PDF antes de descargarlo."
}: SaveDialogProps) {
    const [name, setName] = useState(defaultName);
    const [error, setError] = useState(false);

    const handleSave = () => {
        if (!name.trim()) {
            setError(true);
            return;
        }
        setError(false);
        onSave(name);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="filename" className="text-right">
                            Nombre
                        </Label>
                        <div className="col-span-3 flex items-center gap-2">
                            <Input
                                id="filename"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (e.target.value.trim()) setError(false);
                                }}
                                className={cn("col-span-3", error && "border-red-500 focus-visible:ring-red-500")}
                                placeholder="nombre-archivo"
                            />
                            <span className="text-sm text-zinc-500">.pdf</span>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={isProcessing}>
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
