import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, degrees } from "pdf-lib";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const instructionsJson = formData.get("instructions") as string;

        if (!instructionsJson) {
            return NextResponse.json(
                { error: "No se proporcionaron instrucciones de organización" },
                { status: 400 }
            );
        }

        const instructions = JSON.parse(instructionsJson);

        // Load all uploaded files into a map for easy access
        // We expect files to be appended with keys like "file-0", "file-1", etc.
        const filesMap = new Map<number, ArrayBuffer>();

        // Also support "file" key if only one file or array (though we prefer indexed for multi-file logic hygiene)
        // Let's iterate over formData keys to find files
        for (const [key, value] of formData.entries()) {
            if (key.startsWith("file-") && value instanceof File) {
                const index = parseInt(key.replace("file-", ""));
                if (!isNaN(index)) {
                    const buffer = await value.arrayBuffer();
                    filesMap.set(index, buffer);
                }
            }
        }

        if (filesMap.size === 0) {
            // Fallback: check "file" key
            const files = formData.getAll("file");
            if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    const f = files[i];
                    if (f instanceof File) {
                        filesMap.set(i, await f.arrayBuffer());
                    }
                }
            }
        }

        if (filesMap.size === 0) {
            return NextResponse.json(
                { error: "No se proporcionaron archivos PDF" },
                { status: 400 }
            );
        }

        // Create a new PDF document
        const newPdf = await PDFDocument.create();

        // Cache loaded PDFDocs to avoid reparsing the same file multiple times
        const loadedPdfs = new Map<number, PDFDocument>();

        for (const inst of instructions) {
            if (inst.isBlank) {
                // Add a blank page. Default size standard A4 or letter? 
                // PDF-lib addPage() defaults to A4 size if no arguments.
                newPdf.addPage();
            } else {
                const fileIndex = inst.fileIndex ?? 0;
                const pageIndex = (inst.originalIndex || 1) - 1; // 0-based
                const rotation = inst.rotation || 0;

                // Get or load the source PDF
                let srcDoc = loadedPdfs.get(fileIndex);
                if (!srcDoc) {
                    const buffer = filesMap.get(fileIndex);
                    if (!buffer) {
                        console.warn(`File index ${fileIndex} not found, skipping page.`);
                        continue;
                    }
                    srcDoc = await PDFDocument.load(buffer);
                    loadedPdfs.set(fileIndex, srcDoc);
                }

                // Copy the page
                // Note: copyPages returns an array
                if (pageIndex >= 0 && pageIndex < srcDoc.getPageCount()) {
                    const [copiedPage] = await newPdf.copyPages(srcDoc, [pageIndex]);

                    // Apply rotation
                    // We need to respect existing rotation + new rotation
                    const existingRotation = copiedPage.getRotation().angle;
                    copiedPage.setRotation(degrees(existingRotation + rotation));

                    newPdf.addPage(copiedPage);
                }
            }
        }

        const pdfBytes = await newPdf.save();

        return new NextResponse(Buffer.from(pdfBytes), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": 'attachment; filename="organized_document.pdf"',
            },
        });
    } catch (error) {
        console.error("Error organizing PDF:", error);
        return NextResponse.json(
            { error: "Error al procesar el archivo PDF" },
            { status: 500 }
        );
    }
}
