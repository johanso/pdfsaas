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

        <ButtonGroup>
          {
            (onInvertSelection || onSelectAll || onDeselectAll) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 focus:outline-none focus-visible:outline-none focus-visible:ring-0 cursor-pointer">
                    Opciones de selección
                    <MoreHorizontalIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">

                  {onSelectAll && (
                    <DropdownMenuItem onClick={onSelectAll}>
                      <SquareCheck className="mr-2 h-4 w-4" />
                      <span>Seleccionar todo</span>
                    </DropdownMenuItem>
                  )}

                  {onDeselectAll && (
                    <DropdownMenuItem onClick={onDeselectAll}>
                      <Square className="mr-2 h-4 w-4" />
                      <span>Deseleccionar todo</span>
                    </DropdownMenuItem>
                  )}

                  {onInvertSelection && (
                    <DropdownMenuItem onClick={onInvertSelection}>
                      <ArrowRightLeft className="mr-2 h-4 w-4" />
                      <span>Invertir selección</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }

          {onRotateLeft && (
            <Button variant="outline" onClick={onRotateLeft} size="sm" className="text-xs cursor-pointer shadow-none">
              <RotateCcw className="mr-2 h-4 w-4" />
              <span>Izquierda</span>
            </Button>
          )}

          {onRotateRight && (
            <Button variant="outline" onClick={onRotateRight} size="sm" className="text-xs cursor-pointer shadow-none">
              <RotateCw className="mr-2 h-4 w-4" />
              <span>Derecha</span>
            </Button>
          )}

          {onResetRotation && (
            <Button variant="outline" onClick={onResetRotation} size="sm" className="text-xs cursor-pointer shadow-none">
              <RefreshCcw className="mr-2 h-4 w-4" />
              <span>Restablecer</span>
            </Button>
          )}

          {showAddButton && onAdd && (
            <Button
              variant="outline"
              onClick={onAdd}
              size="sm"
              className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Añadir PDF
            </Button>
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

          {(onSortAZ || onSortZA || onSort) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 cursor-pointer"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  Ordenar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(onSortAZ || onSort) && (
                  <DropdownMenuItem onClick={onSortAZ || onSort} className="cursor-pointer">
                    <ArrowDownAZ className="w-4 h-4" />
                    Ordenar A-Z
                  </DropdownMenuItem>
                )}
                {onSortZA && (
                  <DropdownMenuItem onClick={onSortZA} className="cursor-pointer">
                    <ArrowUpZA className="w-4 h-4" />
                    Ordenar Z-A
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </ButtonGroup>



        {onReset && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={onReset} size="icon" className="rounded-full cursor-pointer">
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Eliminar Documento(s) de la herramienta</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
