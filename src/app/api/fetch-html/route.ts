import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL es requerida' }, { status: 400 });
  }

  try {
    // Validate URL protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return NextResponse.json({ error: 'URL inválida. Debe comenzar con http:// o https://' }, { status: 400 });
    }

    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json({ error: `Error al obtener la página: ${response.statusText}` }, { status: response.status });
    }

    let html = await response.text();

    // Inject <base> tag to help load relative assets
    try {
      const urlObj = new URL(url);
      const baseUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname.substring(0, urlObj.pathname.lastIndexOf('/') + 1)}`;
      const baseTag = `<base href="${baseUrl}">`;

      if (html.includes('<head>')) {
        html = html.replace('<head>', `<head>${baseTag}`);
      } else if (html.includes('<html>')) {
        html = html.replace('<html>', `<html><head>${baseTag}</head>`);
      } else {
        html = baseTag + html;
      }
    } catch (e) {
      console.error('Error parsing URL for base tag:', e);
    }

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store'
      },
    });
  } catch (error) {
    console.error('Fetch HTML error:', error);
    return NextResponse.json({ error: 'No se pudo obtener el contenido de la URL' }, { status: 500 });
  }
}
