import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Solo para rutas del worker, no aplicar límites
    if (request.nextUrl.pathname.startsWith('/api/worker')) {
        return NextResponse.next();
    }
    return NextResponse.next();
}

export const config = {
    matcher: '/api/worker/:path*',
};