"use client";

import { FileText, FileSpreadsheet, Presentation } from "lucide-react";
import { cn } from "@/lib/utils";

interface OfficeThumbnailProps {
    file: File;
    className?: string;
}

export function OfficeThumbnail({ file, className }: OfficeThumbnailProps) {
    const extension = file.name.toLowerCase().split('.').pop();

    // Determinar el tipo de archivo y color
    const getFileTypeInfo = () => {
        switch (extension) {
            case 'doc':
            case 'docx':
                return {
                    Icon: FileText,
                    color: 'text-blue-600 dark:text-blue-400',
                    bg: 'bg-blue-50 dark:bg-blue-950/30',
                    label: 'Word'
                };
            case 'xls':
            case 'xlsx':
                return {
                    Icon: FileSpreadsheet,
                    color: 'text-green-600 dark:text-green-400',
                    bg: 'bg-green-50 dark:bg-green-950/30',
                    label: 'Excel'
                };
            case 'ppt':
            case 'pptx':
                return {
                    Icon: Presentation,
                    color: 'text-orange-600 dark:text-orange-400',
                    bg: 'bg-orange-50 dark:bg-orange-950/30',
                    label: 'PowerPoint'
                };
            default:
                return {
                    Icon: FileText,
                    color: 'text-zinc-600 dark:text-zinc-400',
                    bg: 'bg-zinc-50 dark:bg-zinc-950/30',
                    label: 'Documento'
                };
        }
    };

    const { Icon, color, bg, label } = getFileTypeInfo();

    return (
        <div className={cn("flex flex-col items-center justify-center gap-3 p-1", bg, className)}>
            <Icon className={cn("w-16 h-16", color)} strokeWidth={1.5} />
            {/* <div className="text-center">
                <p className={cn("text-xs font-medium", color)}>{label}</p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                    .{extension?.toUpperCase()}
                </p>
            </div> */}
        </div>
    );
}
