import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

const STORAGE_DIR = path.join(os.tmpdir(), 'pdf-tools-storage');

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Sanitize ID to prevent traversal
        const safeId = path.basename(id).replace(/[^a-zA-Z0-9-]/g, '');
        const filePath = path.join(STORAGE_DIR, `${safeId}.pdf`);

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
        }

        const fileBuffer = fs.readFileSync(filePath);

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="document.pdf"`,
            },
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
