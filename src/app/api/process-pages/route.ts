import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, degrees } from "pdf-lib";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const instructionsJson = formData.get("pageInstructions") as string;

        if (!file || !instructionsJson) {
            return NextResponse.json(
                { error: "Se requiere un archivo PDF e instrucciones de procesamiento" },
                { status: 400 }
            );
        }

        const instructions: { originalIndex: number; rotation: number }[] = JSON.parse(instructionsJson);

        if (!Array.isArray(instructions) || instructions.length === 0) {
            return NextResponse.json(
                { error: "Las instrucciones deben ser una lista no vacía" },
                { status: 400 }
            );
        }

        const fileBuffer = await file.arrayBuffer();
        const srcDoc = await PDFDocument.load(fileBuffer);
        const newDoc = await PDFDocument.create();

        // Extract indices to copy
        // We expect originalIndex to be 0-based as per current API standards in this project (mostly)
        // Wait, rotate-pdf uses 0-based in some places, 1-based in others.
        // Let's stick to 0-based for internal API logic.
        const indicesToCopy = instructions.map(inst => inst.originalIndex);

        // Validate indices
        const totalPages = srcDoc.getPageCount();
        if (indicesToCopy.some(idx => idx < 0 || idx >= totalPages)) {
            return NextResponse.json(
                { error: "Uno o más índices de página están fuera de rango" },
                { status: 400 }
            );
        }

        const copiedPages = await newDoc.copyPages(srcDoc, indicesToCopy);

        instructions.forEach((inst, i) => {
            const page = copiedPages[i];
            const rotation = inst.rotation || 0;

            if (rotation !== 0) {
                const existingRotation = page.getRotation().angle;
                page.setRotation(degrees((existingRotation + rotation) % 360));
            }

            newDoc.addPage(page);
        });

        const pdfBytes = await newDoc.save();

        return new NextResponse(Buffer.from(pdfBytes), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="processed-${file.name}"`,
            },
        });

    } catch (error) {
        console.error("Error in process-pages API:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}
