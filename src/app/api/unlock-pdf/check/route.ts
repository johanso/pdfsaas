import { NextRequest, NextResponse } from 'next/server';

/**
 * Verifica si un PDF está protegido con contraseña
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // Leer el archivo como buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    try {
      // Importar pdfjs-dist dinámicamente para servidor
      const pdfjs = await import('pdfjs-dist');

      // Intentar cargar el PDF
      const loadingTask = pdfjs.getDocument({ data: buffer });
      const pdf = await loadingTask.promise;

      // Si llegamos aquí, el PDF no está protegido
      await pdf.destroy();

      return NextResponse.json({
        success: true,
        isEncrypted: false,
        message: 'El PDF no está protegido con contraseña'
      });
    } catch (error: any) {
      // Si hay un error de contraseña, el PDF está protegido
      if (error.name === 'PasswordException') {
        // Intentar determinar el tipo de encriptación
        let encryptionInfo = 'Protegido con contraseña';

        // pdfjs-dist no expone directamente el nivel de encriptación sin la contraseña
        // pero podemos inferir información básica
        if (error.message?.includes('256')) {
          encryptionInfo = '256-bit AES';
        } else if (error.message?.includes('128')) {
          encryptionInfo = '128-bit AES';
        }

        return NextResponse.json({
          success: true,
          isEncrypted: true,
          encryptionInfo,
          message: 'El PDF está protegido con contraseña'
        });
      }

      // Otro tipo de error
      throw error;
    }
  } catch (error: any) {
    console.error('Error al verificar PDF:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Error al verificar el PDF'
      },
      { status: 500 }
    );
  }
}
