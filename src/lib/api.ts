/**
 * Resuelve la URL del API basada en el entorno.
 * Si NEXT_PUBLIC_PDF_WORKER_URL está definido, redirige las llamadas de /api/worker directamente al VPS.
 */
export function getApiUrl(endpoint: string): string {
  const workerUrl = process.env.NEXT_PUBLIC_PDF_WORKER_URL;

  // Si estamos en el cliente y hay una URL de worker definida
  if (workerUrl && endpoint.startsWith('/api/worker')) {
    // Normalizar workerUrl (quitar slash final si existe)
    const base = workerUrl.endsWith('/') ? workerUrl.slice(0, -1) : workerUrl;

    // Quitar /api/worker del endpoint
    const path = endpoint.replace(/^\/?api\/worker/, '');

    // Si el workerUrl ya incluye /api al final, no lo duplicamos
    // Generalmente esperamos que workerUrl sea algo como http://ip:3001/api
    const fullUrl = `${base}${path.startsWith('/') ? path : '/' + path}`;

    console.log(`[getApiUrl] Direct VPS Call: ${fullUrl}`);
    return fullUrl;
  }

  // Por defecto (o en desarrollo sin variables), usar el proxy relativo de Next.js
  return endpoint;
}
