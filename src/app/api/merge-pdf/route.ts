import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, degrees } from "pdf-lib";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const files = formData.getAll("files") as File[];
        const rotationsJson = formData.get("rotations") as string;

        if (!files || files.length === 0) {
            return NextResponse.json({ error: "No se recibieron archivos" }, { status: 400 });
        }

        let rotations: number[] = [];
        try {
            rotations = JSON.parse(rotationsJson || "[]");
        } catch (e) {
            console.warn("Failed to parse rotations", e);
            rotations = new Array(files.length).fill(0);
        }

        // Create a new PDF document
        const mergedPdf = await PDFDocument.create();

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const rotation = rotations[i] || 0;

            const fileBuffer = await file.arrayBuffer();

            try {
                const pdf = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

                copiedPages.forEach((page) => {
                    const existingRotation = page.getRotation().angle;
                    page.setRotation(degrees((existingRotation + rotation) % 360));
                    mergedPdf.addPage(page);
                });
            } catch (error) {
                console.error(`Error loading PDF file ${i}:`, error);
                return NextResponse.json(
                    { error: `El archivo "${file.name}" no es un PDF válido o está corrupto.` },
                    { status: 400 }
                );
            }
        }

        const pdfBytes = await mergedPdf.save();

        return new NextResponse(Buffer.from(pdfBytes), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": 'attachment; filename="merged.pdf"',
            },
        });

    } catch (error) {
        console.error("Error merging PDFs:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
