
export function canvasToOptimizedDataURL(
    canvas: HTMLCanvasElement,
    preferWebP: boolean = true,
    quality: number = 0.8
): string {
    const supportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;

    if (preferWebP && supportsWebP) {
        return canvas.toDataURL('image/webp', quality);
    }

    return canvas.toDataURL('image/jpeg', quality);
}