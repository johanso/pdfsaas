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
*   **PDF a Imagen:** Convierte páginas de PDF a formatos JPG, PNG o WebP.
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
│   ├── api/                    # Backend Logic (PDF processing/Conversion)
│   ├── organizar-pdf/          # Herramienta de organización
│   ├── unir-pdf/               # Herramienta de unión
│   ├── pdf-a-imagen/           # Herramienta de conversión
│   └── ...                     # Otras herramientas
│
├── components/                 # Componentes de React
│   ├── pdf-system/             # SISTEMA NÚCLEO DE UI PDF
│   │   ├── pdf-tool-layout.tsx # Layout estándar para todas las herramientas
│   │   ├── pdf-card.tsx        # Tarjeta polimórfica (Presets)
│   │   └── pdf-grid.tsx        # Grid reordenable con DnD Kit
│   ├── ui/                     # Componentes Shadcn (botón, diálogo, etc.)
│   ├── globalToolbar.tsx       # Barra de comandos inteligente (Mobile Ready)
│   ├── pdf-toolbar.tsx         # Controles secundarios (Añadir/Reset)
│   ├── save-dialog.tsx         # Interfaz para nombrar archivos
│   ├── success-dialog.tsx      # Flujo post-descarga
│   ├── pdf-thumbnail.tsx       # Renderizador de miniaturas de alta fidelidad
│   └── bootstrapIcon.tsx       # Adaptador para Bootstrap Icons con animaciones
│
├── hooks/                      # Lógica de negocio y estado
│   ├── usePdfFiles.ts          # Gestión de archivos completos (Lista)
│   ├── usePdfPages.ts          # Gestión de páginas individuales
│   ├── usePageSelection.ts     # Lógica de selección masiva
│   ├── useMultiSelect.ts       # Soporte para clics con Shift/Ctrl
│   ├── usePdfProcessing.ts     # Orquestador de API y Descargas
│   ├── usePdfLoader.ts         # Cargador unitario de PDFs
│   ├── usePdfMultiLoader.ts    # Cargador de páginas desde múltiples archivos
│   ├── usepdftoimage.ts        # Hook especializado en conversión de imágenes
│   └── useMobile.ts            # Adaptabilidad de UI (Mobile Detection)
│
└── lib/                        # Configuraciones y datos
    ├── tools-data.ts           # Definición centralizada de herramientas
    └── tools-categories.ts     # Categorización para la UI
```

## 4. Componentes Principales del Sistema PDF

### `PdfToolLayout` (`src/components/pdf-system/pdf-tool-layout.tsx`)
Es la base unificada de todas las páginas de herramientas. Encapsula:
*   Encabezado de página (`HeadingPage`).
*   Zona de carga (`Dropzone`).
*   Barra de herramientas global y secundaria.
*   Barra lateral de resumen y controles personalizados.
*   Gestión de diálogos de guardado y éxito.
*   Adaptación automática para móviles (Menú de opciones flotante).

### `PdfGrid` y `PdfCard` (Sistema Core)
El núcleo visual para interactuar con los documentos.
*   **`PdfGrid`**: Encapsula la lógica de `@dnd-kit` para permitir el reordenamiento suave mediante drag & drop.
*   **`PdfCard`**: Altamente configurable mediante **Presets**.
    *   **Presets Disponibles:** `merge`, `delete`, `rotate`, `extract`, `split`, `organize`.
    *   **Capacidades:** Checkboxes, rotación individual, duplicación, inserción de páginas en blanco, eliminación individual.
    *   **Renderizado:** Usa `PdfThumbnail` (cliente) con trabajadores web para procesar el renderizado sin bloquear el hilo principal.

### `GlobalToolbar` (`src/components/globalToolbar.tsx`)
El centro de mandos contextual.
*   **Responsive:** En desktop es una barra fija o sticky. En mobile, se integra en un **Sheet** u opciones táctiles optimizadas.
*   **Feature-Based:** Habilita dinámicamente secciones como Selección, Orden, Rotación y Acciones Masivas.

## 5. Hooks: El Cerebro de la Aplicación

### `usePdfProcessing`
Abstracción para la comunicación con el servidor. Maneja el envío de `FormData`, el estado de carga y la descarga del resultado final (PDF o ZIP).

### `usePageSelection` y `useMultiSelect`
Trabajan en conjunto para gestionar la selección de páginas. `useMultiSelect` permite interacciones avanzadas como Shift+Click para seleccionar rangos visualmente en el grid.

### `usePdfMultiLoader`
Carga asíncrona de páginas desde múltiples archivos PDF, extrayendo metadatos y generando IDs únicos para mantener la integridad durante el reordenamiento.

## 6. Estado de las Herramientas

### Herramientas Implementadas (Disponibles)
| Herramienta | Ruta | Estado |
| :--- | :--- | :--- |
| Unir PDF | `/unir-pdf` | ✅ Producción |
| Dividir PDF | `/dividir-pdf` | ✅ Producción |
| Eliminar Páginas | `/eliminar-paginas-pdf` | ✅ Producción |
| Extraer Páginas | `/extraer-paginas-pdf` | ✅ Producción |
| Organizar PDF | `/organizar-pdf` | ✅ Producción |
| Rotar PDF | `/rotar-pdf` | ✅ Producción |
| PDF a Imagen | `/pdf-a-imagen` | ✅ Producción |

### Herramientas Pendientes (Coming Soon)
A continuación se detallan las funcionalidades que están configuradas en el sistema pero aún no implementadas:

*   **Conversión desde PDF:** PDF a Word, Excel, PowerPoint, Escala de grises.
*   **Conversión a PDF:** JPG/PNG a PDF, Word a PDF, HTML a PDF.
*   **Edición Avanzada:** Recortar PDF, Marca de agua, Números de página, Editar metadatos, Añadir texto/imágenes.
*   **Seguridad:** Proteger con contraseña, Desbloquear PDF, Firmar PDF, Censurar información.
*   **Optimización:** Comprimir PDF, Reducir tamaño, Quitar duplicados.

## 7. Flujo de Datos (Workflow)

1.  **Carga:** El usuario carga archivos. `usePdfMultiLoader` procesa los archivos y extrae las páginas.
2.  **Visualización:** `PdfGrid` renderiza las `PdfCard` correspondientes según el preset de la herramienta.
3.  **Manipulación:** El usuario interactúa (rota, mueve, borra). El estado se mantiene en `usePdfPages`.
4.  **Procesamiento:**
    *   `usePdfProcessing` recopila las instrucciones de transformación.
    *   Se muestra `SaveDialog` para elegir nombre de archivo.
    *   Se envía petición a `/api/[tool]`.
5.  **Finalización:** Se descarga el archivo y `SuccessDialog` ofrece el siguiente paso.

---
*Documentación actualizada el 23 de diciembre de 2024 para reflejar la migración a `PdfToolLayout` y la expansión del sistema de hooks.*

