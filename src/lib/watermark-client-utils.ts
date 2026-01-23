/**
 * Client-side watermark utilities using pdf-lib
 * Applies watermarks directly in the browser before sending to backend
 */

import type { WatermarkOptions } from '@/hooks/useWatermarkPdf';

/**
 * Apply watermark to PDF client-side using pdf-lib
 */
export async function applyWatermarkToPdf(
  file: File,
  options: WatermarkOptions
): Promise<File> {
  // Lazy load pdf-lib
  const { PDFDocument, rgb, degrees, StandardFonts } = await import('pdf-lib');

  // Load PDF
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  // Parse pages to apply watermark to
  const pagesToWatermark = options.pages === 'all'
    ? Array.from({ length: pdfDoc.getPageCount() }, (_, i) => i + 1)
    : JSON.parse(options.pages) as number[];

  // Apply watermark to each selected page
  for (const pageNum of pagesToWatermark) {
    const pageIndex = pageNum - 1; // Convert to 0-based index
    if (pageIndex < 0 || pageIndex >= pdfDoc.getPageCount()) continue;

    const page = pdfDoc.getPage(pageIndex);
    const { width, height } = page.getSize();

    // Standard margin
    const margin = 20;

    // Helper to calculate the 'insertion point' (x, y) needed to draw an object
    // of size (w, h) so that its center lands at (cx, cy) after rotation.
    // angleDeg is clockwise.
    const getRotatedAnchor = (cx: number, cy: number, w: number, h: number, angleDeg: number) => {
      const rad = (-angleDeg * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const x = cx - (w / 2 * cos - h / 2 * sin);
      const y = cy - (w / 2 * sin + h / 2 * cos);
      return { x, y };
    };

    // Helper to calculate the size of the rotated bounding box
    const getRotatedSize = (w: number, h: number, angleDeg: number) => {
      const rad = (angleDeg * Math.PI) / 180;
      const cos = Math.abs(Math.cos(rad));
      const sin = Math.abs(Math.sin(rad));
      return {
        wRot: w * cos + h * sin,
        hRot: w * sin + h * cos
      };
    };

    if (options.type === 'text' && options.text) {
      const fontSize = options.fontSize || 36;
      const text = options.text || '';
      const rotation = options.rotation || 0;
      const color = options.color || '#FF0000';
      const r = parseInt(color.slice(1, 3), 16) / 255;
      const g = parseInt(color.slice(3, 5), 16) / 255;
      const b = parseInt(color.slice(5, 7), 16) / 255;

      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      const textHeight = font.heightAtSize(fontSize);

      // Calculo del bounding box rotado para asegurar que no se salga
      const { wRot, hRot } = getRotatedSize(textWidth, textHeight, rotation);

      let cx = 0;
      let cy = 0;

      switch (options.position) {
        case 'top-left':
          cx = margin + wRot / 2;
          cy = height - margin - hRot / 2;
          break;
        case 'top-right':
          cx = width - margin - wRot / 2;
          cy = height - margin - hRot / 2;
          break;
        case 'bottom-left':
          cx = margin + wRot / 2;
          cy = margin + hRot / 2;
          break;
        case 'bottom-right':
          cx = width - margin - wRot / 2;
          cy = margin + hRot / 2;
          break;
        case 'custom':
          if (options.customX !== undefined && options.customY !== undefined) {
            cx = width * options.customX;
            cy = height * (1 - options.customY);
          } else {
            cx = width / 2;
            cy = height / 2;
          }
          break;
        case 'center':
        default:
          cx = width / 2;
          cy = height / 2;
          break;
      }

      const { x: drawX, y: drawY } = getRotatedAnchor(cx, cy, textWidth, textHeight, rotation);

      page.drawText(text, {
        x: drawX,
        y: drawY,
        size: fontSize,
        font,
        color: rgb(r, g, b),
        opacity: options.opacity || 0.5,
        rotate: degrees(-rotation),
      });

    } else if (options.type === 'image' && options.watermarkImage) {
      const imageBytes = await options.watermarkImage.arrayBuffer();
      const imageType = options.watermarkImage.type;
      let image;
      try {
        if (imageType === 'image/png' || options.watermarkImage.name.toLowerCase().endsWith('.png')) {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          image = await pdfDoc.embedJpg(imageBytes);
        }
      } catch (e) {
        try { image = await pdfDoc.embedJpg(imageBytes); }
        catch { image = await pdfDoc.embedPng(imageBytes); }
      }

      const imageWidth = options.width || 200;
      const maintainAspectRatio = options.maintainAspectRatio !== 'false';
      let imageHeight = options.height;
      if (maintainAspectRatio && !imageHeight) {
        const aspectRatio = image.height / image.width;
        imageHeight = imageWidth * aspectRatio;
      }
      const finalHeight = imageHeight || imageWidth;
      const rotation = options.rotation || 0;

      // Calculo del bounding box rotado
      const { wRot, hRot } = getRotatedSize(imageWidth, finalHeight, rotation);

      let cx = 0;
      let cy = 0;

      switch (options.position) {
        case 'top-left':
          cx = margin + wRot / 2;
          cy = height - margin - hRot / 2;
          break;
        case 'top-right':
          cx = width - margin - wRot / 2;
          cy = height - margin - hRot / 2;
          break;
        case 'bottom-left':
          cx = margin + wRot / 2;
          cy = margin + hRot / 2;
          break;
        case 'bottom-right':
          cx = width - margin - wRot / 2;
          cy = margin + hRot / 2;
          break;
        case 'custom':
          if (options.customX !== undefined && options.customY !== undefined) {
            cx = width * options.customX;
            cy = height * (1 - options.customY);
          } else {
            cx = width / 2;
            cy = height / 2;
          }
          break;
        case 'center':
        default:
          cx = width / 2;
          cy = height / 2;
          break;
      }

      const { x: drawX, y: drawY } = getRotatedAnchor(cx, cy, imageWidth, finalHeight, rotation);

      page.drawImage(image, {
        x: drawX,
        y: drawY,
        width: imageWidth,
        height: finalHeight,
        opacity: options.opacity || 0.5,
        rotate: degrees(-rotation),
      });
    }
  }

  // Save modified PDF
  const pdfBytes = await pdfDoc.save();
  const modifiedFile = new File(
    [pdfBytes as any],
    file.name,
    { type: 'application/pdf' }
  );

  return modifiedFile;
}
