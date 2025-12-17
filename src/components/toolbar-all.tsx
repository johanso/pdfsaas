"use client";

import { Separator } from "@radix-ui/react-separator";
import { TooltipButton } from "./ui/tooltipButton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import BootstrapIcon from "@/components/bootstrapIcon";


export function ToolbarAll() {

  // Desktop implementation (existing)
  const DesktopToolbar = () => (
    <div className="hidden lg:flex items-center gap-2 overflow-x-auto">

      <TooltipButton
        icon="check-square"
        disabled={true}
        tooltip="Seleccionar todos los archivos"
        onClick={() => console.log('Seleccionar todo')}
      />

      <TooltipButton
        icon="square"
        disabled={true}
        tooltip="Deseleccionar todos los archivos"
        onClick={() => console.log('Seleccionar todo')}
      />

      <TooltipButton
        icon="arrow-left-right"
        disabled={true}
        tooltip="Invertir selección"
        onClick={() => console.log('Seleccionar todo')}
      />

      <Separator orientation="vertical" className="h-6 w-0.5 border-r mx-2" />

      <TooltipButton
        icon="sort-alpha-down"
        disabled={true}
        tooltip="Ordenar alfabéticamente (A-Z)"
        onClick={() => console.log('Seleccionar todo')}
      />

      <TooltipButton
        icon="sort-alpha-down-alt"
        disabled={true}
        tooltip="Ordenar alfabéticamente (Z-A)"
        onClick={() => console.log('Seleccionar todo')}
      />

      <Separator orientation="vertical" className="h-6 w-0.5 border-r mx-2" />

      <TooltipButton
        icon="arrow-clockwise"
        tooltip="Girar documentos 90° a la derecha"
        onClick={() => console.log('Seleccionar todo')}
      />

      <TooltipButton
        icon="arrow-counterclockwise"
        tooltip="Girar documentos 90° a la izquierda"
        onClick={() => console.log('Seleccionar todo')}
      />

      <TooltipButton
        icon="arrow-repeat"
        tooltip="Restablecer orientación"
        onClick={() => console.log('Seleccionar todo')}
      />

      <Separator orientation="vertical" className="h-6 w-0.5 border-r mx-2" />

      <TooltipButton
        icon="download"
        tooltip="Descargar archivos seleccionados"
        onClick={() => console.log('Seleccionar todo')}
      />

      <TooltipButton
        icon="copy"
        tooltip="Duplicar archivos seleccionados"
        onClick={() => console.log('Seleccionar todo')}
      />

      <TooltipButton
        icon="x-lg"
        tooltip="Eliminar archivos seleccionados"
        onClick={() => console.log('Seleccionar todo')}
      />

    </div>
  );

  // Mobile implementation (Sheet)
  const MobileToolbar = () => (
    <div className="lg:hidden w-full">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" className="w-full justify-between" size="sm">
            <span className="font-medium">Opciones de Edición</span>
            <Settings2 className="w-4 h-4 ml-2 size-5!" />
          </Button>
        </SheetTrigger>

        <SheetContent side="bottom" className="max-h-[85vh] rounded-t-xl">
          <SheetHeader>
            <SheetTitle>Opciones de Edición</SheetTitle>
            <SheetDescription>
              Selecciona una acción para aplicar a archivos seleccionados.
            </SheetDescription>
          </SheetHeader>

          <div className="overflow-y-auto h-full pb-20 px-4 space-y-6">

            {/* Grupo Selección */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground ml-1">Opciones de Selección</h4>
              <div className="grid grid-cols-1 gap-2">
                <SheetClose asChild>
                  <Button variant="outline" className="h-12 justify-start" disabled onClick={() => console.log('Sel all')}>
                    <BootstrapIcon name="check-square" size={20} />
                    <span>Seleccionar todos los archivos</span>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button variant="outline" className="h-12 justify-start" disabled onClick={() => console.log('Desel all')}>
                    <BootstrapIcon name="square" size={20} />
                    <span>Deseleccionar archivos seleccionados</span>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button variant="outline" className="h-12 justify-start" disabled onClick={() => console.log('Invert')}>
                    <BootstrapIcon name="arrow-left-right" size={20} />
                    <span>Invertir selección</span>
                  </Button>
                </SheetClose>
              </div>
            </div>

            {/* Grupo Orden */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground ml-1">Opciones de Ordenar</h4>
              <div className="grid grid-cols-1 gap-2">
                <SheetClose asChild>
                  <Button variant="outline" className="h-12 justify-start" disabled onClick={() => console.log('AZ')}>
                    <BootstrapIcon name="sort-alpha-down" size={20} />
                    <span>Ordenar alfabéticamente (A-Z)</span>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button variant="outline" className="h-12 justify-start" disabled onClick={() => console.log('ZA')}>
                    <BootstrapIcon name="sort-alpha-down-alt" size={20} />
                    <span>Ordenar alfabéticamente (Z-A)</span>
                  </Button>
                </SheetClose>
              </div>
            </div>

            {/* Grupo Rotación */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground ml-1">Opciones de Rotación</h4>
              <div className="grid grid-cols-1 gap-2">
                <SheetClose asChild>
                  <Button variant="outline" className="h-12 justify-start" onClick={() => console.log('Right')}>
                    <BootstrapIcon name="arrow-clockwise" size={20} />
                    <span>Girar documentos 90° a la derecha</span>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button variant="outline" className="h-12 justify-start" onClick={() => console.log('Left')}>
                    <BootstrapIcon name="arrow-counterclockwise" size={20} />
                    <span>Girar documentos 90° a la izquierda</span>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button variant="outline" className="h-12 justify-start" onClick={() => console.log('Reset')}>
                    <BootstrapIcon name="arrow-repeat" size={20} />
                    <span>Restablecer Orientación</span>
                  </Button>
                </SheetClose>
              </div>
            </div>

            {/* Grupo Acciones */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground ml-1">Acciones</h4>
              <div className="grid grid-cols-1 gap-2">
                <SheetClose asChild>
                  <Button variant="outline" className="h-12 justify-start" onClick={() => console.log('Download')}>
                    <BootstrapIcon name="download" size={20} />
                    <span>Descargar archivos seleccionados</span>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button variant="outline" className="h-12 justify-start" onClick={() => console.log('Duplicate')}>
                    <BootstrapIcon name="copy" size={20} />
                    <span>Duplicar archivos seleccionados</span>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button variant="outline" className="h-12 justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-900" onClick={() => console.log('Delete')}>
                    <BootstrapIcon name="x-lg" color="red" size={20} />
                    <span>Eliminar archivos seleccionados</span>
                  </Button>
                </SheetClose>
              </div>
            </div>

          </div>
        </SheetContent>
      </Sheet>
    </div>
  );

  return (
    <>
      <DesktopToolbar />
      <MobileToolbar />
    </>
  );
}
