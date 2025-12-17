"use client";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PdfToolbarProps } from "@/types";

export function PdfToolbar({
  onAdd,
  onReset,
  className,
}: PdfToolbarProps) {

  return (
    <div className={cn("flex flex-col lg:flex-row lg:items-center gap-4 mb-4", className)}>
      <div className="flex lg:flex-col items-center justify-end gap-2 lg:w-full">
        {onAdd && (
          <Button variant="default" onClick={onAdd} size="lg" className="cursor-pointer w-auto lg:w-full flex-1 lg:flex-none">
            <span className="font-medium">Añadir PDF</span>
            <Plus className="h-4 w-4" />
          </Button>
        )}
        {onReset && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outlineRed" size="lg" className="cursor-pointer w-auto lg:w-full flex-1 lg:flex-none">
                <span className="font-medium">Eliminar todo</span>
                <Trash2 className=" h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará todos los archivos cargados y no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onReset} className="bg-red-600 hover:bg-red-700 text-white border-none">
                  Continuar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
