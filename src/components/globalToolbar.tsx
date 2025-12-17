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

export interface GlobalToolbarProps {
  features?: {
    selection?: boolean;
    sorting?: boolean;
    rotation?: boolean;
    bulkActions?: boolean;
  };
  actions?: {
    // Selection
    onSelectAll?: () => void;
    onDeselectAll?: () => void;
    onInvertSelection?: () => void;
    // Sorting
    onSortAZ?: () => void;
    onSortZA?: () => void;
    // Rotation
    onRotateRights?: () => void;
    onRotateLefts?: () => void;
    onResetOrientation?: () => void;
    // Bulk Actions
    onDownloadSelected?: () => void;
    onDuplicateSelected?: () => void;
    onDeleteSelected?: () => void;
  };
  state?: {
    hasSelection?: boolean;
    isAllSelected?: boolean;
  };
}

export function GlobalToolbar({
  features = {
    selection: false,
    sorting: false,
    rotation: false,
    bulkActions: false,
  },
  actions = {},
  state = {},
}: GlobalToolbarProps) {

  // Desktop implementation
  const DesktopToolbar = () => (
    <div className="hidden lg:flex items-center gap-2 overflow-x-auto">

      <TooltipButton
        icon="check-square"
        disabled={!actions.onSelectAll}
        tooltip="Seleccionar todos los archivos"
        onClick={actions.onSelectAll}
      />

      <TooltipButton
        icon="square"
        disabled={!actions.onDeselectAll}
        tooltip="Deseleccionar todos los archivos"
        onClick={actions.onDeselectAll}
      />

      <TooltipButton
        icon="arrow-left-right"
        disabled={!actions.onInvertSelection}
        tooltip="Invertir selección"
        onClick={actions.onInvertSelection}
      />

      <Separator orientation="vertical" className="h-6 w-0.5 border-r mx-2" />

      <TooltipButton
        icon="sort-alpha-down"
        disabled={!actions.onSortAZ}
        tooltip="Ordenar alfabéticamente (A-Z)"
        onClick={actions.onSortAZ}
      />

      <TooltipButton
        icon="sort-alpha-down-alt"
        disabled={!actions.onSortZA}
        tooltip="Ordenar alfabéticamente (Z-A)"
        onClick={actions.onSortZA}
      />

      <Separator orientation="vertical" className="h-6 w-0.5 border-r mx-2" />

      <TooltipButton
        icon="arrow-clockwise"
        tooltip="Girar documentos 90° a la derecha"
        disabled={!actions.onRotateRights}
        onClick={actions.onRotateRights}
      />

      <TooltipButton
        icon="arrow-counterclockwise"
        tooltip="Girar documentos 90° a la izquierda"
        disabled={!actions.onRotateLefts}
        onClick={actions.onRotateLefts}
      />

      <TooltipButton
        icon="arrow-repeat"
        tooltip="Restablecer orientación"
        disabled={!actions.onResetOrientation}
        onClick={actions.onResetOrientation}
      />

      <Separator orientation="vertical" className="h-6 w-0.5 border-r mx-2" />

      <TooltipButton
        icon="download"
        tooltip="Descargar archivos seleccionados"
        disabled={!actions.onDownloadSelected || !state.hasSelection}
        onClick={actions.onDownloadSelected}
      />

      <TooltipButton
        icon="copy"
        tooltip="Duplicar archivos seleccionados"
        disabled={!actions.onDuplicateSelected || !state.hasSelection}
        onClick={actions.onDuplicateSelected}
      />

      <TooltipButton
        icon="x-lg"
        tooltip="Eliminar archivos seleccionados"
        disabled={!actions.onDeleteSelected || !state.hasSelection}
        onClick={actions.onDeleteSelected}
      />
    </div>
  );

  // Mobile implementation (Sheet)
  const MobileToolbar = () => (
    <div className="lg:hidden w-full">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" className="w-full justify-end px-0 mx-0" size="sm">
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

          <div className="overflow-y-auto h-full pb-8 px-4 space-y-6">

            {/* Grupo Selección */}
            {features.selection && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground ml-1">Opciones de Selección</h4>
                <div className="grid grid-cols-1 gap-2">
                  <SheetClose asChild>
                    <Button variant="outline" className="h-12 justify-start" disabled={!actions.onSelectAll} onClick={actions.onSelectAll}>
                      <BootstrapIcon name="check-square" size={20} />
                      <span>Seleccionar todos los archivos</span>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button variant="outline" className="h-12 justify-start" disabled={!actions.onDeselectAll} onClick={actions.onDeselectAll}>
                      <BootstrapIcon name="square" size={20} />
                      <span>Deseleccionar archivos seleccionados</span>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button variant="outline" className="h-12 justify-start" disabled={!actions.onInvertSelection} onClick={actions.onInvertSelection}>
                      <BootstrapIcon name="arrow-left-right" size={20} />
                      <span>Invertir selección</span>
                    </Button>
                  </SheetClose>
                </div>
              </div>
            )}

            {/* Grupo Orden */}
            {features.sorting && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground ml-1">Opciones de Ordenar</h4>
                <div className="grid grid-cols-1 gap-2">
                  <SheetClose asChild>
                    <Button variant="outline" className="h-12 justify-start" disabled={!actions.onSortAZ} onClick={actions.onSortAZ}>
                      <BootstrapIcon name="sort-alpha-down" size={20} />
                      <span>Ordenar alfabéticamente (A-Z)</span>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button variant="outline" className="h-12 justify-start" disabled={!actions.onSortZA} onClick={actions.onSortZA}>
                      <BootstrapIcon name="sort-alpha-down-alt" size={20} />
                      <span>Ordenar alfabéticamente (Z-A)</span>
                    </Button>
                  </SheetClose>
                </div>
              </div>
            )}

            {/* Grupo Rotación */}
            {features.rotation && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground ml-1">Opciones de Rotación</h4>
                <div className="grid grid-cols-1 gap-2">
                  <SheetClose asChild>
                    <Button variant="outline" className="h-12 justify-start" disabled={!actions.onRotateRights} onClick={actions.onRotateRights}>
                      <BootstrapIcon name="arrow-clockwise" size={20} />
                      <span>Girar documentos 90° a la derecha</span>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button variant="outline" className="h-12 justify-start" disabled={!actions.onRotateLefts} onClick={actions.onRotateLefts}>
                      <BootstrapIcon name="arrow-counterclockwise" size={20} />
                      <span>Girar documentos 90° a la izquierda</span>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button variant="outline" className="h-12 justify-start" disabled={!actions.onResetOrientation} onClick={actions.onResetOrientation}>
                      <BootstrapIcon name="arrow-repeat" size={20} />
                      <span>Restablecer Orientación</span>
                    </Button>
                  </SheetClose>
                </div>
              </div>
            )}

            {/* Grupo Acciones */}
            {features.bulkActions && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground ml-1">Acciones</h4>
                <div className="grid grid-cols-1 gap-2">
                  <SheetClose asChild>
                    <Button variant="outline" className="h-12 justify-start" disabled={!actions.onDownloadSelected || !state.hasSelection} onClick={actions.onDownloadSelected}>
                      <BootstrapIcon name="download" size={20} />
                      <span>Descargar archivos seleccionados</span>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button variant="outline" className="h-12 justify-start" disabled={!actions.onDuplicateSelected || !state.hasSelection} onClick={actions.onDuplicateSelected}>
                      <BootstrapIcon name="copy" size={20} />
                      <span>Duplicar archivos seleccionados</span>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button variant="outline" className="h-12 justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-900" disabled={!actions.onDeleteSelected || !state.hasSelection} onClick={actions.onDeleteSelected}>
                      <BootstrapIcon name="x-lg" color="red" size={20} />
                      <span>Eliminar archivos seleccionados</span>
                    </Button>
                  </SheetClose>
                </div>
              </div>
            )}

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
