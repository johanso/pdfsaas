import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, degrees } from "pdf-lib";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const pageInstructionsStr = formData.get("pageInstructions") as string;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        if (!pageInstructionsStr) {
            return NextResponse.json(
                { error: "No page instructions provided" },
                { status: 400 }
            );
        }

        let pageInstructions: { originalIndex: number; rotation: number }[];
        try {
            pageInstructions = JSON.parse(pageInstructionsStr);
            if (!Array.isArray(pageInstructions)) throw new Error("Invalid format");
        } catch (e) {
            return NextResponse.json(
                { error: "Invalid page instructions format" },
                { status: 400 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const sourcePdfDoc = await PDFDocument.load(arrayBuffer);
        const newPdfDoc = await PDFDocument.create();

        // Copy pages in the order specified by pageInstructions
        // We need an array of indices to pass to copyPages
        const indicesToCopy = pageInstructions.map(pi => pi.originalIndex);

        // copyaPages returns an array of copied pages
        const copiedPages = await newPdfDoc.copyPages(sourcePdfDoc, indicesToCopy);

        // Add them to the new document and apply rotation
        pageInstructions.forEach((pi, i) => {
            const page = copiedPages[i];
            const currentRotation = page.getRotation().angle;
            // pdf-lib rotation using degrees() helper
            page.setRotation(degrees(currentRotation + pi.rotation));
            newPdfDoc.addPage(page);
        });

        const pdfBytes = await newPdfDoc.save();

        return new NextResponse(pdfBytes, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="modified-${file.name}"`,
            },
        });

    } catch (error) {
        console.error("Error processing pages:", error);
        return NextResponse.json(
            { error: "Internal server error processing PDF" },
            { status: 500 }
        );
    }
}
