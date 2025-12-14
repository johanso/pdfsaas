"use client";

import { Button } from "@/components/ui/button";
import { Plus, RotateCw, Trash2, ArrowUpDown, RotateCcw, RefreshCw, ArrowDownAZ, ArrowUpZA, Square, SquareCheck, SquareDot, ArrowRightLeft, MoreHorizontalIcon, RefreshCcw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ButtonGroup } from "@/components/ui/button-group"

interface PdfToolbarProps {
  title: string;
  subtitle?: string;
  onAdd?: () => void;
  onRotateAll?: () => void;
  onRotateLeft?: () => void;
  onRotateRight?: () => void;
  onResetRotation?: () => void;
  onSort?: () => void; // Deprecated: use onSortAZ instead
  onSortAZ?: () => void;
  onSortZA?: () => void;
  onReset?: () => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  onInvertSelection?: () => void;
  showAddButton?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function PdfToolbar({
  title,
  subtitle,
  onAdd,
  onRotateAll,
  onRotateLeft,
  onRotateRight,
  onResetRotation,
  onSort,
  onSortAZ,
  onSortZA,
  onReset,
  onSelectAll,
  onDeselectAll,
  onInvertSelection,
  showAddButton = true,
  className,
  children
}: PdfToolbarProps) {
  return (
    <div className={cn(
      "sticky top-0 z-30 bg-background/80 backdrop-blur-md p-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4",
      className
    )}>
      <div className="flex items-center gap-2 w-full md:w-auto overflow-hidden">
        <div className="font-medium truncate" title={title}>
          {title}
        </div>
        {subtitle && (
          <div className="text-xs text-zinc-500 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md whitespace-nowrap">
            {subtitle}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
        {children}

        {showAddButton && onAdd && (
          <Button variant="default" onClick={onAdd} size="sm" className="cursor-pointer shadow-none">
            <span className="text-xs font-medium">Añadir PDF</span>
            <Plus className=" h-4 w-4" />
          </Button>
        )}

        <ButtonGroup>

          {onSelectAll && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={onSelectAll} size="sm" className="text-xs cursor-pointer shadow-none">
                  <span className="text-xs font-medium">Seleccionar todos</span>
                  <SquareCheck className=" h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-center">Marca todas las páginas <br /> del documento</p>
              </TooltipContent>
            </Tooltip>
          )}

          {onDeselectAll && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={onDeselectAll} size="sm" className="text-xs cursor-pointer shadow-none">
                  <span className="text-xs font-medium">Ninguno</span>
                  <Square className=" h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-center">Desmarca todas las páginas <br /> seleccionadas</p>
              </TooltipContent>
            </Tooltip>
          )}

          {onInvertSelection && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={onInvertSelection} size="sm" className="text-xs cursor-pointer shadow-none">
                  <span className="text-xs font-medium">Invertir</span>
                  <ArrowRightLeft className=" h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-center">Intercambia las páginas marcadas <br /> por las no marcadas.</p>
              </TooltipContent>
            </Tooltip>
          )}

          {onRotateLeft && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={onRotateLeft} size="sm" className="text-xs cursor-pointer shadow-none">
                  <span className="text-xs font-medium">Rotar a izquierda</span>
                  <RotateCcw className=" h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-center">Gira todo el documento 90° <br /> en sentido antihorario</p>
              </TooltipContent>
            </Tooltip>
          )}

          {onRotateRight && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={onRotateRight} size="sm" className="text-xs cursor-pointer shadow-none">
                  <span className="text-xs font-medium">Derecha</span>
                  <RotateCw className=" h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-center">Gira todo el documento 90° <br /> en sentido horario</p>
              </TooltipContent>
            </Tooltip>
          )}

          {onResetRotation && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={onResetRotation} size="sm" className="text-xs cursor-pointer shadow-none">
                  <span className="text-xs font-medium">Restablecer</span>
                  <RefreshCcw className=" h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-center">Devuelve todas las páginas a <br /> su orientación original</p>
              </TooltipContent>
            </Tooltip>
          )}

          {onRotateAll && (
            <Button
              variant="outline"
              onClick={onRotateAll}
              size="sm"
              className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
              Rotar todos
            </Button>
          )}

          {(onSortAZ || onSort) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={onSortAZ || onSort} size="sm" className="text-xs cursor-pointer shadow-none">
                  <span className="text-xs font-medium">Ordenar A-Z</span>
                  <ArrowDownAZ className=" h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-center">Organiza los archivos por <br />nombre (ascendente)</p>
              </TooltipContent>
            </Tooltip>
          )}

          {(onSortZA || onSort) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={onSortZA || onSort} size="sm" className="text-xs cursor-pointer shadow-none">
                  <span className="text-xs font-medium">Ordenar Z-A</span>
                  <ArrowDownAZ className=" h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-center">Organiza los archivos por <br />nombre (descendente)</p>
              </TooltipContent>
            </Tooltip>
          )}

        </ButtonGroup>


        {onReset && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="destructive" onClick={onReset} size="icon" className="rounded-full cursor-pointer">
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-center">Eliminar todos los archivos <br />y empezar de cero</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
