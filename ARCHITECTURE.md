# 🏗️ ARCHITECTURE.md - Guía de Arquitectura del Proyecto

> **Propósito**: Este documento sirve como guía exhaustiva para cualquier agente de IA o desarrollador que trabaje en este proyecto. Define la estructura, patrones, convenciones y reglas que deben seguirse para mantener la coherencia del código.

---

## 📋 Tabla de Contenidos

1. [Resumen del Proyecto](#resumen-del-proyecto)
2. [Estructura de Carpetas](#estructura-de-carpetas)
3. [Patrones de Diseño](#patrones-de-diseño)
4. [Convenciones de Nombres](#convenciones-de-nombres)
5. [Ejemplos de Código por Capa](#ejemplos-de-código-por-capa)
6. [Dependencias Principales](#dependencias-principales)
7. [Reglas de Estilo y Formateo](#reglas-de-estilo-y-formateo)
8. [Flujo Típico de Datos](#flujo-típico-de-datos)
9. [Antipatrones a Evitar](#antipatrones-a-evitar)

---

## 🎯 Resumen del Proyecto

**Nombre**: PDF SaaS (pdfconver)  
**Tipo**: Aplicación web SaaS para procesamiento de PDFs  
**Stack Principal**:
- **Framework**: Next.js 16 con App Router
- **Lenguaje**: TypeScript (strict mode)
- **UI**: React 19 + Tailwind CSS 4 + shadcn/ui (estilo "new-york")
- **PDF Engine**: pdf-lib + pdfjs-dist + Ghostscript (backend)
- **Estado**: Context API (FileContext global)
- **Drag & Drop**: @dnd-kit
- **Idioma UI**: Español

---

## 📁 Estructura de Carpetas

```
pdfsaas/
├── public/                    # Assets estáticos
│   └── pdf.worker.min.js      # Worker de pdfjs-dist
├── src/
│   ├── app/                   # 🔴 App Router de Next.js
│   │   ├── globals.css        # Estilos globales + variables CSS
│   │   ├── layout.tsx         # Layout raíz (providers, navbar, footer)
│   │   ├── page.tsx           # Landing page
│   │   ├── api/               # API Routes
│   │   │   └── unlock-pdf/    # Ejemplo de endpoint
│   │   └── [tool-name]/       # Páginas de cada herramienta
│   │       ├── page.tsx       # Server Component (metadata + SEO)
│   │       └── client.tsx     # Client Component (lógica interactiva)
│   │
│   ├── components/            # 🔵 Componentes React
│   │   ├── ui/                # Primitivos shadcn/ui
│   │   ├── layout/            # Navbar, Footer, Hero, CTA, etc.
│   │   ├── pdf-system/        # Sistema de tarjetas PDF
│   │   │   ├── pdf-card.tsx   # Tarjeta individual de PDF/página
│   │   │   ├── pdf-grid.tsx   # Grid con DnD
│   │   │   ├── pdf-preview-modal.tsx # Visor de PDF avanzado (zoom, multi-página)
│   │   │   └── pdf-tool-layout.tsx  # Layout compartido para tools
│   │   └── [componente].tsx   # Componentes específicos
│   │
│   ├── content/               # 📄 Contenido estático (CMS-like)
│   │   └── tools/             # Metadatos SEO y contenido por herramienta
│   │       ├── types.ts       # ToolPageData interface
│   │       ├── index.ts       # Re-exports
│   │       └── [tool].ts      # Contenido específico
│   │
│   ├── context/               # 🟢 Contextos globales
│   │   └── FileContext.tsx    # Estado global de archivos
│   │
│   ├── hooks/                 # 🟣 Custom Hooks
│   │   ├── index.ts           # Re-exports públicos
│   │   ├── core/              # Hooks internos base
│   │   │   ├── useToolProcessor.ts  # Procesador genérico (core)
│   │   │   ├── phase-mapper.ts      # Mapeo de fases interno→UI
│   │   │   ├── useXhrUpload.ts      # Upload con progreso
│   │   │   └── useDownload.ts       # Descargas
│   │   ├── factories/         # Factory hooks
│   │   │   └── createPdfToolHook.ts # Genera hooks simples (1 archivo)
│   │   │
│   │   │   # Hooks especializados por herramienta:
│   │   ├── useCompressPdf.ts       # Compresión (factory)
│   │   ├── useProtectPdf.ts        # Proteger con contraseña (factory)
│   │   ├── useUnlockPdf.ts         # Desbloquear PDF (factory)
│   │   ├── useFlattenPdf.ts        # Aplanar PDF (factory)
│   │   ├── useGrayscalePdf.ts      # Escala de grises (factory)
│   │   ├── useRepairPdf.ts         # Reparar PDF (factory)
│   │   ├── useOcrPdf.ts            # OCR (factory)
│   │   ├── usePdfToImage.ts        # PDF a imagen (factory)
│   │   ├── useImageToPdf.ts        # Imagen a PDF (factory)
│   │   │
│   │   │   # Hooks complejos (multi-archivo, useToolProcessor directo):
│   │   ├── useMergePdf.ts          # Unir PDFs
│   │   ├── useSplitPdf.ts          # Dividir PDF
│   │   ├── useRotatePdf.ts         # Rotar páginas
│   │   ├── useOrganizePdf.ts       # Organizar páginas
│   │   ├── useExtractPages.ts      # Extraer páginas
│   │   ├── useDeletePages.ts       # Eliminar páginas
│   │   ├── useWordToPdf.ts         # Word a PDF
│   │   ├── useExcelToPdf.ts        # Excel a PDF
│   │   ├── usePowerPointToPdf.ts   # PowerPoint a PDF
│   │   └── useHtmlToPdf.ts         # HTML/URL a PDF
│   │
│   ├── lib/                   # 🟠 Utilidades y configuración
│   │   ├── utils.ts           # cn() helper de Tailwind
│   │   ├── config.ts          # Constantes (límites, etc.)
│   │   ├── tools-data.ts      # Registro de herramientas
│   │   ├── tools-categories.ts # Categorías de herramientas
│   │   ├── errors/            # Sistema de errores tipados
│   │   │   ├── error-types.ts # AppError, ErrorCodes
│   │   │   ├── notifications.ts # notify(), pdfNotify()
│   │   │   └── retry.ts       # Lógica de reintentos
│   │   └── [util].ts          # Utilidades específicas
│   │
│   ├── types/                 # 🔷 Tipos TypeScript
│   │   ├── index.ts           # Re-exports
│   │   ├── pdf.ts             # Tipos relacionados a PDFs
│   │   ├── tools.ts           # Tipos de herramientas
│   │   └── components.ts      # Props de componentes
│   │
│   └── images/                # Imágenes importables
│
├── components.json            # Configuración shadcn/ui
├── tsconfig.json              # Config TypeScript
├── eslint.config.mjs          # Config ESLint
├── tailwind.config.ts         # (Tailwind 4 usa CSS nativo)
└── package.json
```

### Propósito de Cada Carpeta

| Carpeta | Propósito | Quién la modifica |
|---------|-----------|-------------------|
| `app/` | Rutas y páginas. Cada tool tiene su carpeta con `page.tsx` (server) y `client.tsx` (client) | Al agregar nuevas herramientas |
| `components/ui/` | Primitivos de shadcn/ui. **NO modificar directamente** | Solo vía `npx shadcn add` |
| `components/pdf-system/` | Sistema de visualización PDF unificado | Al cambiar comportamiento de cards |
| `content/tools/` | Contenido SEO/marketing por herramienta | Al crear nueva herramienta |
| `hooks/core/` | Lógica base (`useToolProcessor`, `phase-mapper`). **Alta estabilidad** | Con precaución |
| `hooks/factories/` | Factory para hooks simples (1 archivo). **Crítico** | Solo si se necesita nuevo patrón |
| `hooks/use*.ts` | Hooks especializados por herramienta | Al crear nueva herramienta |
| `lib/errors/` | Sistema centralizado de errores | Al agregar nuevos tipos de error |

### Catálogo de Hooks Especializados

Todos los hooks de herramientas están en `hooks/` y exportados desde `hooks/index.ts`:

| Hook | Herramienta | Patrón | Características |
|------|-------------|--------|-----------------|
| `useCompressPdf` | Comprimir PDF | Factory | Modos: baja/recomendada/extrema |
| `useProtectPdf` | Proteger PDF | Factory | Encriptación con contraseña |
| `useUnlockPdf` | Desbloquear PDF | Factory | Requiere contraseña |
| `useFlattenPdf` | Aplanar PDF | Factory | Elimina capas editables |
| `useGrayscalePdf` | Escala de grises | Factory | Conversión a B/N |
| `useRepairPdf` | Reparar PDF | Factory | Corrección de errores |
| `useOcrPdf` | OCR | Factory | Reconocimiento de texto |
| `usePdfToImage` | PDF a imagen | Factory | Exportar como PNG/JPG |
| `useImageToPdf` | Imagen a PDF | Factory | Convertir imágenes |
| `useMergePdf` | Unir PDFs | Directo | Multi-archivo, reordenable |
| `useSplitPdf` | Dividir PDF | Directo | Por rangos o cantidad fija |
| `useRotatePdf` | Rotar páginas | Directo | Rotación por página |
| `useOrganizePdf` | Organizar | Directo | Multi-archivo, páginas en blanco |
| `useExtractPages` | Extraer páginas | Directo | Selección múltiple |
| `useDeletePages` | Eliminar páginas | Directo | Selección por rango |
| `useWordToPdf` | Word a PDF | Directo | .doc, .docx |
| `useExcelToPdf` | Excel a PDF | Directo | .xls, .xlsx |
| `usePowerPointToPdf` | PowerPoint a PDF | Directo | .ppt, .pptx |
| `useHtmlToPdf` | HTML/URL a PDF | Directo | Archivo o URL |

---

## 🎨 Patrones de Diseño

### 1. **Patrón Server/Client Split** (Next.js App Router)

Cada herramienta tiene dos archivos:

```
src/app/comprimir-pdf/
├── page.tsx      # Server Component - Metadata, SEO, JSON-LD
└── client.tsx    # Client Component - UI interactiva
```

**page.tsx** (Server Component):
```tsx
import type { Metadata } from "next";
import { ToolPageLayout } from "@/components/tool-page-layout";
import { compressPdfContent } from "@/content/tools";
import CompressPdfClient from "./client";

export const metadata: Metadata = {
  title: compressPdfContent.metadata.title,
  description: compressPdfContent.metadata.description,
  // ...
};

export default function CompressPdfPage() {
  return (
    <ToolPageLayout data={compressPdfContent} categoryId="OPTIMIZE">
      <CompressPdfClient />
    </ToolPageLayout>
  );
}
```

**client.tsx** (Client Component):
```tsx
"use client";  // ⚠️ OBLIGATORIO al inicio

import { useState, useCallback } from "react";
import { useCompressPdf } from "@/hooks/useCompressPdf";
// ... resto de imports

export default function CompressPdfClient() {
  // Toda la lógica interactiva aquí
}
```

### 2. **Factory Pattern para Hooks** (createPdfToolHook)

Todos los hooks de herramientas se crean con un factory para evitar duplicación:

```typescript
// hooks/useCompressPdf.ts
import { createPdfToolHook } from "./factories/createPdfToolHook";

export const useCompressPdf = createPdfToolHook<CompressOptions, CompressResult>({
  toolId: "compress-pdf",
  endpoint: "/api/worker/compress-pdf",
  operationName: "Comprimiendo PDF",
  
  buildFormData: (file, options) => [
    ["mode", options.mode],
    ["preset", options.preset || "recommended"],
  ],
  
  getFileName: (result, original) =>
    original.replace(".pdf", "-comprimido.pdf"),
    
  progressWeights: {
    preparing: 5,
    uploading: 35,
    processing: 50,
    downloading: 10,
  },
});
```

**Regla**: Para crear una nueva herramienta de procesamiento, usar SIEMPRE `createPdfToolHook`.

### 2.1 **Hooks Especializados vs Factory Pattern**

Existen dos patrones para crear hooks de herramientas:

#### A) Factory Pattern (operaciones simples de 1 archivo)

Para herramientas que procesan un solo archivo con opciones simples:

```typescript
// hooks/useProtectPdf.ts
import { createPdfToolHook } from "./factories/createPdfToolHook";

export const useProtectPdf = createPdfToolHook<ProtectOptions, ProtectResult>({
  toolId: "protect-pdf",
  endpoint: "/api/worker/protect-pdf",
  operationName: "Protegiendo PDF",
  buildFormData: (file, options) => [
    ["password", options.password],
  ],
});
```

#### B) useToolProcessor Directo (operaciones complejas/multi-archivo)

Para herramientas con lógica compleja, múltiples archivos, o necesidades especiales:

```typescript
// hooks/useMergePdf.ts
import { useToolProcessor } from "./core/useToolProcessor";
import { mapProcessorPhaseToLegacy } from "./core/phase-mapper";

export interface MergeResult extends ProcessingResult {
  filesCount: number;
  totalPages: number;
}

export function useMergePdf() {
  const processor = useToolProcessor<MergeResult>({
    endpoint: "/api/worker/merge-pdf",
  });

  const merge = useCallback(async (
    files: File[],
    options: MergeOptions
  ) => {
    // Construcción manual de FormData para múltiples archivos
    const formData = new FormData();
    files.forEach((file, i) => formData.append(`file${i}`, file));
    formData.append("fileName", options.fileName);
    
    await processor.process(formData, options.fileName);
  }, [processor]);

  return {
    ...processor,
    phase: mapProcessorPhaseToLegacy(processor.phase),
    merge,
  };
}
```

#### Cuándo usar cada patrón:

| Característica | Factory (`createPdfToolHook`) | Directo (`useToolProcessor`) |
|----------------|-------------------------------|-----------------------------|
| Archivos | 1 solo archivo | Múltiples archivos |
| FormData | Automático vía `buildFormData` | Construcción manual |
| Complejidad | Baja | Media-Alta |
| Ejemplos | compress, protect, unlock, flatten | merge, split, organize, extract |

### 3. **Composition Pattern** (PdfToolLayout)

Las páginas de herramientas usan composición en lugar de herencia:

```tsx
<PdfToolLayout
  toolId="compress-pdf"
  title="Comprimir PDF"
  hasFiles={!!file}
  onFilesSelected={handleFilesSelected}
  onReset={handleReset}
  summaryItems={[...]}
  sidebarCustomControls={<CustomOptions />}  // 👈 Composición
>
  <PdfGrid items={files} config={PDF_CARD_PRESETS.compress} />
</PdfToolLayout>
```

### 4. **Preset Pattern** (PDF_CARD_PRESETS)

Configuraciones predefinidas para evitar props repetitivos:

```typescript
// components/pdf-system/pdf-card.tsx
export const PDF_CARD_PRESETS = {
  merge: {
    layout: "list",
    draggable: true,
    removable: true,
    showFileName: true,
  },
  delete: {
    selectable: true,
    selectedColorName: "red",
    iconSelectedName: "x",
  },
  // ... más presets
};

// Uso:
<PdfGrid config={PDF_CARD_PRESETS.merge} />
```

### 5. **Error Boundary Pattern**

Errores manejados en niveles jerárquicos:

```tsx
// layout.tsx
<ErrorBoundary level="app">
  <FileContextProvider>
    {children}
  </FileContextProvider>
</ErrorBoundary>
```

### 6. **Dynamic Loading Pattern (Client-Only Components)**

Los componentes que consumen librerías pesadas o incompatibles con SSR (como `pdfjs-dist`) deben cargarse dinámicamente:

```tsx
// components/pdf-system/pdf-card.tsx
const PdfPreviewModal = dynamic(
  () => import("./pdf-preview-modal").then((m) => m.PdfPreviewModal),
  { ssr: false }
);
```

**Regla**: Cualquier componente que importe `pdfjs-dist` o `react-pdf` debe exportarse/importarse usando este patrón para evitar el error `Object.defineProperty called on non-object` durante el SSR.

### 7. **Typed Error System**

Sistema de errores con códigos y mensajes amigables:

```typescript
// lib/errors/error-types.ts
export const ErrorCodes = {
  FILE_TOO_LARGE: "E2001",
  FILE_PROTECTED: "E2004",
  PROCESSING_FAILED: "E3001",
  // ...
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly category: ErrorCategory;
  readonly userMessage: { title, description, suggestion };
  // ...
}

// Uso:
throw createError.fileTooLarge("document.pdf", size, maxSize);
```

---

## 📝 Convenciones de Nombres

### Archivos

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Componentes React | `kebab-case.tsx` | `pdf-card.tsx`, `save-dialog.tsx` |
| Hooks | `use[Feature].ts` (camelCase) | `useCompressPdf.ts`, `usePdfLoader.ts` |
| Utilidades | `kebab-case.ts` | `pdf-page-utils.ts`, `canvas-utils.ts` |
| Tipos | `kebab-case.ts` o dentro de módulo | `types.ts`, `error-types.ts` |
| Contenido | `kebab-case.ts` | `compress-pdf.ts`, `merge-pdf.ts` |
| Páginas Next.js | `page.tsx` + `client.tsx` | Siempre estos nombres exactos |
| API Routes | carpeta con `route.ts` | `api/unlock-pdf/route.ts` |

### Funciones y Variables

```typescript
// ✅ CORRECTO
const handleFilesSelected = () => {};     // Handlers: handle[Action]
const useCompressPdf = () => {};          // Hooks: use[Feature]
const formatBytes = () => {};             // Utils: verbo + sustantivo
const PDF_CARD_PRESETS = {};              // Constantes: SCREAMING_SNAKE_CASE
const isProcessing = true;                // Booleanos: is/has/can/should

// ❌ INCORRECTO
const filesSelectedHandler = () => {};   // No usar sufijo Handler
const compressPdfHook = () => {};         // Los hooks DEBEN empezar con "use"
const FORMATBYTES = () => {};             // Funciones no van en SCREAMING_CASE
```

### Componentes React

```typescript
// ✅ CORRECTO
export function PdfCard() {}              // PascalCase
export const PDF_CARD_PRESETS = {};       // Constantes exportadas
export default function CompressPdfClient() {}  // Componentes de página

// ❌ INCORRECTO
export function pdfCard() {}              // NO usar camelCase
export function Pdf_Card() {}             // NO usar snake_case
```

### Tipos e Interfaces

```typescript
// ✅ CORRECTO
interface PdfCardProps {}                 // Props: [Component]Props
interface CompressOptions {}              // Options: [Feature]Options
interface CompressResult {}               // Result: [Feature]Result
type ProcessingPhase = "idle" | "...";    // Union types descriptivos
type ErrorCode = typeof ErrorCodes[...];  // Derived types

// ❌ INCORRECTO
interface IPdfCard {}                     // NO usar prefijo I
interface PdfCardInterface {}             // NO usar sufijo Interface
type pdfCardProps = {};                   // Tipos van en PascalCase
```

### Rutas de Herramientas (URLs)

Todas las rutas de herramientas usan **español en kebab-case**:

```
/comprimir-pdf        ✅
/unir-pdf             ✅
/pdf-a-imagen         ✅
/eliminar-paginas-pdf ✅

/compress-pdf         ❌ No usar inglés
/comprimirPdf         ❌ No usar camelCase
```

---

## 💡 Ejemplos de Código por Capa

### 1. Contenido de Herramienta (`content/tools/[tool].ts`)

```typescript
import { ToolPageData } from "./types";

export const compressPdfContent: ToolPageData = {
  id: "compress-pdf",
  
  metadata: {
    title: "Comprimir PDF - Reducir Tamaño de Archivo PDF Gratis",
    description: "Reduce el peso de tus PDFs sin perder calidad...",
    keywords: ["comprimir pdf", "reducir tamaño pdf", ...],
    canonical: "/comprimir-pdf",
  },

  steps: [
    { number: "1", title: "Sube tu archivo", description: "..." },
    { number: "2", title: "Elige nivel", description: "..." },
    { number: "3", title: "Descarga", description: "..." },
  ],

  benefits: [
    { icon: "Zap", title: "Rápido", description: "..." },
    // ...
  ],

  faqs: [
    { question: "¿Cuánto puedo reducir?", answer: "..." },
    // ...
  ],

  cta: {
    title: "¿Tu PDF es muy grande?",
    description: "Hazlo más ligero en segundos.",
    buttonLabel: "Comprimir PDF ahora",
  },

  jsonLd: { /* Schema.org structured data */ },
};
```

### 2. Hook de Herramienta (`hooks/use[Tool].ts`)

```typescript
import { createPdfToolHook } from "./factories/createPdfToolHook";
import type { ProcessingResult } from "./core/useToolProcessor";

// 1. Definir tipos
export interface GrayscaleOptions {
  contrast: number;
  fileName: string;
}

export interface GrayscaleResult extends ProcessingResult {
  pagesConverted: number;
}

// 2. Crear hook con factory
const useGrayscalePdfBase = createPdfToolHook<GrayscaleOptions, GrayscaleResult>({
  toolId: "grayscale-pdf",
  endpoint: "/api/worker/grayscale-pdf",
  operationName: "Convirtiendo a escala de grises",
  
  buildFormData: (file, options) => [
    ["contrast", String(options.contrast)],
  ],
  
  getFileName: (result, original) =>
    original.replace(".pdf", "-grises.pdf"),
});

// 3. Exportar con alias si es necesario
export function useGrayscalePdf() {
  const hook = useGrayscalePdfBase();
  return {
    ...hook,
    convert: hook.process,  // Alias para mejor DX
  };
}
```

### 3. Cliente de Herramienta (`app/[tool]/client.tsx`)

```tsx
"use client";

import { useState, useCallback } from "react";
import { notify } from "@/lib/errors/notifications";

// UI Components
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";
import { PdfToolLayout } from "@/components/pdf-system/pdf-tool-layout";
import ProcessingScreen from "@/components/processing-screen";

// Hooks
import { usePdfFiles } from "@/hooks/usePdfFiles";
import { useGrayscalePdf } from "@/hooks/useGrayscalePdf";

export default function GrayscalePdfClient() {
  // Estado local de opciones
  const [contrast, setContrast] = useState(100);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Hooks de archivos y procesamiento
  const { files, addFiles, removeFile, reset: resetFiles } = usePdfFiles();
  const {
    isProcessing,
    isComplete,
    progress,
    phase,
    result,
    uploadStats,
    convert,
    handleDownloadAgain,
    handleStartNew,
    cancelOperation,
  } = useGrayscalePdf();

  const file = files[0]?.file || null;

  // Handlers
  const handleFilesSelected = useCallback((newFiles: File[]) => {
    if (newFiles[0]?.type !== "application/pdf") {
      notify.error("Selecciona un archivo PDF válido");
      return;
    }
    addFiles([newFiles[0]]);
  }, [addFiles]);

  const handleSubmit = async (fileName: string) => {
    if (!file) return;
    setIsDialogOpen(false);
    await convert(file, { contrast, fileName });
  };

  const handleReset = () => {
    resetFiles();
    setContrast(100);
  };

  return (
    <>
      <PdfToolLayout
        toolId="grayscale-pdf"
        title="Convertir PDF a Escala de Grises"
        hasFiles={!!file}
        onFilesSelected={handleFilesSelected}
        onReset={handleReset}
        summaryItems={[{ label: "Contraste", value: `${contrast}%` }]}
        downloadButtonText="Convertir a Grises"
        onDownload={() => setIsDialogOpen(true)}
        sidebarCustomControls={/* Controles de opciones */}
        saveDialogProps={{ open: isDialogOpen, ... }}
      >
        <PdfGrid
          items={files}
          config={PDF_CARD_PRESETS.compress}
          layout="list"
          onRemove={(id) => removeFile(id)}
        />
      </PdfToolLayout>

      {/* ProcessingScreen con toolMetrics específicas */}
      {(isProcessing || isComplete) && (
        <ProcessingScreen
          fileName={result?.fileName || "documento.pdf"}
          operation="Convirtiendo a escala de grises"
          progress={progress}
          isComplete={isComplete}
          phase={phase}
          uploadStats={uploadStats}
          onDownload={handleDownloadAgain}
          onEditAgain={handleStartNew}
          onStartNew={() => {
            handleStartNew();
            handleReset();
          }}
          onCancel={cancelOperation}
          toolMetrics={
            result
              ? {
                  type: "simple",
                  data: {
                    originalSize: result.originalSize,
                    resultSize: result.resultSize,
                  }
                }
              : undefined
          }
        />
      )}
    </>
  );
}
```

### 3.1 Sistema de ToolMetrics

El `ProcessingScreen` soporta métricas específicas por tipo de herramienta:

```typescript
// Tipos de métricas disponibles
interface ToolMetrics {
  type: "compression" | "merge" | "split" | "pages" | "convert" | "protect" | "repair" | "simple";
  data?: {
    // compression
    originalSize?: number;
    resultSize?: number;
    reduction?: number;
    
    // merge
    filesCount?: number;
    totalPages?: number;
    
    // split
    outputFiles?: number;
    
    // pages (rotate, extract, delete, organize)
    pagesProcessed?: number;
    pagesTotal?: number;
    operation?: string;  // "Rotadas", "Extraídas", "Eliminadas"
    
    // convert (Word, Excel, PowerPoint, HTML)
    originalFormat?: string;
    sheets?: number;
    slides?: number;
    
    // protect
    encryption?: string;
    
    // repair
    fullyRepaired?: boolean;
    repairActions?: string[];
  };
}
```

**Ejemplos de uso por herramienta:**

```tsx
// Unir PDFs
toolMetrics={{ type: "merge", data: { filesCount: 3, totalPages: 45 } }}

// Dividir PDF
toolMetrics={{ type: "split", data: { outputFiles: 5, totalPages: 20 } }}

// Rotar páginas
toolMetrics={{ type: "pages", data: { pagesProcessed: 3, pagesTotal: 10, operation: "Rotadas" } }}

// Eliminar páginas
toolMetrics={{ type: "pages", data: { pagesProcessed: 2, pagesTotal: 8, operation: "Eliminadas" } }}

// Word a PDF
toolMetrics={{ type: "convert", data: { originalFormat: "DOCX", resultSize: 1024000 } }}

// Excel a PDF
toolMetrics={{ type: "convert", data: { originalFormat: "XLSX", sheets: 3 } }}

// PowerPoint a PDF
toolMetrics={{ type: "convert", data: { originalFormat: "PPTX", slides: 15 } }}
```

### 4. Sistema de Notificaciones (`lib/errors/notifications.ts`)

```typescript
// Uso básico
import { notify } from "@/lib/errors/notifications";

notify.success("¡PDF comprimido correctamente!");
notify.error("El archivo es demasiado grande");
notify.warning("Algunos archivos fueron ignorados");
notify.loading("Procesando...");

// Notificaciones específicas de PDF
import { pdfNotify } from "@/lib/errors/notifications";

pdfNotify.processingStart("documento.pdf", "Comprimiendo");
pdfNotify.processingProgress("documento.pdf", 45, "Optimizando imágenes");
pdfNotify.processingComplete("documento.pdf", "Reducido 70%");
pdfNotify.fileTooLarge("grande.pdf", 200_000_000, 150_000_000);
```

---

## 📦 Dependencias Principales

### Core
| Dependencia | Versión | Uso |
|-------------|---------|-----|
| `next` | 16.0.7 | Framework React con App Router |
| `react` | 19.2.0 | UI Library |
| `typescript` | ^5 | Tipado estático |

### PDF Processing
| Dependencia | Uso |
|-------------|-----|
| `pdf-lib` | Manipulación de PDFs (merge, split, rotate) |
| `pdfjs-dist` | Renderizado de previews, extracción de páginas |
| `react-pdf` | Componente React para visualización |

### UI
| Dependencia | Uso |
|-------------|-----|
| `tailwindcss` | Framework CSS utility-first |
| `@radix-ui/*` | Primitivos accesibles (dialogs, dropdowns) |
| `lucide-react` | Iconos |
| `sonner` | Toast notifications |
| `class-variance-authority` | Variantes de componentes |
| `clsx` + `tailwind-merge` | Merge de clases CSS |

### Drag & Drop
| Dependencia | Uso |
|-------------|-----|
| `@dnd-kit/core` | Core de DnD |
| `@dnd-kit/sortable` | Listas reordenables |
| `@dnd-kit/utilities` | Helpers de transformación |

### Utilidades
| Dependencia | Uso |
|-------------|-----|
| `uuid` | Generación de IDs únicos |
| `jszip` | Compresión de múltiples archivos |
| `fflate` | Compresión GZIP para uploads |

---

## 🎨 Reglas de Estilo y Formateo

### TypeScript

```typescript
// tsconfig.json - "strict": true está habilitado
// Todas estas reglas aplican:

// ✅ Tipos explícitos en funciones exportadas
export function formatBytes(bytes: number, decimals = 2): string { }

// ✅ Usar type inference en variables locales
const items = files.map(f => f.id);  // string[] inferido

// ✅ Interfaces para objetos, types para uniones
interface PdfCardProps { ... }
type ProcessingPhase = "idle" | "uploading" | "complete";

// ✅ Generics cuando aplique
function createPdfToolHook<TOptions, TResult>() { }
```

### Tailwind CSS

```tsx
// ✅ Usar cn() para merge condicional de clases
import { cn } from "@/lib/utils";

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === "primary" && "primary-classes"
)} />

// ✅ Usar variables CSS para colores del tema
// Definidas en globals.css con oklch()
className="bg-primary text-primary-foreground"
className="border-border bg-background"

// ❌ NO usar colores hardcodeados
className="bg-orange-500"  // Evitar
className="bg-[#ff6600]"   // Evitar
```

### Componentes UI

```tsx
// ✅ Importar de @/components/ui/
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// ✅ Usar variantes definidas
<Button variant="ghost" size="icon" />

// ❌ NO modificar componentes en ui/ directamente
// Para personalizaciones, crear wrapper en components/
```

### Imports

```typescript
// ✅ Orden de imports:
// 1. React/Next
import { useState, useCallback } from "react";
import { usePathname } from "next/navigation";

// 2. Librerías externas
import { Loader2 } from "lucide-react";

// 3. Alias internos (@/)
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCompressPdf } from "@/hooks/useCompressPdf";

// 4. Imports relativos (evitar si es posible)
import { ThumbnailSkeleton } from "./thumbnail-skeleton";
```

---

## 🔄 Flujo Típico de Datos

### Flujo de Procesamiento de PDF

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Usuario   │────▶│  Dropzone    │────▶│  FileContext    │
│ Sube archivo│     │  Componente  │     │ (Estado Global) │
└─────────────┘     └──────────────┘     └────────┬────────┘
                                                  │
                    ┌─────────────────────────────┘
                    ▼
         ┌────────────────────┐
         │   client.tsx       │
         │ (Configuración UI) │
         └─────────┬──────────┘
                   │ Usuario hace clic en "Procesar"
                   ▼
         ┌────────────────────┐
         │   use[Tool].ts     │
         │ (Hook específico)  │
         └─────────┬──────────┘
                   │
                   ▼
         ┌────────────────────┐
         │ useToolProcessor   │
         │   (Hook core)      │
         └─────────┬──────────┘
                   │
    ┌──────────────┼──────────────┐
    ▼              ▼              ▼
┌────────┐   ┌──────────┐   ┌──────────┐
│Preparing│──▶│Uploading │──▶│Processing│
│FormData │   │(XHR+Gzip)│   │(Servidor)│
└────────┘   └──────────┘   └────┬─────┘
                                  │
                   ┌──────────────┘
                   ▼
         ┌────────────────────┐
         │   Downloading      │
         │  (Blob response)   │
         └─────────┬──────────┘
                   │
                   ▼
         ┌────────────────────┐
         │  ProcessingScreen  │
         │  (Éxito + Descarga)│
         └────────────────────┘
```

### Flujo de Estado con FileContext

```typescript
// 1. Proveedor en layout.tsx
<FileContextProvider>
  {children}
</FileContextProvider>

// 2. Consumo en cualquier componente
const { files, addFiles, removeFile, reset } = useFileContext();

// 3. El contexto maneja:
// - Validación de tipo de archivo
// - Límites de tamaño
// - Extracción de pageCount
// - Reset automático al cambiar de ruta
```

### Flujo de Errores

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Error     │────▶│  createError.*   │────▶│    AppError     │
│  Original   │     │  (Factory)       │     │ (Clase tipada)  │
└─────────────┘     └──────────────────┘     └────────┬────────┘
                                                      │
                    ┌─────────────────────────────────┘
                    ▼
         ┌────────────────────┐
         │  notify.fromError  │
         │ o notify.error()   │
         └─────────┬──────────┘
                   │
                   ▼
         ┌────────────────────┐
         │  ToastContainer    │
         │  (UI Notification) │
         └────────────────────┘
```

---

## 🚫 Antipatrones a Evitar

### 1. ❌ NO modificar componentes de `ui/` directamente

```typescript
// ❌ MAL: Editar components/ui/button.tsx
// ✅ BIEN: Crear un wrapper o usar className
<Button className="custom-class" />

// O crear un componente nuevo:
// components/custom-button.tsx
export function CustomButton() {
  return <Button className="..." />;
}
```

### 2. ❌ NO duplicar lógica de hooks

```typescript
// ❌ MAL: Copiar/pegar useCompressPdf para hacer useGrayscalePdf
// ✅ BIEN: Usar la factory
const useGrayscalePdf = createPdfToolHook({ ... });
```

### 2.1 ❌ NO usar hooks genéricos cuando existe uno especializado

```typescript
// ❌ MAL: Usar usePdfProcessing genérico (DEPRECADO)
import { usePdfProcessing } from "@/hooks/usePdfProcessing";
const { process } = usePdfProcessing("/api/worker/merge-pdf");

// ✅ BIEN: Usar el hook especializado
import { useMergePdf } from "@/hooks/useMergePdf";
const { merge, result, phase } = useMergePdf();
```

**Regla**: Cada herramienta tiene su hook especializado con tipos específicos. No usar hooks genéricos.

### 3. ❌ NO usar `any` sin justificación

```typescript
// ❌ MAL
const data: any = response;

// ✅ BIEN
interface ApiResponse { ... }
const data: ApiResponse = response;

// ✅ Si es inevitable, documentar
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const legacy: any = externalLib.unknownMethod();
```

### 4. ❌ NO mezclar Server y Client Components incorrectamente

```typescript
// ❌ MAL: useState en un Server Component
// page.tsx (sin "use client")
import { useState } from "react";  // Error!

// ✅ BIEN: Separar en page.tsx + client.tsx
// page.tsx (Server)
import ClientComponent from "./client";
export default function Page() {
  return <ClientComponent />;
}

// client.tsx
"use client";
import { useState } from "react";
```

### 5. ❌ NO hardcodear strings de UI

```typescript
// ❌ MAL
notify.error("File too large");

// ✅ BIEN: Usar el sistema de errores
throw createError.fileTooLarge(fileName, size, maxSize);
// El mensaje viene de ErrorMessages[ErrorCodes.FILE_TOO_LARGE]
```

### 6. ❌ NO ignorar el patrón de contenido para SEO

```typescript
// ❌ MAL: Metadata hardcodeada en page.tsx
export const metadata = {
  title: "Comprimir PDF",  // Hardcodeado
};

// ✅ BIEN: Usar content/tools/
import { compressPdfContent } from "@/content/tools";
export const metadata: Metadata = {
  title: compressPdfContent.metadata.title,
};
```

### 7. ❌ NO usar colores fuera del tema

```css
/* ❌ MAL */
.button { background: #ff5500; }

/* ✅ BIEN */
.button { background: var(--primary); }
/* O en Tailwind: */
className="bg-primary"
```

### 8. ❌ NO procesar PDFs en el cliente para operaciones pesadas

```typescript
// ❌ MAL: Compresión pesada en el navegador
const compressed = await heavyPdfLib.compress(file);

// ✅ BIEN: Enviar al servidor
const result = await uploadToApi("/api/worker/compress-pdf", file);
```

### 9. ❌ NO olvidar limpiar estado entre navegaciones

```typescript
// El FileContext ya maneja esto automáticamente
// Pero si creas estado local, asegúrate de limpiarlo:

useEffect(() => {
  return () => {
    // Cleanup al desmontar
    setLocalState(initialState);
  };
}, []);
```

### 10. ❌ NO crear hooks que no empiecen con "use"

```typescript
// ❌ MAL
export function pdfProcessor() { ... }
export function getPdfData() { ... }

// ✅ BIEN
export function usePdfProcessor() { ... }
// O si no es un hook, que sea claramente una utilidad:
export function processPdf() { ... }  // En lib/
```

### 11. ❌ NO usar successDetails cuando toolMetrics es más apropiado

```tsx
// ❌ MAL: Usar successDetails para herramientas que no son de compresión
<ProcessingScreen
  successDetails={{
    originalSize: 1000,
    compressedSize: 500,    // ¡Dice "comprimido" pero es merge!
    reductionPercentage: 50,
    savedBytes: 500,
  }}
/>

// ✅ BIEN: Usar toolMetrics con el tipo correcto
<ProcessingScreen
  toolMetrics={{
    type: "merge",
    data: {
      filesCount: 3,
      totalPages: 45,
      resultSize: 2048000,
    }
  }}
/>
```

**Regla**: `successDetails` es solo para compresión (legacy). Usar `toolMetrics` para todas las demás herramientas.

---

## 📚 Recursos Adicionales

- **shadcn/ui docs**: https://ui.shadcn.com
- **Next.js App Router**: https://nextjs.org/docs/app
- **Tailwind CSS v4**: https://tailwindcss.com/docs
- **pdf-lib**: https://pdf-lib.js.org/
- **@dnd-kit**: https://dndkit.com/

---

> **Última actualización**: Enero 2026  
> **Mantenido por**: Equipo de desarrollo PDF SaaS
