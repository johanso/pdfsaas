import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, degrees } from "pdf-lib";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const files = formData.getAll("files") as File[];
        const rotationsJson = formData.get("rotations") as string;

        if (!files || files.length === 0) {
            return NextResponse.json({ error: "No files provided" }, { status: 400 });
        }

        let rotations: number[] = [];
        try {
            rotations = JSON.parse(rotationsJson || "[]");
        } catch (e) {
            console.warn("Failed to parse rotations", e);
            // Fallback: 0 for all
            rotations = new Array(files.length).fill(0);
        }

        // Create a new PDF document
        const mergedPdf = await PDFDocument.create();

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const rotation = rotations[i] || 0;

            const fileBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(fileBuffer);

            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

            copiedPages.forEach((page) => {
                // Apply rotation. existing rotation + new rotation
                // pdf-lib rotation is clockwise.
                // If the page already has a rotation, we add to it.
                const existingRotation = page.getRotation().angle;
                page.setRotation(degrees((existingRotation + rotation) % 360));
                mergedPdf.addPage(page);
            });
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
