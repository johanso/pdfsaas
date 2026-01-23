# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PDFConver is a Next.js 16 web application providing comprehensive PDF manipulation tools. The app is built with a "Documentalist Modern" design aesthetic, featuring client-side PDF processing and external worker API integration for Office conversions.

**Architecture**: Next.js App Router with client-side PDF processing using pdf-lib and pdfjs-dist, external worker API for Office/compression operations.

## Key Commands

### Development
```bash
# Start dev server (uses webpack with --webpack flag)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Analyze bundle size (opens interactive visualizer)
npm run analyze
# or
cross-env ANALYZE=true npm run build
```

### Environment Variables
Required in `.env.local`:
```
NEXT_PUBLIC_PDF_WORKER_URL=<worker-api-url>
NEXT_PUBLIC_MAX_FILE_SIZE=157286400       # 150MB
NEXT_PUBLIC_MAX_BATCH_SIZE=524288000      # 500MB
```

## Architecture & Code Organization

### Processing Architecture

**Two-tier processing model**:

1. **Client-side processing** (pdf-lib, pdfjs-dist):
   - Merge, split, rotate, delete/extract pages, organize
   - Flatten, grayscale, sign, image-to-PDF
   - Direct browser-based manipulation

2. **Worker API processing** (external service):
   - Office conversions (Word/Excel/PowerPoint ↔ PDF)
   - PDF compression
   - PDF-to-image conversion (high quality)
   - Password protection/unlocking
   - Accessed via `PdfWorkerClient` singleton

### Directory Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── [tool-name]/             # Each PDF tool (e.g., unir-pdf/, dividir-pdf/)
│   │   ├── page.tsx            # Server component (metadata, layout)
│   │   └── client.tsx          # Client component (interactive UI)
│   ├── api/                     # API routes
│   │   └── unlock-pdf/         # Password verification endpoints
│   ├── layout.tsx              # Root layout (fonts, providers)
│   └── page.tsx                # Homepage
│
├── components/
│   ├── pdf-system/             # Core PDF UI components
│   │   ├── pdf-tool-layout.tsx     # Standard tool page wrapper
│   │   ├── pdf-grid.tsx            # Drag-drop file grid (@dnd-kit)
│   │   ├── pdf-card.tsx            # File card with thumbnail/actions
│   │   ├── add-pdf-card.tsx        # File upload trigger
│   │   ├── pdf-preview-modal.tsx   # Full-page PDF viewer
│   │   ├── pdf-signer-editor.tsx   # Signature drawing/placement
│   │   └── password-protected-state.tsx
│   ├── layout/                 # Navigation, footer
│   ├── ui/                     # shadcn/ui components
│   ├── processing-screen.tsx  # Unified processing UI
│   ├── globalToolbar.tsx      # File manipulation toolbar
│   ├── pdf-toolbar.tsx        # Page-level actions
│   └── ErrorBoundary.tsx      # Multi-level error handling
│
├── hooks/
│   ├── core/                   # Fundamental hooks
│   │   ├── usePdfjs.ts            # pdfjs-dist loader
│   │   ├── usePdfFiles.ts         # Generic file state management
│   │   └── useProcessingState.ts  # Processing flow state
│   ├── factories/              # Hook generators
│   ├── use[Tool]Pdf.ts        # Tool-specific processing hooks
│   └── useErrorHandler.ts     # Error handling & notifications
│
├── context/
│   └── FileContext.tsx        # Global file state (split state/actions)
│
└── lib/
    ├── pdf-worker-client.ts   # Worker API singleton client
    ├── tools-data.ts          # Tool registry & metadata
    ├── tools-categories.ts    # Tool categorization
    ├── pdfjs-config.ts        # pdfjs-dist configuration
    ├── config.ts              # App constants, file size limits
    ├── errors/                # Error types & notifications
    └── [feature]-utils.ts     # Feature-specific utilities
```

### State Management Pattern

**FileContext** (split context for performance):
- `FileStateContext`: File list, loading state, errors (triggers re-renders)
- `FileActionsContext`: Stable action functions (no re-renders)
- Use `useFileState()` for components needing file data
- Use `useFileActions()` for components only performing actions

**Tool-specific hooks** (e.g., `useMergePdf`, `useSplitPdf`):
- Handle processing flow: upload → process → download
- Return `{ isProcessing, progress, phase, result, merge/split/etc, handleDownloadAgain, handleStartNew }`

**Standard component pattern**:
```tsx
// client.tsx
"use client";
import { usePdfFiles } from "@/hooks/usePdfFiles";
import { useMergePdf } from "@/hooks/useMergePdf";

export default function ToolClient() {
  const { files, addFiles, removeFile, reorderFiles } = usePdfFiles();
  const { isProcessing, progress, merge, result } = useMergePdf();

  // Render PdfToolLayout → PdfGrid → ProcessingScreen
}
```

### Next.js Configuration

**Webpack customizations** (`next.config.ts`):
- **Code splitting**: Vendor chunks for react, radix-ui, pdf-lib, dnd-kit, lucide-react
- **Server externals**: `canvas`, `pdfjs-dist` (prevents client bundling)
- **Aliases**: `pdfjs-dist` → `.js` build (avoids `.mjs` issues)
- **Body size limit**: 100MB for server actions
- **Rewrites**: `/api/worker/*` → external worker URL

**Bundle analysis**:
```bash
npm run analyze  # Opens interactive bundle visualizer
```

### Design System

**"Documentalist Modern" aesthetic** - Editorial sophistication + technical precision

**Typography**:
- Display (headings): **Fraunces** (serif, editorial)
- Body: **Bricolage Grotesque** (modern grotesque)
- Mono: **JetBrains Mono** (technical data)

**Color palette** (OKLCH):
- Primary: Coral vibrant `oklch(0.70 0.19 25)`
- Secondary: Editorial ink `oklch(0.30 0.08 260)`
- Accent: Bright amber `oklch(0.80 0.15 75)`

**Animation principles**:
- CSS-only when possible
- Staggered reveals (`animationDelay: ${index * 0.05}s`)
- Subtle, purposeful motion

See `docs/DESIGN-SYSTEM.md` for complete guidelines.

## Common Development Patterns

### Adding a New PDF Tool

1. **Create tool route**: `src/app/[tool-slug]/`
   - `page.tsx`: Server component with metadata
   - `client.tsx`: Client component with UI

2. **Register tool**: Add to `src/lib/tools-data.ts`
   ```ts
   'tool-id': {
     id: 'tool-id',
     name: 'Tool Name',
     description: '...',
     path: '/tool-slug',
     icon: 'LucideIconName',
     category: 'organize|convert-to-pdf|convert-from-pdf|edit|security|optimize',
     isAvailable: true,
   }
   ```

3. **Create processing hook**: `src/hooks/use[Tool]Pdf.ts`
   - Import `useProcessingState` for standard flow
   - Implement tool-specific processing logic
   - Return standard interface (isProcessing, progress, action function, result)

4. **Use standard components**:
   ```tsx
   <PdfToolLayout
     files={files}
     onFilesAdded={addFiles}
     globalToolbar={<GlobalToolbar />}
     onAction={processTool}
   >
     <PdfGrid files={files} onRemove={removeFile} />
   </PdfToolLayout>

   {isProcessing && <ProcessingScreen progress={progress} phase={phase} />}
   ```

### PDF Processing Flow

**Client-side (pdf-lib)**:
```ts
// Example: Merge PDFs
import { PDFDocument } from 'pdf-lib';

const mergedPdf = await PDFDocument.create();
for (const file of files) {
  const pdfBytes = await file.file.arrayBuffer();
  const pdf = await PDFDocument.load(pdfBytes);
  const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
  copiedPages.forEach(page => mergedPdf.addPage(page));
}
const bytes = await mergedPdf.save();
```

**Worker API (Office conversions, compression)**:
```ts
import { pdfWorkerClient } from '@/lib/pdf-worker-client';

// Word to PDF
const pdfBlob = await pdfWorkerClient.wordToPdf(file);

// Compress PDF
const compressed = await pdfWorkerClient.compressPdf(file, 'medium');
```

### Error Handling

**Use `notify()` from `@/lib/errors/notifications`**:
```ts
import { notify } from '@/lib/errors/notifications';

try {
  // ...
} catch (error) {
  notify({
    type: 'error',
    title: 'Error al procesar PDF',
    message: error instanceof Error ? error.message : 'Error desconocido'
  });
}
```

**ErrorBoundary levels**: `"app"` (root), `"page"` (route), `"component"` (feature)

### Performance Considerations

**Optimizations already implemented** (see `docs/optimizations/README.md`):
- ✅ Webpack SplitChunks (vendor separation)
- ✅ Split FileContext (state/actions)
- ✅ React.memo on expensive components
- ✅ Dynamic imports for heavy libraries
- ✅ Lazy-load pdfjs-dist worker
- ✅ Canvas moved to devDependencies

**When adding features**:
- Use `React.memo` for components receiving large file arrays
- Lazy-load heavy dependencies: `const lib = await import('heavy-lib')`
- Monitor bundle size with `npm run analyze`
- Check `usePdfFiles` manages file state efficiently (avoids unnecessary re-renders)

## Testing & Quality

**No formal test suite** - manual testing workflow.

**Linting**:
```bash
npm run lint
```

## Skills & References

**Custom skills** (for Claude Code):
- `/frontend-design` - `SKILL-design.md`: Create distinctive, production-grade UI
- `/senior-frontend` - `SKILL-frontend.md`: Frontend development toolkit with scripts

**Reference docs**:
- `docs/DESIGN-SYSTEM.md`: Complete design system
- `docs/optimizations/`: Performance optimization guides
- `references/`: React patterns, Next.js optimization, frontend best practices

## Worker API Integration

**External service** handles resource-intensive operations.

**Endpoints** (via `pdfWorkerClient`):
- `/api/word-to-pdf`, `/api/excel-to-pdf`, `/api/ppt-to-pdf`
- `/api/pdf-to-word`, `/api/pdf-to-excel`, `/api/pdf-to-ppt`
- `/api/compress-pdf` (quality: low/medium/high)
- `/api/pdf-to-image` (format, quality, dpi)
- `/api/protect-pdf`, `/api/unlock-pdf`

**Middleware**: `middleware.ts` passes through `/api/worker/*` requests to external URL.

## Important Notes

- **Always use `--webpack` flag**: Dev/build commands require explicit webpack mode
- **File size limits**: Check `FILE_SIZE_LIMITS` in `src/lib/config.ts`
- **Server vs Client**: pdfjs-dist loads differently on server/client (see `usePdfjs` hook)
- **Tool structure**: Each tool follows page.tsx (server) + client.tsx (client) pattern
- **Design consistency**: Follow DESIGN-SYSTEM.md for new components (avoid generic fonts/colors)
