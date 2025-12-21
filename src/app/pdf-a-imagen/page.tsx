"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowDownToLine, Loader2, Camera, Image as ImageIcon, Globe, Save, Printer, CheckCircle2, Circle, Badge } from "lucide-react";
// Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HeadingPage } from "@/components/ui/heading-page";
import { Dropzone } from "@/components/ui/dropzone";
import { PdfToolbar } from "@/components/pdf-toolbar";
import { SaveDialog } from "@/components/save-dialog";
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { GlobalToolbar } from "@/components/globalToolbar";
import { SuccessDialog } from "@/components/success-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SummaryList } from "@/components/summaryList";
import { Progress } from "@/components/ui/progress";

// Hooks
import { useIsMobile } from "@/hooks/useMobile";
import { usePageSelection } from "@/hooks/usePageSelection";
import { usePdfPages } from "@/hooks/usePdfPages";
import { cn } from "@/lib/utils";
import { usePdfToImage } from "@/hooks/usepdftoimage";
import { Slider } from "@/components/ui/slider";

type ImageFormat = "jpg" | "png" | "webp";

const FORMATS: { id: ImageFormat; label: string; icon: any; badge?: string }[] = [
    {
        id: "jpg",
        label: "JPG",
        icon: Camera,
        badge: "Recomendado"
    },
    {
        id: "png",
        label: "PNG",
        icon: ImageIcon,
    },
    {
        id: "webp",
        label: "WebP",
        icon: Globe,
    }
];

const PDF_IMAGE_CONFIG = {
    draggable: true,
    selectable: true,
    rotatable: false,
    removable: false,
    showPageNumber: true,
    selectedColorName: "green",
    iconSelectedName: "check" as const,
};

export default function PdfToImagePage() {
    const [file, setFile] = useState<File | null>(null);
    const [format, setFormat] = useState<ImageFormat>("jpg");
    const [quality, setQuality] = useState(85);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

    const { pages, reorderPages } = usePdfPages(file);
    const numPages = pages.length;

    const {
        selectedPages,
        togglePage,
        selectAll,
        deselectAll,
        invertSelection,
        reset: resetSelection
    } = usePageSelection(numPages);

    const { isProcessing, progress, convertAndDownload } = usePdfToImage();
    const isMobile = useIsMobile();

    useEffect(() => {
        return () => {
            // Cleanup en unmount
            if (isProcessing) {
                toast.info("Conversión cancelada");
            }
        };
    }, [isProcessing]);

    const handleFilesSelected = (files: File[]) => {
        if (files.length > 0) {
            const f = files[0];
            if (f.type !== "application/pdf") {
                toast.error("Por favor selecciona un archivo PDF válido");
                return;
            }
            setFile(f);
            resetSelection();
        }
    };

    const handleReset = () => {
        setFile(null);
        resetSelection();
        setFormat("jpg");
        setQuality(85);
        setIsDialogOpen(false);
        setIsSuccessDialogOpen(false);
    };

    const handlePreSubmit = () => {
        if (!file) return;
        if (selectedPages.length === 0) {
            toast.error("Selecciona al menos una página para convertir");
            return;
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (fileName: string) => {
        if (!file) return;

        // Get 0-based indices of selected pages in order
        const orderedSelectedPages = pages
            .filter(p => selectedPages.includes(p.originalIndex))
            .map(p => p.originalIndex - 1); // 0-based

        // Process client-side (no server needed!)
        await convertAndDownload(file, orderedSelectedPages, fileName, {
            format,
            quality,
            scale: 2.0,
            onSuccess: () => {
                setIsDialogOpen(false);
                setIsSuccessDialogOpen(true);
            },
            onError: (error) => {
                console.error(error);
            }
        });
    };

    const handleFormatChange = (newFormat: ImageFormat) => {
        setFormat(newFormat);
        toast.info(`Formato cambiado a ${newFormat.toUpperCase()}`);
    };

    const handleQualityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        setQuality(val);
    };

    const showQualityControl = ["jpg", "webp"].includes(format);

    // Progress percentage
    const progressPercent = progress.total > 0
        ? Math.round((progress.current / progress.total) * 100)
        : 0;

    return (
        <div className="container mx-auto py-10 px-4 max-w-6xl pb-32">
            <div className="space-y-6">
                <HeadingPage
                    titlePage="Convertir PDF a Imagen"
                    descriptionPage="Convierte páginas de tu PDF a imágenes de alta calidad (JPG, PNG, WebP)."
                />

                <div className="w-full">
                    {!file ? (
                        <Dropzone
                            onFilesSelected={handleFilesSelected}
                            multiple={false}
                            className="h-80 bg-zinc-50/50 dark:bg-zinc-900/50"
                        />
                    ) : (
                        <div className="space-y-2">
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                <div className="lg:col-span-3 space-y-2">
                                    {isMobile && (
                                        <PdfToolbar onReset={handleReset} />
                                    )}

                                    <section className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2">
                                        <GlobalToolbar
                                            features={{
                                                selection: true,
                                            }}
                                            actions={{
                                                onSelectAll: selectAll,
                                                onDeselectAll: deselectAll,
                                                onInvertSelection: invertSelection,
                                            }}
                                        />
                                    </section>

                                    <section className="bg-zinc-50/50 dark:bg-zinc-900/20 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-lg p-2 md:p-6 min-h-[500px]">
                                        {pages.length === 0 ? (
                                            <div className="flex items-center justify-center h-full">
                                                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                                            </div>
                                        ) : (
                                            <PdfGrid
                                                items={pages}
                                                config={PDF_IMAGE_CONFIG}
                                                extractCardData={(p) => ({
                                                    id: p.id,
                                                    file: p.file,
                                                    pageNumber: p.originalIndex,
                                                    rotation: p.rotation,
                                                    isBlank: p.isBlank
                                                })}
                                                selectedIds={pages
                                                    .filter(p => selectedPages.includes(p.originalIndex))
                                                    .map(p => p.id)
                                                }
                                                onToggle={(id) => {
                                                    const page = pages.find(p => p.id === id);
                                                    if (page) togglePage(page.originalIndex);
                                                }}
                                                onReorder={reorderPages}
                                            />
                                        )}
                                    </section>
                                </div>

                                <div className="lg:col-span-1">
                                    <div className="fixed bottom-0 lg:sticky lg:top-4 space-y-6 z-40 w-[calc(100svw-2rem)] lg:w-auto left-4 lg:left-auto right-4 lg:right-auto">
                                        {!isMobile && (
                                            <PdfToolbar onReset={handleReset} />
                                        )}

                                        <Card className="max-h-[80vh] overflow-y-auto">
                                            <CardContent className="space-y-6 py-4">
                                                {/* Selector de Formato */}
                                                <div className="space-y-2">
                                                    <Label className="block text-base mb-2 font-medium">Formato de salida</Label>
                                                    <div className="flex flex-col gap-2">
                                                        {FORMATS.map((fmt) => (
                                                            <button
                                                                key={fmt.id}
                                                                onClick={() => handleFormatChange(fmt.id)}
                                                                className={cn(
                                                                    "relative px-1.5 py-1 rounded-lg border transition-all text-left group hover:shadow-sm",
                                                                    format === fmt.id
                                                                        ? "border-primary bg-primary/5 dark:bg-primary/10 ring-1 ring-primary/20"
                                                                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900"
                                                                )}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <div className={cn(
                                                                        "p-2 rounded-md transition-colors",
                                                                        format === fmt.id
                                                                            ? "bg-primary/10 text-primary"
                                                                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300"
                                                                    )}>
                                                                        <fmt.icon className="w-4 h-4" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2 mb-0.5">
                                                                            <span className="text-sm font-medium">{fmt.label}</span>
                                                                            {fmt.badge && (
                                                                                <Badge className="text-[10px] px-1.5 h-4 font-normal bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                                                                                    {fmt.badge}
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="shrink-0">
                                                                        {format === fmt.id ? (
                                                                            <CheckCircle2 className="w-5 h-5 text-primary" />
                                                                        ) : (
                                                                            <Circle className="w-5 h-5 text-zinc-300 dark:text-zinc-700" />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Control de Calidad */}
                                                {showQualityControl && (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <Label>Calidad</Label>
                                                            <span className="text-xs font-medium text-zinc-500">{quality}%</span>
                                                        </div>

                                                        <Slider
                                                            value={[quality]}
                                                            min={50}
                                                            max={100}
                                                            step={5}
                                                            onValueChange={(val) => {
                                                                setQuality(val[0]);
                                                            }}
                                                            className="text-zinc-500"

                                                        />
                                                        <div className="flex justify-between text-[10px] text-zinc-400 px-1">
                                                            <span>Menor archivo</span>
                                                            <span>Mejor calidad</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Progress indicator */}
                                                {isProcessing && progress.total > 0 && (
                                                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                                        <Card className="p-6 space-y-4">
                                                            <p>Convirtiendo páginas...</p>
                                                            <Progress value={(progress.current / progress.total) * 100} />
                                                            <p className="text-sm text-zinc-500">
                                                                {progress.current} de {progress.total}
                                                            </p>
                                                        </Card>
                                                    </div>
                                                )}

                                                {/* Resumen */}
                                                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                                    <SummaryList
                                                        title="Resumen"
                                                        items={[
                                                            { label: "Total páginas", value: pages.length },
                                                            { label: "Seleccionadas", value: selectedPages.length },
                                                            { label: "Formato", value: format.toUpperCase() },
                                                            { label: "Descarga", value: selectedPages.length > 1 ? "Archivo ZIP" : "Imagen única" }
                                                        ]}
                                                    />
                                                </div>

                                                {/* Boton */}
                                                <div>
                                                    <Button
                                                        variant="hero"
                                                        className="w-full py-6 font-medium"
                                                        size="lg"
                                                        onClick={handlePreSubmit}
                                                        disabled={isProcessing || selectedPages.length === 0}
                                                    >
                                                        {isProcessing ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                Procesando...
                                                            </>
                                                        ) : (
                                                            <>
                                                                {selectedPages.length > 1 ? "Descargar ZIP" : "Descargar Imagen"}
                                                                <ArrowDownToLine className="w-4 h-4 ml-2" />
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>

                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>

                            <SaveDialog
                                open={isDialogOpen}
                                onOpenChange={setIsDialogOpen}
                                defaultName={`${file.name.replace(".pdf", "")}-images`}
                                onSave={handleSubmit}
                                isProcessing={isProcessing}
                                title="Guardar imágenes"
                                description={`Se guardarán ${selectedPages.length} imágenes en formato ${format.toUpperCase()}.`}
                                extension={selectedPages.length > 1 ? "zip" : format}
                            />
                        </div>
                    )}
                </div>
            </div>
            <SuccessDialog
                open={isSuccessDialogOpen}
                onOpenChange={setIsSuccessDialogOpen}
                onContinue={() => setIsSuccessDialogOpen(false)}
                onStartNew={handleReset}
            />
        </div>
    );
}