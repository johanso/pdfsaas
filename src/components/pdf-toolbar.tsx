"use client";

import { Button } from "@/components/ui/button";
import { Plus, RotateCw, Trash2, ArrowUpDown, RotateCcw, RefreshCw, ArrowDownAZ, ArrowUpZA } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

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
            "sticky top-0 z-30 bg-background/80 backdrop-blur-md p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4",
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

                {onSelectAll && (
                    <Button variant="outline" onClick={onSelectAll} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 cursor-pointer h-9 px-3 text-xs" title="Seleccionar todo">
                        Todo
                    </Button>
                )}

                {onDeselectAll && (
                    <Button variant="outline" onClick={onDeselectAll} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 cursor-pointer h-9 px-3 text-xs" title="Deseleccionar todo">
                        Nada
                    </Button>
                )}

                {onInvertSelection && (
                    <Button variant="outline" onClick={onInvertSelection} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 cursor-pointer h-9 px-3 text-xs" title="Invertir selección">
                        Invertir
                    </Button>
                )}

                {showAddButton && onAdd && (
                    <Button variant="outline" onClick={onAdd} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 cursor-pointer">
                        <Plus className="w-4 h-4" />
                        Añadir PDF
                    </Button>
                )}

                {onRotateLeft && (
                    <Button variant="outline" onClick={onRotateLeft} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 cursor-pointer">
                        <RotateCcw className="w-4 h-4" />
                        Girar Izq
                    </Button>
                )}

                {onRotateRight && (
                    <Button variant="outline" onClick={onRotateRight} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 cursor-pointer">
                        <RotateCw className="w-4 h-4" />
                        Girar Der
                    </Button>
                )}

                {onRotateAll && (
                    <Button variant="outline" onClick={onRotateAll} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 cursor-pointer">
                        <RotateCw className="w-4 h-4" />
                        Rotar todos
                    </Button>
                )}

                {onResetRotation && (
                    <Button variant="outline" onClick={onResetRotation} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 cursor-pointer text-zinc-600 hover:text-zinc-900" title="Restablecer rotación">
                        <RefreshCw className="w-4 h-4" />
                        Reset
                    </Button>
                )}

                {(onSortAZ || onSortZA || onSort) && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 cursor-pointer">
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

                {onReset && (
                    <Button variant="destructive" onClick={onReset} className="ml-auto md:ml-0 cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                        Limpiar
                    </Button>
                )}
            </div>
        </div>
    );
}
