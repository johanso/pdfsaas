# Documentación del Proyecto PDF SaaS

Este documento proporciona una visión completa y detallada de la arquitectura, componentes y flujo de datos del proyecto PDF SaaS. Está diseñado para que cualquier desarrollador pueda entender rápidamente cómo funciona el sistema.

## 1. Descripción General
Es una aplicación web SaaS moderna para la manipulación y procesamiento de archivos PDF. Permite realizar operaciones complejas de manera sencilla en el navegador, delegando el procesamiento pesado al servidor.

**Capacidades principales:**
*   **Unir PDF:** Combinar múltiples documentos en uno solo.
*   **Rotar PDF:** Girar páginas individuales o documentos completos.
*   **Eliminar Páginas:** Remover páginas específicas de un documento.
*   **Dividir PDF:** Separar un PDF en múltiples archivos por rangos o páginas fijas.
*   **Extraer Páginas:** Seleccionar páginas específicas para crear un nuevo documento.
*   **Organizar PDF:** Reordenar páginas, rotar y gestionar la estructura del documento.

## 2. Tecnologías Clave

### Frontend
*   **Framework:** [Next.js 14+](https://nextjs.org/) (App Router) para la estructura de la aplicación y renderizado.
*   **UI Library:** [Shadcn UI](https://ui.shadcn.com/) (basado en Radix UI) + Tailwind CSS para estilos.
*   **Iconos:** `lucide-react`.
*   **Drag & Drop:** `@dnd-kit` (core y sortable) para la interfaz de arrastrar y soltar tarjetas.
*   **Visualización PDF:** `react-pdf` (usa `pdfjs-dist` bajo el capó) para renderizar miniaturas de las páginas en el navegador.

### Backend (Server-Side)
*   **Procesamiento PDF:** `pdf-lib`. Se utiliza en las API Routes de Next.js para realizar las modificaciones reales a los archivos (merge, rotate, save). Es rápido y no requiere binarios externos.
*   **Runtime:** Node.js (entorno estándar de Next.js).

## 3. Arquitectura de Carpetas

```
src/
├── app/                        # Next.js App Router
│   ├── api/                    # API Routes (Backend logic)
│   │   ├── merge-pdf/          # Endpoint para unir
│   │   ├── rotate-pdf/         # Endpoint para rotar
│   │   └── ...                 # Otros endpoints por herramienta
│   ├── unir-pdf/               # Página frontend "Unir PDF"
│   ├── rotar-pdf/              # Página frontend "Rotar PDF"
│   ├── ...                     # Otras páginas de herramientas
│   └── globals.css             # Estilos globales y variables CSS
│
├── components/                 # Componentes de React
│   ├── layout/                 # Componentes estructurales (Navbar, Footer)
│   ├── pdf-system/             # SISTEMA NÚCLEO DE UI PDF
│   │   ├── pdf-card.tsx        # Tarjeta individual (archivo o página)
│   │   └── pdf-grid.tsx        # Grid reordenable (DndContext)
│   ├── ui/                     # Componentes base (Buttons, Cards, Dialogs...)
│   ├── pdf-toolbar.tsx         # Barra de acciones (Zoom, Reset)
│   └── save-dialog.tsx         # Modal para guardar/nombrar archivo
│
├── hooks/                      # Lógica de negocio y Estado (Custom Hooks)
│   ├── usePdfFiles.ts          # Gestión de lista de ARCHIVOS (Unir, Organizar)
│   ├── usePdfPages.ts          # Gestión de lista de PÁGINAS (Rotar, Eliminar)
│   ├── usePdfProcessing.ts     # Comunicación con API y descargas
│   └── ...
│
└── lib/                        # Utilidades (cn class merger, etc.)
```

## 4. Componentes Principales del Sistema PDF

El proyecto utiliza un sistema unificado para mostrar PDFs, ya sea como lista de archivos o como grilla de páginas.

### `PdfGrid` (`src/components/pdf-system/pdf-grid.tsx`)
Es el contenedor inteligente. Recibe una lista de items (`files` o `pages`) y maneja la lógica de **Drag and Drop**.
*   Utiliza `SortableContext` de dnd-kit.
*   Se adapta responsive (columnas variables).
*   Expone eventos: `onReorder`, `onRemove`, `onRotate`, etc.

### `PdfCard` (`src/components/pdf-system/pdf-card.tsx`)
Es la unidad visual. Representa un PDF o una Página. Es altamente configurable a través de **PRESETS**.
*   **Visualización:** Usa `PdfThumbnail` (wrapper de react-pdf) para mostrar la previsualización real del contenido.
*   **Interactividad:** Puede tener checkbox de selección, botones de rotación, botón de eliminar, badge de número de página, etc.
*   **Presets (`PDF_CARD_PRESETS`):** Define configuraciones pre-fabricadas para no repetir props:
    *   `merge`: Muestra nombre de archivo, tamaño, sin selección.
    *   `rotate`: Muestra botones de giro a la derecha/izquierda.
    *   `delete`: Muestra checkbox de selección grande y estilo de "borrado" al seleccionar.

## 5. Hooks: El Cerebro de la Aplicación

La lógica no reside en los componentes visuales, sino en estos hooks personalizados:

### `usePdfFiles`
**Uso:** Herramientas que manipulan archivos enteros (Unir PDF).
**Estado:** `files: PdfFile[]`
**Funciones clave:**
*   `addFiles(File[])`: Valida PDFs y extrae el conteo de páginas usando `pdfjs`.
*   `reorderFiles`: Actualiza el orden del array tras un drag & drop.
*   `reset`: Limpia todo.

### `usePdfPages`
**Uso:** Herramientas que manipulan páginas de un solo archivo (Rotar, Eliminar, Extraer).
**Estado:** `pages: PageData[]`
**Funciones clave:**
*   Carga inicial: Desglosa un `File` en N objetos `PageData` (uno por página).
*   `rotatePage(id, degrees)`: Actualiza el estado de rotación local (visual).
*   `rotateAllPages(degrees)`: Rotación masiva.
*   `removePage(id)`: Quita una página de la lista (para herramientas de eliminación o extracción).

### `usePdfProcessing`
**Uso:** Abstracción para llamar al backend.
**Responsabilidad:**
1.  Maneja el estado `isProcessing` (para deshabilitar botones y mostrar loaders).
2.  `processAndDownload(fileName, formData, options)`:
    *   Envía el `FormData` al endpoint configurado.
    *   Maneja errores (Toast notifications).
    *   Recibe el Blob de respuesta y fuerza la descarga automática en el navegador.

## 6. Flujo de Datos: Ejemplo "Rotar PDF"

1.  **Input:** El usuario selecciona un archivo en `Dropzone`.
2.  **Carga:** `RotatePdfPage` (frontend) instancia `usePdfPages(file)`.
    *   El hook lee el PDF y genera un array de objetos `{ originalIndex: 1, rotation: 0, ... }`.
    *   `PdfGrid` renderiza una tarjeta por cada página.
3.  **Interacción:**
    *   El usuario hace clic en "Rotar Derecha" en la página 3.
    *   `usePdfPages` actualiza el estado local: la página 3 ahora tiene `rotation: 90`.
    *   Visualmente la tarjeta gira (CSS transform), pero el archivo original sigue intacto.
4.  **Guardado:**
    *   El usuario clic en "Guardar". Se abre `SaveDialog` para poner nombre.
    *   Al confirmar, se crea un `FormData` con:
        *   El archivo original (`file`).
        *   Un JSON `pageInstructions`: `[{ originalIndex: 2, rotation: 90 }]` (indices corchados para backend 0-based).
5.  **Procesamiento (API):**
    *   `usePdfProcessing` envía todo a `/api/rotate-pdf`.
    *   El servidor recibe el archivo y las instrucciones.
    *   **pdf-lib** carga el PDF, itera sobre las páginas y aplica `page.setRotation()`.
    *   Devuelve el PDF modificado como stream.
6.  **Descarga:** El navegador descarga el archivo final.

## 7. Notas Adicionales
*   **Persistencia:** No hay base de datos. Todo el procesamiento es efímero y en memoria durante la petición.
*   **Límites:** Depende de la memoria del servidor (Vercel/Node) y del cliente (para previsualización).

---
*Documentación generada automáticamente para el proyecto PDF SaaS.*
