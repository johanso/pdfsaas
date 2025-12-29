import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, degrees } from "pdf-lib";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const pageInstructionsStr = formData.get("pageInstructions") as string;

        if (!file || !pageInstructionsStr) {
            console.error("Rotate PDF: Missing file or instructions");
            return NextResponse.json({ error: "Faltan datos requeridos (archivo o instrucciones)" }, { status: 400 });
        }

        console.log(`Rotating PDF: ${file.name} (${file.size} bytes)`);

        const pageInstructions: { originalIndex: number; rotation: number }[] = JSON.parse(pageInstructionsStr);
        console.log(`Processing ${pageInstructions.length} page instructions`);

        const fileBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
        const newPdf = await PDFDocument.create();

        const totalPages = pdfDoc.getPageCount();
        const indicesToCopy = pageInstructions.map(p => p.originalIndex);

        // Validate indices
        if (indicesToCopy.some(idx => idx < 0 || idx >= totalPages)) {
            console.error("Rotate PDF: Some indices are out of bounds");
            return NextResponse.json({ error: "Uno o más índices de página están fuera de rango" }, { status: 400 });
        }

        const copiedPages = await newPdf.copyPages(pdfDoc, indicesToCopy);

        pageInstructions.forEach((instruction, i) => {
            const page = copiedPages[i];
            const rotation = instruction.rotation || 0;

            const existingRotation = page.getRotation().angle;
            page.setRotation(degrees((existingRotation + rotation) % 360));

            newPdf.addPage(page);
        });

        if (newPdf.getPageCount() === 0) {
            return NextResponse.json({ error: "El documento resultante no tiene páginas" }, { status: 400 });
        }

        const pdfBytes = await newPdf.save();

        return new NextResponse(Buffer.from(pdfBytes), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="rotated-${file.name}"`,
            },
        });

    } catch (error) {
        console.error("Error rotating PDF:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Error interno del servidor" },
            { status: 500 }
        );
    }
}
