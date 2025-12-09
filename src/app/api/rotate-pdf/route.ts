import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, degrees } from "pdf-lib";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const pageInstructionsStr = formData.get("pageInstructions") as string;

        if (!file || !pageInstructionsStr) {
            return NextResponse.json({ error: "Missing file or instructions" }, { status: 400 });
        }

        const pageInstructions: { originalIndex: number; rotation: number }[] = JSON.parse(pageInstructionsStr);

        const fileBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(fileBuffer);
        const newPdf = await PDFDocument.create();

        const indicesToCopy = pageInstructions.map(p => p.originalIndex);
        const copiedPages = await newPdf.copyPages(pdfDoc, indicesToCopy);

        pageInstructions.forEach((instruction, i) => {
            const page = copiedPages[i];
            const rotation = instruction.rotation || 0;

            const existingRotation = page.getRotation().angle;
            page.setRotation(degrees(existingRotation + rotation));

            newPdf.addPage(page);
        });

        const pdfBytes = await newPdf.save();

        return new NextResponse(Buffer.from(pdfBytes), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="rotated.pdf"`,
            },
        });

    } catch (error) {
        console.error("Error rotating PDF:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}
