import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const mode = formData.get("mode") as string;
        const configStr = formData.get("config") as string;

        if (!file || !mode) {
            console.error("Split PDF: Missing file or mode");
            return NextResponse.json({ error: "Faltan datos requeridos (archivo o modo)" }, { status: 400 });
        }

        console.log(`Splitting PDF: ${file.name} (${file.size} bytes), mode: ${mode}`);

        const config = JSON.parse(configStr || "{}");
        const fileBuffer = await file.arrayBuffer();
        const sourcePdf = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
        const totalPages = sourcePdf.getPageCount();

        // Outputs: Array of { name: string, pdf: PDFDocument }
        const outputs: { name: string, pdf: PDFDocument }[] = [];

        // Helper to create a new doc from indices
        const createDocFromIndices = async (indices: number[]) => {
            const newPdf = await PDFDocument.create();
            const copiedPages = await newPdf.copyPages(sourcePdf, indices);
            copiedPages.forEach((page) => newPdf.addPage(page));
            return newPdf;
        };

        if (mode === "ranges") {
            const ranges = (config.ranges || []).sort((a: number, b: number) => a - b);
            console.log(`Split mode 'ranges' with points: ${ranges.join(", ")}`);

            // Validate ranges
            if (ranges.length === 0) {
                return NextResponse.json({ error: "No se definieron rangos" }, { status: 400 });
            }

            let startIndex = 0;
            let rangeCounter = 1;

            // Add end of document as the last "split point"
            const splitPoints = [...ranges, totalPages];

            for (const splitPoint of splitPoints) {
                // Determine indices for this group
                // startIndex (inclusive) to splitPoint (inclusive in 1-based logic, so exclusive in 0-based length)
                // wait. ranges has Page Numbers (1-based).
                // Example: User splits after Page 3. ranges=[3].
                // Group 1: Page 1, 2, 3 (Indices 0, 1, 2).
                // Logic: slice(0, 3). Correct.

                const endIndex = Math.min(splitPoint, totalPages);

                if (startIndex >= endIndex) continue;

                const pageIndices = [];
                for (let i = startIndex; i < endIndex; i++) {
                    pageIndices.push(i);
                }

                if (pageIndices.length > 0) {
                    const newPdf = await createDocFromIndices(pageIndices);
                    outputs.push({
                        name: `archivo-${rangeCounter}.pdf`,
                        pdf: newPdf
                    });
                    rangeCounter++;
                }
                startIndex = endIndex;
            }

        } else if (mode === "extract") {
            const selectedPages = (config.pages || []).map((p: number) => p - 1); // Respect order from frontend
            const merge = config.merge;

            if (selectedPages.length === 0) {
                return NextResponse.json({ error: "No se seleccionaron páginas" }, { status: 400 });
            }

            if (merge) {
                // Merge all selected into ONE file
                const newPdf = await createDocFromIndices(selectedPages);
                outputs.push({ name: "extracted-pages.pdf", pdf: newPdf });
            } else {
                // Separate file for each page
                for (const pageIndex of selectedPages) {
                    if (pageIndex >= 0 && pageIndex < totalPages) {
                        const newPdf = await createDocFromIndices([pageIndex]);
                        outputs.push({
                            name: `page-${pageIndex + 1}.pdf`,
                            pdf: newPdf
                        });
                    }
                }
            }

        } else if (mode === "fixed") {
            const size = parseInt(config.size);
            if (!size || size < 1) {
                return NextResponse.json({ error: "Tamaño de división inválido" }, { status: 400 });
            }

            for (let i = 0; i < totalPages; i += size) {
                const pageIndices = [];
                for (let j = 0; j < size && (i + j) < totalPages; j++) {
                    pageIndices.push(i + j);
                }

                const partNum = Math.floor(i / size) + 1;
                const newPdf = await createDocFromIndices(pageIndices);
                outputs.push({
                    name: `archivo-${partNum}.pdf`,
                    pdf: newPdf
                });
            }
        }

        if (outputs.length === 0) {
            return NextResponse.json({ error: "No se generaron archivos" }, { status: 400 });
        }

        // Return Single PDF or ZIP
        if (outputs.length === 1) {
            const pdfBytes = await outputs[0].pdf.save();
            return new NextResponse(Buffer.from(pdfBytes), {
                headers: {
                    "Content-Type": "application/pdf",
                    "Content-Disposition": `attachment; filename="${outputs[0].name}"`,
                },
            });
        } else {
            const zip = new JSZip();
            for (const output of outputs) {
                const pdfBytes = await output.pdf.save();
                zip.file(output.name, pdfBytes);
            }

            const zipContent = await zip.generateAsync({ type: "blob" });
            // JSZip in node returns blob? generateAsync type 'nodebuffer' is better for server response
            // or 'uint8array'. Next.js Response accepts Buffer, ArrayBuffer, text, etc.

            const zipBuffer = await zip.generateAsync({ type: "uint8array" });

            return new NextResponse(Buffer.from(zipBuffer), {
                headers: {
                    "Content-Type": "application/zip",
                    "Content-Disposition": `attachment; filename="split-files.zip"`,
                },
            });
        }

    } catch (error) {
        console.error("Error splitting PDF:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Error interno del servidor" },
            { status: 500 }
        );
    }
}
