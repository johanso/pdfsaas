"use client";

import { Separator } from "./ui/separator";
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
    <div className="hidden lg:absolute top-0 left-0 lg:flex lg:flex-col lg:pb-1 justify-end items-center gap-2 overflow-x-auto">

      {/* Grupo Selección */}
      {features.selection && (
        <>
          <TooltipButton
            icon="check-square"
            disabled={!actions.onSelectAll}
            tooltip="Seleccionar todos"
            onClick={actions.onSelectAll}
          />

          <TooltipButton
            icon="square"
            disabled={!actions.onDeselectAll}
            tooltip="Deseleccionar todos"
            onClick={actions.onDeselectAll}
          />

          <TooltipButton
            icon="arrow-left-right"
            disabled={!actions.onInvertSelection}
            tooltip="Invertir selección"
            onClick={actions.onInvertSelection}
          />
        </>
      )}

      {/* Grupo Orden */}
      {features.sorting && (
        <>
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
        </>
      )}

      {/* Grupo Rotación */}
      {features.rotation && (
        <>
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
        </>
      )}

      {/* Grupo Acciones */}
      {features.bulkActions && (
        <>
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
        </>
      )}
    </div>
  );

  // Mobile implementation (Sheet)
  const MobileToolbar = () => (
    <div className="lg:hidden w-full">
      {/* Grupo Selección */}
      {features.selection && (
        <div className="space-y-2">
          <div className="grid grid-cols-1 gap-2">
            <Button variant="ghost" className="h-8 p-0! justify-start" disabled={!actions.onSelectAll} onClick={actions.onSelectAll}>
              <BootstrapIcon name="check-square" size={22} />
              <span className="text-sm font-normal ml-1">Seleccionar todos los documentos</span>
            </Button>

            <Button variant="ghost" className="h-8 p-0! justify-start" disabled={!actions.onDeselectAll} onClick={actions.onDeselectAll}>
              <BootstrapIcon name="square" size={22} />
              <span className="text-sm font-normal ml-1">Deseleccionar todos los documentos</span>
            </Button>

            <Button variant="ghost" className="h-8 p-0! justify-start" disabled={!actions.onInvertSelection} onClick={actions.onInvertSelection}>
              <BootstrapIcon name="arrow-left-right" size={22} />
              <span className="text-sm font-normal ml-1">Invertir selección de documentos</span>
            </Button>

            <Separator className="my-2" />
          </div>
        </div>
      )}

      {/* Grupo Orden */}
      {features.sorting && (
        <div className="space-y-2">
          <div className="grid grid-cols-1 gap-2">
            <Button variant="ghost" className="h-8 p-0! justify-start" disabled={!actions.onSortAZ} onClick={actions.onSortAZ}>
              <BootstrapIcon name="sort-alpha-down" size={22} />
              <span className="text-sm font-normal ml-1">Ordenar alfabéticamente (A-Z)</span>
            </Button>

            <Button variant="ghost" className="h-8 p-0! justify-start" disabled={!actions.onSortZA} onClick={actions.onSortZA}>
              <BootstrapIcon name="sort-alpha-down-alt" size={22} />
              <span className="text-sm font-normal ml-1">Ordenar alfabéticamente (Z-A)</span>
            </Button>
          </div>
        </div>
      )}

      {/* Grupo Rotación */}
      {features.rotation && (
        <div className="space-y-2">
          <div className="grid grid-cols-1 gap-2">
            <Button variant="ghost" className="h-8 p-0! justify-start" disabled={!actions.onRotateRights} onClick={actions.onRotateRights}>
              <BootstrapIcon name="arrow-clockwise" size={22} />
              <span className="text-sm font-normal ml-1">Girar documentos 90° a la derecha</span>
            </Button>

            <Button variant="ghost" className="h-8 p-0! justify-start" disabled={!actions.onRotateLefts} onClick={actions.onRotateLefts}>
              <BootstrapIcon name="arrow-counterclockwise" size={22} />
              <span className="text-sm font-normal ml-1">Girar documentos 90° a la izquierda</span>
            </Button>

            <Button variant="ghost" className="h-8 p-0! justify-start" disabled={!actions.onResetOrientation} onClick={actions.onResetOrientation}>
              <BootstrapIcon name="arrow-repeat" size={22} />
              <span className="text-sm font-normal ml-1">Restablecer Orientación</span>
            </Button>

            <Separator className="my-2" />
          </div>
        </div>
      )}

      {/* Grupo Acciones */}
      {features.bulkActions && (
        <div className="space-y-2">
          <div className="grid grid-cols-1 gap-2">
            <Button variant="ghost" className="h-8 p-0! justify-start" disabled={!actions.onDuplicateSelected || !state.hasSelection} onClick={actions.onDuplicateSelected}>
              <BootstrapIcon name="copy" size={22} />
              <span className="text-sm font-normal ml-1">Duplicar archivos seleccionados</span>
            </Button>
            <Button variant="ghost" className="h-8 p-0! justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-900" disabled={!actions.onDeleteSelected || !state.hasSelection} onClick={actions.onDeleteSelected}>
              <BootstrapIcon name="x-lg" color="red" size={22} />
              <span className="text-sm font-normal ml-1">Eliminar archivos seleccionados</span>
            </Button>

            <Separator className="my-2" />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <DesktopToolbar />
      <MobileToolbar />
    </>
  );
}
