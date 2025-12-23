"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Components
import { Card, CardContent } from "@/components/ui/card";
import { HeadingPage } from "@/components/ui/heading-page";
import { Dropzone } from "@/components/ui/dropzone";
import { PdfToolbar } from "@/components/pdf-toolbar";
import { GlobalToolbar, GlobalToolbarProps } from "@/components/globalToolbar";
import { SummaryList } from "@/components/summaryList";
import { ButtonDownload } from "@/components/buttonDownload";
import { SaveDialog } from "@/components/save-dialog";
import { SuccessDialog } from "@/components/success-dialog";
import BootstrapIcon from "@/components/bootstrapIcon";

// Hooks
import { useIsMobile } from "@/hooks/useMobile";

interface PdfToolLayoutProps {
    title: string;
    description: string;
    hasFiles: boolean;
    onFilesSelected: (files: File[]) => void;
    dropzoneMultiple?: boolean;
    onReset: () => void;
    onAdd?: () => void;

    // Global Toolbar
    features?: GlobalToolbarProps["features"];
    actions?: GlobalToolbarProps["actions"];
    state?: GlobalToolbarProps["state"];

    // Sidebar / Options
    summaryItems: { label: string; value: string | number | React.ReactNode }[];
    downloadButtonText: string;
    isDownloadDisabled?: boolean;
    onDownload: () => void;
    sidebarCustomControls?: React.ReactNode;

    // Dialogs
    saveDialogProps: {
        isOpen: boolean;
        onOpenChange: (open: boolean) => void;
        defaultName: string;
        onSave: (name: string) => void;
        isProcessing: boolean; // ✨ NUEVO
        title?: string;
        description?: string;
        extension?: string;
    };
    successDialogProps: {
        isOpen: boolean;
        onOpenChange: (open: boolean) => void;
        onContinue: () => void;
    };

    // Main Content
    isGridLoading?: boolean;
    children: React.ReactNode;
}

export function PdfToolLayout({
    title,
    description,
    hasFiles,
    onFilesSelected,
    dropzoneMultiple = false,
    onReset,
    onAdd,
    features,
    actions,
    state,
    summaryItems,
    downloadButtonText,
    isDownloadDisabled = false,
    onDownload,
    sidebarCustomControls,
    saveDialogProps,
    successDialogProps,
    isGridLoading = false,
    children,
}: PdfToolLayoutProps) {
    const isMobile = useIsMobile();
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);
    const isProcessing = saveDialogProps.isProcessing; // Helper

    return (
        <div className="container mx-auto py-10 px-4 max-w-7xl pb-24">
            <div className="space-y-6">
                <HeadingPage titlePage={title} descriptionPage={description} />

                <div className="w-full">
                    {!hasFiles ? (
                        <Dropzone
                            onFilesSelected={onFilesSelected}
                            multiple={dropzoneMultiple}
                            className="h-80 bg-zinc-50/50 dark:bg-zinc-900/50"
                        />
                    ) : (
                        <div className="space-y-2">
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                                <div className="lg:col-span-3 space-y-2 relative">
                                    {isMobile && (
                                        <PdfToolbar onReset={onReset} onAdd={onAdd} />
                                    )}

                                    {!isMobile && (
                                        <section className="sticky m-0 top-0 py-2 lg:py-0 lg:top-2 z-10 bg-white dark:bg-zinc-900">
                                            <GlobalToolbar
                                                features={features}
                                                actions={actions}
                                                state={state}
                                            />
                                        </section>
                                    )}

                                    <section className="lg:ml-12 bg-zinc-50/50 dark:bg-zinc-900/20 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-lg p-4 md:p-6 min-h-[500px]">
                                        {isGridLoading ? (
                                            <div className="flex items-center justify-center h-full">
                                                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                                            </div>
                                        ) : (
                                            children
                                        )}
                                    </section>
                                </div>

                                <div className="lg:col-span-1">
                                    {isMobile && isOptionsOpen && (
                                        <div
                                            className="fixed inset-0 bg-black/10 z-40 transition-opacity"
                                            onClick={() => setIsOptionsOpen(false)}
                                        />
                                    )}

                                    <div
                                        className={cn(
                                            "z-50 transition-transform duration-300 ease-in-out space-y-6",
                                            isMobile
                                                ? "fixed bottom-0 left-0 right-0 rounded-t-3xl shadow-[0_-8px_30px_rgb(0,0,0,0.12)] bg-white dark:bg-zinc-900 p-6 border-t dark:border-zinc-800"
                                                : "sticky top-4 block",
                                            isMobile && (isOptionsOpen ? "translate-y-0" : "translate-y-full")
                                        )}
                                    >
                                        {!isMobile && (
                                            <PdfToolbar onReset={onReset} onAdd={onAdd} />
                                        )}

                                        {isMobile && (
                                            <div
                                                className={cn(
                                                    "w-12 h-12 absolute -top-14 right-4 flex items-center justify-center p-3 rounded-full z-10 bg-white dark:bg-zinc-900 shadow-md cursor-pointer hover:scale-110 active:scale-95 transition-transform",
                                                    isOptionsOpen ? "" : "hidden"
                                                )}
                                                onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                                            >
                                                <BootstrapIcon name="gear" size={26} animated="rotate" />
                                            </div>
                                        )}

                                        <Card className={cn(isMobile && "border-0 shadow-none p-0")}>
                                            <CardContent className={cn("space-y-4 py-4", isMobile && "p-0")}>
                                                {isMobile && features && (
                                                    <GlobalToolbar
                                                        features={features}
                                                        actions={Object.keys(actions || {}).reduce((acc, key) => {
                                                            const originalAction = (actions as any)[key];
                                                            if (typeof originalAction === "function") {
                                                                (acc as any)[key] = () => {
                                                                    originalAction();
                                                                    setIsOptionsOpen(false);
                                                                };
                                                            }
                                                            return acc;
                                                        }, {} as GlobalToolbarProps["actions"])}
                                                        state={state}
                                                    />
                                                )}

                                                {sidebarCustomControls}

                                                <SummaryList title="Resumen" items={summaryItems} />

                                                <ButtonDownload
                                                    handleOpenSaveDialog={onDownload}
                                                    buttonText={downloadButtonText}
                                                    disabled={isDownloadDisabled}
                                                />
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {isMobile && (
                                        <div
                                            className={cn(
                                                "fixed bottom-24 right-4 p-3 rounded-full z-10 bg-white dark:bg-zinc-900 shadow-md cursor-pointer hover:scale-110 active:scale-95 transition-transform",
                                                !isOptionsOpen ? "" : "hidden"
                                            )}
                                            onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                                        >
                                            <BootstrapIcon
                                                name={isOptionsOpen ? "x-lg" : "gear"}
                                                size={26}
                                                animated={isOptionsOpen ? "" : "rotate"}
                                            />
                                        </div>
                                    )}

                                    {isMobile && !isOptionsOpen && (
                                        <div className="p-4 fixed bottom-1 z-9 w-[calc(100svw-2rem)] bg-white dark:bg-zinc-900 rounded-md shadow-md border dark:border-zinc-800">
                                            <ButtonDownload
                                                handleOpenSaveDialog={onDownload}
                                                buttonText={downloadButtonText}
                                                disabled={isDownloadDisabled}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <SaveDialog
                open={saveDialogProps.isOpen}
                onOpenChange={saveDialogProps.onOpenChange}
                defaultName={saveDialogProps.defaultName}
                onSave={saveDialogProps.onSave}
                isProcessing={saveDialogProps.isProcessing}
                title={saveDialogProps.title}
                description={saveDialogProps.description}
                extension={saveDialogProps.extension}
            />

            <SuccessDialog
                open={successDialogProps.isOpen}
                onOpenChange={successDialogProps.onOpenChange}
                onContinue={successDialogProps.onContinue}
                onStartNew={onReset}
            />
        </div>
    );
}
