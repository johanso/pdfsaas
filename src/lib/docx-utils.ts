import JSZip from 'jszip';

export async function getDocxPreviewText(file: File): Promise<string> {
    try {
        const zip = await JSZip.loadAsync(file);
        const content = await zip.file('word/document.xml')?.async('text');
        if (!content) return "";

        // Eliminar tags XML y extraer solo el texto
        const text = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        return text.substring(0, 1000) + (text.length > 1000 ? "..." : "");
    } catch (e) {
        console.error("Error extracting docx text:", e);
        return "";
    }
}
