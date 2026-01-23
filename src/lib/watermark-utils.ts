/**
 * Parsea entrada de páginas en formato humano a JSON array
 *
 * @param input - Formato "1,3-5,10" o "all"
 * @param totalPages - Número total de páginas (opcional, para validación)
 * @returns JSON string "[1,3,4,5,10]" o "all"
 *
 * @example
 * parsePageInput("1,3-5,10") // "[1,3,4,5,10]"
 * parsePageInput("all") // "all"
 * parsePageInput("1-3") // "[1,2,3]"
 */
export function parsePageInput(input: string, totalPages?: number): string {
  const trimmed = input.trim().toLowerCase();

  // Si es "all", retornar directamente
  if (trimmed === 'all' || trimmed === '') {
    return 'all';
  }

  try {
    // Si ya es formato JSON válido, validar y retornar
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed) && parsed.every(n => typeof n === 'number' && n > 0)) {
      return input;
    }
  } catch {
    // No es JSON, continuar con parsing humano
  }

  const pages = new Set<number>();
  const parts = trimmed.split(',').map(p => p.trim()).filter(Boolean);

  for (const part of parts) {
    // Rango: "3-5"
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map(s => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      if (isNaN(start) || isNaN(end) || start < 1 || end < start) {
        throw new Error(`Rango inválido: ${part}`);
      }

      if (totalPages && (start > totalPages || end > totalPages)) {
        throw new Error(`Rango fuera de límites: ${part} (total: ${totalPages})`);
      }

      for (let i = start; i <= end; i++) {
        pages.add(i);
      }
    }
    // Número individual: "3"
    else {
      const num = parseInt(part, 10);
      if (isNaN(num) || num < 1) {
        throw new Error(`Número inválido: ${part}`);
      }

      if (totalPages && num > totalPages) {
        throw new Error(`Página fuera de límites: ${num} (total: ${totalPages})`);
      }

      pages.add(num);
    }
  }

  // Convertir set a array ordenado y retornar como JSON
  const sorted = Array.from(pages).sort((a, b) => a - b);
  return JSON.stringify(sorted);
}

/**
 * Convierte JSON array de páginas a formato humano legible
 *
 * @param jsonPages - JSON string "[1,3,4,5,10]" o "all"
 * @returns Formato humano "1, 3-5, 10" o "Todas"
 *
 * @example
 * formatPagesDisplay("[1,3,4,5,10]") // "1, 3-5, 10"
 * formatPagesDisplay("all") // "Todas"
 */
export function formatPagesDisplay(jsonPages: string): string {
  if (jsonPages === 'all') return 'Todas';

  try {
    const pages = JSON.parse(jsonPages) as number[];
    if (!Array.isArray(pages) || pages.length === 0) return 'Ninguna';

    const sorted = [...pages].sort((a, b) => a - b);
    const ranges: string[] = [];
    let rangeStart = sorted[0];
    let rangeEnd = sorted[0];

    for (let i = 1; i <= sorted.length; i++) {
      const current = sorted[i];

      // Si es consecutivo, extender rango
      if (current === rangeEnd + 1) {
        rangeEnd = current;
      }
      // Si no es consecutivo, cerrar rango actual
      else {
        if (rangeStart === rangeEnd) {
          ranges.push(`${rangeStart}`);
        } else if (rangeEnd === rangeStart + 1) {
          ranges.push(`${rangeStart}, ${rangeEnd}`);
        } else {
          ranges.push(`${rangeStart}-${rangeEnd}`);
        }

        rangeStart = current;
        rangeEnd = current;
      }
    }

    return ranges.join(', ');
  } catch {
    return 'Formato inválido';
  }
}
