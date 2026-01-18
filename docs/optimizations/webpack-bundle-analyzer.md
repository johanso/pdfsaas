# Herramienta: Webpack Bundle Analyzer

## 📊 Resumen

**Fecha:** 2026-01-18
**Estado:** ✅ Configurado
**Tipo:** Herramienta de análisis (no es una optimización directa)
**Propósito:** Visualizar y analizar el tamaño del bundle para identificar oportunidades de optimización

## 🎯 Qué es Bundle Analyzer

Webpack Bundle Analyzer es una herramienta que genera un **mapa visual interactivo** de todo el contenido de tu bundle. Te permite:

1. **Ver qué paquetes ocupan más espacio** en tu bundle
2. **Identificar dependencias duplicadas** o innecesarias
3. **Descubrir oportunidades de optimización** (code splitting, tree shaking, etc.)
4. **Comparar tamaños** antes y después de optimizaciones
5. **Entender la estructura** de tu aplicación

## ✅ Implementación

### 1. Instalación

```bash
npm install -D @next/bundle-analyzer
npm install -D cross-env
```

**Paquetes instalados:**
- `@next/bundle-analyzer@16.1.3` - Plugin oficial de Next.js para Bundle Analyzer
- `cross-env@10.1.0` - Para variables de entorno multiplataforma (Windows, Mac, Linux)

### 2. Configuración en next.config.ts

**Antes:**
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ... configuración
};

export default nextConfig;
```

**Después:**
```typescript
import type { NextConfig } from "next";
import withBundleAnalyzer from '@next/bundle-analyzer';

const nextConfig: NextConfig = {
  // ... configuración
};

// Configurar Bundle Analyzer (se activa con ANALYZE=true npm run build)
const withBundleAnalyzerConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzerConfig(nextConfig);
```

**Características:**
- ✅ Solo se activa cuando `ANALYZE=true`
- ✅ No afecta builds normales de producción
- ✅ Compatible con configuración de Webpack existente

### 3. Script en package.json

**Añadido:**
```json
{
  "scripts": {
    "dev": "next dev --webpack",
    "build": "next build --webpack",
    "start": "next start",
    "lint": "eslint",
    "analyze": "cross-env ANALYZE=true npm run build"
  }
}
```

**Script `analyze`:**
- Ejecuta build con variable de entorno `ANALYZE=true`
- Usa `cross-env` para funcionar en Windows, Mac y Linux
- Genera reportes HTML visuales del bundle

## 📈 Cómo Usar

### Ejecutar Análisis

```bash
npm run analyze
```

**Esto generará:**
1. Build de producción completo
2. Tres reportes HTML en `.next/analyze/`:
   - `client.html` - Bundle del cliente (más importante)
   - `nodejs.html` - Bundle del servidor Node.js
   - `edge.html` - Bundle del edge runtime

### Ver los Reportes

Los reportes se generan en `.next/analyze/`:

```bash
# Abrir en navegador (Windows)
start .next/analyze/client.html

# Abrir en navegador (Mac)
open .next/analyze/client.html

# Abrir en navegador (Linux)
xdg-open .next/analyze/client.html
```

O simplemente navegar a la carpeta y hacer doble click en `client.html`.

## 🔍 Interpretando los Reportes

### Reporte del Cliente (client.html)

El reporte más importante. Muestra:

**Vista Treemap:**
```
┌─────────────────────────────────────────┐
│ Chunk: main-app                         │
│  ┌────────────┐ ┌──────┐               │
│  │ pdfjs-dist │ │ radix│               │
│  │  (grande)  │ │ -ui  │               │
│  └────────────┘ └──────┘               │
│                                         │
│ Chunk: comprimir-pdf                    │
│  ┌────────┐                             │
│  │ hooks  │                             │
│  └────────┘                             │
└─────────────────────────────────────────┘
```

**Colores:**
- 🟥 Rojo: Paquetes muy grandes (>500KB)
- 🟧 Naranja: Paquetes grandes (>200KB)
- 🟨 Amarillo: Paquetes medianos (>100KB)
- 🟩 Verde: Paquetes pequeños (<100KB)

**Información por paquete:**
- Tamaño original (stat size)
- Tamaño parseado (parsed size)
- Tamaño comprimido con gzip (gzip size)

### Reporte del Servidor (nodejs.html)

Muestra el bundle del servidor Node.js:
- Dependencias de servidor
- Server Components
- API routes
- Middleware

### Reporte del Edge (edge.html)

Muestra el bundle del edge runtime:
- Edge Functions
- Edge Middleware
- Código optimizado para edge

## 💡 Cómo Identificar Optimizaciones

### 1. Buscar Paquetes Grandes

**Pregunta:** ¿Qué paquetes ocupan más espacio?

**Acción:**
- Click en el treemap para ver detalles
- Buscar paquetes >500KB
- Considerar:
  - ¿Se puede hacer lazy loading?
  - ¿Se puede usar una alternativa más pequeña?
  - ¿Se está importando todo el paquete cuando solo se necesita una parte?

**Ejemplo:**
```typescript
// ❌ MAL: Importa TODO pdfjs-dist upfront
import * as pdfjs from 'pdfjs-dist';

// ✅ BIEN: Lazy loading
const pdfjs = await import('pdfjs-dist');
```

### 2. Buscar Duplicados

**Pregunta:** ¿Hay múltiples versiones del mismo paquete?

**Síntoma:** Ver el mismo paquete en múltiples chunks

**Solución:**
- Verificar versiones en package.json
- Usar `npm dedupe` para eliminar duplicados
- Configurar webpack aliases si es necesario

### 3. Analizar Code Splitting

**Pregunta:** ¿Se está usando code splitting efectivamente?

**Ver:**
- ¿Cada página tiene su propio chunk?
- ¿Hay un chunk común para código compartido?
- ¿Las herramientas se cargan on-demand?

**Ejemplo del proyecto:**
```
✅ Chunks separados por herramienta:
- comprimir-pdf.js
- firmar-pdf.js
- ocr-pdf.js
... (cada uno carga solo cuando se necesita)
```

### 4. Verificar Tree Shaking

**Pregunta:** ¿Se está eliminando código no usado?

**Buscar:**
- Imports completos de librerías grandes
- Código muerto (dead code)
- Utilidades no usadas

**Ejemplo:**
```typescript
// ❌ MAL: Importa todo lodash (24KB)
import _ from 'lodash';

// ✅ BIEN: Solo importa lo que se usa
import debounce from 'lodash/debounce';
```

### 5. Analizar Impacto de Optimizaciones

**Workflow:**
```bash
# Antes de optimización
npm run analyze
# Guardar client.html como client-before.html

# Aplicar optimización
# ...

# Después de optimización
npm run analyze
# Comparar con client-before.html
```

## 📊 Resultados del Análisis Inicial

### Estado Actual (Post-Optimizaciones 1-6)

**Archivos generados:**
- `client.html` - 794 KB (reporte)
- `nodejs.html` - 1009 KB (reporte)
- `edge.html` - 274 KB (reporte)

**Principales hallazgos esperados:**

1. **Chunks principales:**
   - `main-app` - Código común de la aplicación
   - Chunks individuales por herramienta (dynamic imports ✅)

2. **Paquetes grandes identificados:**
   - `pdfjs-dist` - Lazy loaded ✅
   - `@radix-ui/*` - UI components (necesario)
   - `pdf-lib` - Manipulación de PDFs (necesario)
   - `react-pdf` - Renderizado de PDFs (necesario)

3. **Optimizaciones ya aplicadas:**
   - ✅ pdfjs-dist con lazy loading (Item 1)
   - ✅ Dynamic imports por herramienta (Item 2)
   - ✅ canvas excluido del cliente (Item 3)

## 🎓 Best Practices

### 1. ✅ Ejecutar análisis regularmente

```bash
# Antes de cualquier optimización mayor
npm run analyze

# Después de añadir dependencias grandes
npm install some-big-package
npm run analyze

# Antes de deploy a producción
npm run analyze
```

### 2. ✅ Guardar reportes históricos

```bash
# Crear carpeta de análisis histórico
mkdir -p analysis-history

# Guardar reporte con fecha
npm run analyze
cp .next/analyze/client.html "analysis-history/client-$(date +%Y%m%d).html"
```

### 3. ✅ Comparar antes/después

Cuando hagas una optimización:
1. Guardar reporte "before"
2. Aplicar optimización
3. Generar reporte "after"
4. Comparar lado a lado en navegador

### 4. ✅ Documentar hallazgos

Crear un archivo de notas con:
- Fecha del análisis
- Paquetes grandes identificados
- Acciones tomadas
- Resultados medidos

### 5. ✅ Establecer umbrales

Definir límites:
- Bundle inicial del cliente: < 500 KB (gzip)
- Chunks individuales: < 200 KB (gzip)
- Paquetes third-party: < 100 KB cada uno

## 📝 Archivos Modificados

```
next.config.ts          (MODIFICADO - añadido withBundleAnalyzer)
package.json            (MODIFICADO - añadido script "analyze")
.next/analyze/          (NUEVO - directorio con reportes)
  ├── client.html       (GENERADO - 794 KB)
  ├── nodejs.html       (GENERADO - 1009 KB)
  └── edge.html         (GENERADO - 274 KB)
```

## 🧪 Testing

### Verificar configuración
```bash
# Debe generar reportes sin errores
npm run analyze

# Debe existir el directorio
ls -la .next/analyze/

# Deben existir los 3 reportes
# - client.html
# - nodejs.html
# - edge.html
```

### Build normal NO debe analizar
```bash
# Build normal (sin análisis)
npm run build

# NO debe crear .next/analyze/
ls -la .next/analyze/  # Debe dar error o mostrar archivos viejos
```

## 💡 Uso Recomendado

### Cuando ejecutar el análisis:

✅ **SÍ ejecutar:**
- Antes de implementar optimizaciones grandes
- Después de añadir dependencias nuevas
- Antes de deployments importantes
- Cuando el bundle parece lento
- Mensualmente como parte de mantenimiento

❌ **NO ejecutar:**
- En cada commit (es lento, ~35 segundos)
- En CI/CD automático (a menos que sea necesario)
- Durante desarrollo activo (usa dev build)

### Workflow recomendado:

```bash
# 1. Análisis baseline
npm run analyze
# Abrir client.html, identificar problemas

# 2. Planear optimizaciones
# - Buscar paquetes >500KB
# - Identificar lazy loading opportunities
# - Buscar duplicados

# 3. Implementar optimización
# ... código ...

# 4. Verificar impacto
npm run analyze
# Comparar con baseline

# 5. Documentar resultados
# Actualizar docs/optimizations/
```

## 🔮 Próximos Pasos con Bundle Analyzer

### Análisis pendientes:

1. **Identificar más lazy loading opportunities:**
   - Buscar paquetes grandes que no se usan en todas las páginas
   - Candidatos: librerías de imagen, OCR, etc.

2. **Optimizar imports de Radix UI:**
   ```typescript
   // Verificar si estamos importando componentes correctamente
   // ✅ BIEN: Import directo
   import { Button } from "@radix-ui/react-button";

   // ❌ MAL: Import desde index (puede traer más código)
   import { Button } from "@radix-ui/react";
   ```

3. **Analizar vendor bundles:**
   - ¿Se puede separar vendors en chunks más pequeños?
   - ¿Hay oportunidad para splitChunks optimization?

4. **Verificar tree shaking:**
   - ¿Se está eliminando código no usado?
   - ¿Hay imports que no se usan?

## 📚 Referencias

- [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [Next.js Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- [Analyzing Bundle Size](https://nextjs.org/docs/app/building-your-application/optimizing/bundle-analyzer)
- [Understanding Webpack Chunks](https://webpack.js.org/guides/code-splitting/)

## ✅ Checklist

- [x] Instalar @next/bundle-analyzer
- [x] Instalar cross-env para Windows compatibility
- [x] Configurar next.config.ts
- [x] Añadir script "analyze" a package.json
- [x] Ejecutar análisis inicial exitoso
- [x] Verificar generación de reportes
- [x] Documentar herramienta
- [x] Actualizar README de optimizaciones
- [ ] Revisar client.html en navegador (recomendado)
- [ ] Identificar próximas optimizaciones basadas en análisis
- [ ] Establecer baseline de tamaños

## 🎯 Comandos Rápidos

```bash
# Ejecutar análisis
npm run analyze

# Abrir reporte del cliente (Windows)
start .next/analyze/client.html

# Abrir reporte del servidor (Windows)
start .next/analyze/nodejs.html

# Ver tamaños de archivos
ls -lh .next/analyze/

# Build normal (sin análisis)
npm run build
```

## 📈 Métricas de Éxito

Esta herramienta NO tiene impacto directo en performance, pero **facilita** la identificación de optimizaciones.

**Valor:**
- 🔍 Visibilidad completa del bundle
- 📊 Data-driven optimization decisions
- 🎯 Identificación rápida de problemas
- 📉 Monitoreo de crecimiento del bundle
- ✅ Validación de optimizaciones implementadas

**Optimizaciones identificadas gracias a esta herramienta:**
- Items 1-3 (se hicieron sin analyzer, pero ahora podemos validarlos)
- Items futuros se identificarán con esta herramienta

---

**Tipo:** Herramienta de análisis
**Esfuerzo:** 15 minutos de configuración
**ROI:** Muy Alto (facilita todas las demás optimizaciones)
**Impacto directo:** Ninguno (es una herramienta)
**Impacto indirecto:** ⭐⭐⭐⭐⭐ (esencial para optimizaciones)
