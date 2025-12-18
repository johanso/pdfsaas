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
*   **Framework:** [Next.js 14+](https://nextjs.org/) (App Router).
*   **UI Library:** [Shadcn UI](https://ui.shadcn.com/) + Tailwind CSS.
*   **Iconos:** `lucide-react`.
*   **Drag & Drop:** `@dnd-kit` para la interfaz de arrastrar y soltar tarjetas.
*   **Visualización PDF:** `react-pdf` (`pdfjs-dist`) para miniaturas.

### Backend (Server-Side)
*   **Procesamiento PDF:** `pdf-lib`. Se utiliza en las API Routes de Next.js para realizar las modificaciones reales a los archivos.
*   **Runtime:** Node.js.

## 3. Arquitectura de Carpetas

```
src/
├── app/                        # Next.js App Router
│   ├── api/                    # API Routes (Backend logic)
│   ├── unir-pdf/               # Página frontend "Unir PDF"
│   ├── rotar-pdf/              # Página frontend "Rotar PDF"
│   └── ...
│
├── components/                 # Componentes de React
│   ├── pdf-system/             # SISTEMA NÚCLEO DE UI PDF
│   │   ├── pdf-card.tsx        # Tarjeta individual
│   │   └── pdf-grid.tsx        # Grid reordenable
│   ├── ui/                     # Componentes base (shadcn)
│   ├── globalToolbar.tsx       # Barra de comandos contextual
│   └── success-dialog.tsx      # Flujo post-descarga
│
├── hooks/                      # Lógica de negocio
│   ├── usePdfFiles.ts          # Gestión de ARCHIVOS
│   ├── usePdfPages.ts          # Gestión de PÁGINAS
│   └── usePdfProcessing.ts     # Comunicación con API
```

## 4. Componentes Principales del Sistema PDF

### `PdfGrid` y `PdfCard`
El núcleo visual para mostrar PDFs.
*   **`PdfGrid`**: Maneja el layout y la lógica de reordenamiento (Drag & Drop).
*   **`PdfCard`**: Representa un archivo o página. Se configura mediante **Presets** (`merge`, `rotate`, `delete`, etc.) para adaptar su interfaz a cada herramienta.

### `GlobalToolbar` (`src/components/globalToolbar.tsx`)
El centro de mandos de la aplicación. Es un componente **stateless** y **context-aware**.
*   **Configuración por Props:** Recibe un objeto `features` para habilitar/deshabilitar grupos de botones (Selección, Ordenamiento, Rotación, Acciones Masivas) según la herramienta actual.
*   **Eventos:** Emite acciones que la página principal captura para actualizar el estado del hook correspondiente.

### `SuccessDialog` (`src/components/success-dialog.tsx`)
Gestiona el flujo post-procesamiento para mejorar la retención y la experiencia.
*   **Barra de Progreso:** Simula el procesamiento/descarga para dar feedback visual.
*   **Opciones Finales:** Permite al usuario "Seguir editando" (mantener estado) o iniciar una "Nueva operación" (reset).

## 5. Hooks: El Cerebro de la Aplicación

### `usePdfFiles`
Gestiona listas de archivos completos (ej: Unir PDF).
*   **Funciones:** `addFiles`, `removeFile`, `reorderFiles`, `sortAZ`, `sortZA`, `reset`.
*   Incluye notificaciones (Toasts) para feedback inmediato del usuario.

### `usePdfPages`
Gestiona páginas individuales de un documento (ej: Rotar, Eliminar).
*   **Funciones:** Carga de archivo único, `rotatePage`, `rotateAllPages`, `removePage`.

### `usePdfProcessing`
Abstracción para la comunicación con el backend y gestión de descargas (Blob handling).

## 6. Flujo de Datos Típico (Workflow)

1.  **Carga:** El usuario sube archivos vía `Dropzone`.
2.  **Preparación:** La página usa el hook adecuado (`usePdfFiles` o `usePdfPages`) para gestionar el estado.
3.  **Edición:** El usuario interactúa con `PdfGrid` y `GlobalToolbar`. Los cambios son visuales y locales.
4.  **Procesamiento:** Se envía el estado y los archivos al endpoint de la API.
5.  **Descarga:** `usePdfProcessing` gestiona el archivo resultante.
6.  **Confirmación:** `SuccessDialog` aparece para guiar al usuario en su siguiente paso.

## 7. Notas Técnicas
*   **Sin Persistencia:** No hay base de datos. Todo el procesamiento es efímero.
*   **SEO:** Implementación de metadatos dinámicos por página.
*   **Accesibilidad:** Uso de componentes Radix UI para asegurar una experiencia inclusiva.

---
*Documentación generada y actualizada para el proyecto PDF SaaS.*
