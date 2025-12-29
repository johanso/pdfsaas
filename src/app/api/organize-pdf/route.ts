import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, degrees } from "pdf-lib";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const instructionsJson = formData.get("instructions") as string;

        if (!instructionsJson) {
            console.error("Organize PDF: No instructions provided");
            return NextResponse.json(
                { error: "No se proporcionaron instrucciones de organización" },
                { status: 400 }
            );
        }

        const instructions = JSON.parse(instructionsJson);
        console.log(`Organizing PDF with ${instructions.length} instructions`);

        // Load all uploaded files into a map for easy access
        const filesMap = new Map<number, ArrayBuffer>();

        for (const [key, value] of formData.entries()) {
            if (key.startsWith("file-") && value instanceof File) {
                const index = parseInt(key.replace("file-", ""));
                if (!isNaN(index)) {
                    console.log(`Loading file index ${index}: ${value.name} (${value.size} bytes)`);
                    const buffer = await value.arrayBuffer();
                    filesMap.set(index, buffer);
                }
            }
        }

        if (filesMap.size === 0) {
            // Fallback: check "file" key
            const files = formData.getAll("file");
            if (files.length > 0) {
                console.log(`Loading ${files.length} files from fallback 'file' key`);
                for (let i = 0; i < files.length; i++) {
                    const f = files[i];
                    if (f instanceof File) {
                        filesMap.set(i, await f.arrayBuffer());
                    }
                }
            }
        }

        if (filesMap.size === 0) {
            console.error("Organize PDF: No files found in FormData");
            return NextResponse.json(
                { error: "No se proporcionaron archivos PDF" },
                { status: 400 }
            );
        }

        // Create a new PDF document
        const newPdf = await PDFDocument.create();

        // Cache loaded PDFDocs to avoid reparsing the same file multiple times
        const loadedPdfs = new Map<number, PDFDocument>();

        for (let i = 0; i < instructions.length; i++) {
            const inst = instructions[i];
            if (inst.isBlank) {
                console.log(`Instruction ${i}: Adding blank page`);
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
                        console.warn(`File index ${fileIndex} not found, skipping page instruction ${i}.`);
                        continue;
                    }
                    srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
                    loadedPdfs.set(fileIndex, srcDoc);
                }

                // Copy the page
                if (pageIndex >= 0 && pageIndex < srcDoc.getPageCount()) {
                    const [copiedPage] = await newPdf.copyPages(srcDoc, [pageIndex]);

                    // Apply rotation
                    const existingRotation = copiedPage.getRotation().angle;
                    copiedPage.setRotation(degrees((existingRotation + rotation) % 360));

                    newPdf.addPage(copiedPage);
                } else {
                    console.warn(`Page index ${pageIndex} out of bounds for file ${fileIndex}.`);
                }
            }
        }

        if (newPdf.getPageCount() === 0) {
            return NextResponse.json({ error: "El documento resultante no tiene páginas" }, { status: 400 });
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
            { error: error instanceof Error ? error.message : "Error al procesar el archivo PDF" },
            { status: 500 }
        );
    }
}
