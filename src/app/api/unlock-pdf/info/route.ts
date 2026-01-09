import { NextResponse } from 'next/server';

/**
 * Retorna información sobre el servicio de desbloqueo de PDFs
 */
export async function GET() {
  return NextResponse.json({
    message: 'Servicio de desbloqueo de PDFs disponible. Soporta encriptación AES de 128 y 256 bits.'
  });
}
