import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const config = {
    api: {
        bodyParser: false,
    },
};

// Simple file storage helpers
const STORAGE_DIR = path.join(os.tmpdir(), 'pdf-tools-storage');
if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ type: string }> }
) {
    try {
        const { type } = await params;
        const formData = await req.formData();

        const file = formData.get('file') as File;
        if (!file) {
            return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = pdfDoc.getPages();

        // Parse options
        const opacity = parseFloat(formData.get('opacity') as string) || 0.5;
        const position = (formData.get('position') as string) || 'center';
        const customX = parseFloat(formData.get('customX') as string) || 0;
        const customY = parseFloat(formData.get('customY') as string) || 0;

        let rotation = parseFloat(formData.get('rotation') as string) || 0;
        if (rotation === 360) rotation = 0;

        const pagesConfig = (formData.get('pages') as string) || 'all';
        let targetPageIndices: number[] = [];

        if (pagesConfig === 'all') {
            targetPageIndices = pages.map((_, i) => i);
        } else {
            try {
                const userPages = JSON.parse(pagesConfig) as number[];
                targetPageIndices = userPages.map(p => p - 1).filter(idx => idx >= 0 && idx < pages.length);
            } catch (e) {
                targetPageIndices = pages.map((_, i) => i);
            }
        }

        if (type === 'text') {
            const text = (formData.get('text') as string) || 'DRAFT';
            const fontSize = parseFloat(formData.get('fontSize') as string) || 48;
            const colorHex = (formData.get('color') as string) || '#000000';

            const r = parseInt(colorHex.slice(1, 3), 16) / 255;
            const g = parseInt(colorHex.slice(3, 5), 16) / 255;
            const b = parseInt(colorHex.slice(5, 7), 16) / 255;

            const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

            for (const pageIndex of targetPageIndices) {
                const page = pages[pageIndex];
                const { width: pageWidth, height: pageHeight } = page.getSize();

                const textWidth = helveticaFont.widthOfTextAtSize(text, fontSize);
                const textHeight = helveticaFont.heightAtSize(fontSize);

                let x = 0;
                let y = 0;

                if (position === 'custom') {
                    // Absolute coordinates explicitly requested
                    // We apply them as is. If user wants different positions per page, they can't use 'custom' global setting.
                    x = customX;
                    y = customY;
                } else {
                    // Relative calculation per page
                    const margin = 20;
                    switch (position) {
                        case 'center':
                            x = (pageWidth - textWidth) / 2;
                            y = (pageHeight - textHeight) / 2;
                            break;
                        case 'top-left':
                            x = margin;
                            y = pageHeight - textHeight - margin;
                            break;
                        case 'top-right':
                            x = pageWidth - textWidth - margin;
                            y = pageHeight - textHeight - margin;
                            break;
                        case 'bottom-left':
                            x = margin;
                            y = margin;
                            break;
                        case 'bottom-right':
                            x = pageWidth - textWidth - margin;
                            y = margin;
                            break;
                    }
                }

                page.drawText(text, {
                    x,
                    y,
                    size: fontSize,
                    font: helveticaFont,
                    color: rgb(r, g, b),
                    opacity,
                    rotate: degrees(rotation),
                });
            }

        } else if (type === 'image') {
            const imageFile = formData.get('watermarkImage') as File;
            if (!imageFile) throw new Error('No image file provided');

            const imageBuffer = await imageFile.arrayBuffer();
            let embeddedImage;

            const isPng = imageFile.type === 'image/png' || imageFile.name.toLowerCase().endsWith('.png');
            const isJpg = imageFile.type === 'image/jpeg' || imageFile.type === 'image/jpg' ||
                imageFile.name.toLowerCase().endsWith('.jpg') || imageFile.name.toLowerCase().endsWith('.jpeg');

            try {
                if (isPng) {
                    embeddedImage = await pdfDoc.embedPng(imageBuffer);
                } else if (isJpg) {
                    embeddedImage = await pdfDoc.embedJpg(imageBuffer);
                } else {
                    // Fallback: try JPG then PNG if type is not clear
                    try {
                        embeddedImage = await pdfDoc.embedJpg(imageBuffer);
                    } catch {
                        embeddedImage = await pdfDoc.embedPng(imageBuffer);
                    }
                }
            } catch (err: any) {
                console.error("Image embedding failed:", err);
                throw new Error(`El formato de la imagen "${imageFile.name}" no es compatible o está dañado. Use PNG o JPG estándar.`);
            }

            const reqWidth = parseFloat(formData.get('width') as string) || 200;
            const maintainAspectRatio = formData.get('maintainAspectRatio') === 'true';

            const imgDims = embeddedImage.scale(1);
            const aspectRatio = imgDims.width / imgDims.height;

            let finalWidth = reqWidth;
            let finalHeight = maintainAspectRatio ? (reqWidth / aspectRatio) : (parseFloat(formData.get('height') as string) || 150);

            for (const pageIndex of targetPageIndices) {
                const page = pages[pageIndex];
                const { width: pageWidth, height: pageHeight } = page.getSize();

                let x = 0;
                let y = 0;

                if (position === 'custom') {
                    x = customX;
                    y = customY;
                } else {
                    const margin = 20;
                    switch (position) {
                        case 'center':
                            x = (pageWidth - finalWidth) / 2;
                            y = (pageHeight - finalHeight) / 2;
                            break;
                        case 'top-left':
                            x = margin;
                            y = pageHeight - finalHeight - margin;
                            break;
                        case 'top-right':
                            x = pageWidth - finalWidth - margin;
                            y = pageHeight - finalHeight - margin;
                            break;
                        case 'bottom-left':
                            x = margin;
                            y = margin;
                            break;
                        case 'bottom-right':
                            x = pageWidth - finalWidth - margin;
                            y = margin;
                            break;
                    }
                }

                page.drawImage(embeddedImage, {
                    x,
                    y,
                    width: finalWidth,
                    height: finalHeight,
                    opacity,
                    rotate: degrees(rotation),
                });
            }
        }

        const pdfBytes = await pdfDoc.save();

        // Save to temp storage
        const fileId = uuidv4();
        const outputFileName = (formData.get('fileName') as string) || 'watermarked.pdf';
        const filePath = path.join(STORAGE_DIR, `${fileId}.pdf`);

        fs.writeFileSync(filePath, pdfBytes);

        return NextResponse.json({
            success: true,
            fileId: fileId,
            fileName: outputFileName,
            fileSize: pdfBytes.length
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
