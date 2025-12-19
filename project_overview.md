# Documentación del Proyecto PDF SaaS

Este documento proporciona una visión completa y detallada de la arquitectura, componentes y flujo de datos del proyecto PDF SaaS. Está diseñado para que cualquier desarrollador pueda entender rápidamente cómo funciona el sistema.

## 1. Descripción General
Es una aplicación web SaaS moderna para la manipulación y procesamiento de archivos PDF. Permite realizar operaciones complejas de manera sencilla en el navegador, delegando el procesamiento pesado al servidor mediante una arquitectura sin estado (stateless).

**Capacidades principales:**
*   **Unir PDF:** Combinar múltiples documentos en uno solo.
*   **Rotar PDF:** Girar páginas individuales o documentos completos.
*   **Eliminar Páginas:** Remover páginas específicas de un documento de forma visual.
*   **Dividir PDF:** Separar un PDF en múltiples archivos por rangos o páginas fijas.
*   **Extraer Páginas:** Seleccionar páginas específicas para crear un nuevo documento.
*   **Organizar PDF:** La herramienta más potente. Permite reordenar páginas (D&D), rotar, duplicar, insertar hojas en blanco y gestionar la estructura de uno o varios documentos simultáneamente.

## 2. Tecnologías Clave

### Frontend
*   **Framework:** [Next.js 15+](https://nextjs.org/) (App Router).
*   **Estilos:** [Tailwind CSS 4](https://tailwindcss.com/) (Modern CSS engines).
*   **UI Components:** [Shadcn UI](https://ui.shadcn.com/) (basado en Radix UI).
*   **Iconos:** `lucide-react` y `Bootstrap Icons`.
*   **Drag & Drop:** `@dnd-kit` (Sortable) para la gestión de tarjetas.
*   **Visualización PDF:** `react-pdf` (`pdfjs-dist`) para la generación de miniaturas.
*   **Animaciones:** `tw-animate-css` y transiciones nativas de Tailwind.

### Backend (Server-Side)
*   **Procesamiento PDF:** `pdf-lib`. Se utiliza en API Routes para la manipulación de archivos (unir, rotar, eliminar, extraer).
*   **Archivado:** `jszip` para devolver múltiples archivos en un solo paquete ZIP.

## 3. Arquitectura de Carpetas

```
src/
├── app/                        # Next.js App Router (Rutas y API)
│   ├── api/                    # Backend Logic (PDF processing)
│   ├── organizar-pdf/          # Herramienta de organización
│   ├── unir-pdf/               # Herramienta de unión
│   └── ...                     # Otras herramientas
│
├── components/                 # Componentes de React
│   ├── pdf-system/             # SISTEMA NÚCLEO DE UI PDF
│   │   ├── pdf-card.tsx        # Tarjeta polimórfica (Presets)
│   │   └── pdf-grid.tsx        # Grid reordenable con DnD Kit
│   ├── ui/                     # Componentes Shadcn (botón, diálogo, etc.)
│   ├── globalToolbar.tsx       # Barra de comandos inteligente (Mobile Ready)
│   ├── pdf-toolbar.tsx         # Controles secundarios (Añadir/Reset)
│   ├── save-dialog.tsx         # Interfaz para nombrar archivos
│   ├── success-dialog.tsx      # Flujo post-descarga
│   └── summaryList.tsx         # Resumen visual del proceso
│
├── hooks/                      # Lógica de negocio y estado
│   ├── usePdfFiles.ts          # Gestión de archivos completos (Lista)
│   ├── usePdfPages.ts          # Gestión de páginas individuales
│   ├── usePageSelection.ts     # Lógica de selección masiva
│   ├── usePdfProcessing.ts     # Orquestador de API y Descargas
│   ├── usePdfMultiLoader.ts    # Cargador de páginas desde múltiples archivos
│   └── useMobile.ts            # Adaptabilidad de UI (Mobile Detection)
│
└── types.ts                    # Definiciones de tipos globales
```

## 4. Componentes Principales del Sistema PDF

### `PdfGrid` y `PdfCard` (Sistema Core)
El núcleo visual para interactuar con los documentos.
*   **`PdfGrid`**: Encapsula la lógica de `@dnd-kit` para permitir el reordenamiento suave mediante drag & drop.
*   **`PdfCard`**: Altamente configurable mediante **Presets**.
    *   **Presets Disponibles:** `merge`, `delete`, `rotate`, `extract`, `split`, `organize`.
    *   **Capacidades:** Checkboxes de selección, botones de rotación individual, duplicación, inserción de páginas en blanco, eliminación individual y badges de rotación.
    *   **Renderizado:** Usa `PdfThumbnail` (cliente) para mostrar la vista previa real de cada página.

### `GlobalToolbar` (`src/components/globalToolbar.tsx`)
El centro de mandos contextual.
*   **Responsive:** En desktop es una barra de herramientas con tooltips. En mobile, se transforma en un botón de "Opciones de Edición" que abre un **Sheet** (panel inferior) optimizado para controles táctiles.
*   **Feature-Based:** Habilita/deshabilita grupos de acciones (Selección, Orden, Rotación, Acciones Masivas) mediante props.

### `SaveDialog` y `SuccessDialog`
*   **`SaveDialog`**: Permite al usuario personalizar el nombre del archivo de salida antes de procesar.
*   **`SuccessDialog`**: Evita la pérdida de contexto. Tras la descarga, ofrece opciones de "Seguir editando" (mantiene el estado actual) o "Nueva operación" (reset completo).

## 5. Hooks: El Cerebro de la Aplicación

### `usePdfProcessing`
Abstracción unificada para:
1.  Enviar datos al endpoint correspondiente.
2.  Gestionar el estado de carga (`isProcessing`).
3.  Manejar la respuesta (Blob/ZIP).
4.  Disparar la descarga automática en el navegador.

### `usePageSelection`
Simplifica la gestión de selección de páginas:
*   Seleccionar todo, deseleccionar, invertir.
*   Selección por rangos (ej: "1-5, 8, 10-12").

### `usePdfMultiLoader`
Carga asíncrona de páginas desde múltiples archivos PDF, extrayendo metadatos como el número de páginas y generando IDs únicos para la manipulación en el cliente.

## 6. Flujo de Datos (Workflow)

1.  **Carga:** El usuario usa `Dropzone` o `PdfToolbar` (Añadir) para cargar archivos.
2.  **Estado:** La página orquesta el estado usando los hooks (`usePdfPages`, `usePdfFiles`).
3.  **Configuración:** `PdfCard` se configura con el preset adecuado para la herramienta actual.
4.  **Interacción:** El usuario reordena, rota, selecciona o elimina elementos visualmente.
5.  **Procesamiento:**
    *   El usuario hace clic en "Procesar/Guardar".
    *   Se abre `SaveDialog` para confirmar el nombre.
    *   Se envía un `FormData` con los archivos y las "Instrucciones de Procesamiento" (JSON) al servidor.
6.  **Entrega:** El servidor procesa vía `pdf-lib`, devuelve el archivo y el cliente lo descarga.
7.  **Ciclo:** `SuccessDialog` guía al usuario hacia su siguiente acción.

## 7. Notas Técnicas y UX
*   **Performance:** Uso de `dynamic` imports para bibliotecas pesadas como `pdfjs-dist` para mantener el bundle inicial ligero.
*   **Dark Mode:** Soporte nativo y persistente mediante `next-themes`.
*   **Feedback:** Notificaciones enriquecidas con `sonner` para confirmar cada acción.
*   **Accesibilidad:** Cumplimiento de estándares ARIA mediante el uso de Radix UI.

---
*Documentación actualizada para reflejar las últimas integraciones de componentes PDF y flujos de usuario optimizados.*
