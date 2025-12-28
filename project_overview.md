# 📄 Documentación Integral del Proyecto PDF SaaS

Este documento es la referencia técnica definitiva para entender la arquitectura, el sistema de componentes, la lógica de estado y los flujos de procesamiento de la plataforma PDF SaaS.

---

## 🏗️ 1. Arquitectura de Procesamiento (Híbrida)

El proyecto utiliza un modelo de procesamiento híbrido distribuido en tres capas para optimizar el rendimiento, la privacidad y la fiabilidad.

### A. Procesamiento en el Cliente (Navegador) - *UI & Metadata*
*   **Tecnología:** `pdfjs-dist` ejecutándose en Web Workers.
*   **Responsabilidades:**
    *   Generación de miniaturas de alta fidelidad (`PdfThumbnail`).
    *   Extracción de metadatos y conteo de páginas.
    *   Carga asíncrona de páginas desde múltiples archivos (`usePdfMultiLoader`).
    *   Gestión de estados visuales (selección, orden, rotación visual).
    *   Estimación de páginas para archivos Office (`office-utils.ts`).

### B. Procesamiento en el Servidor Local (Next.js API) - *Estructura PDF*
*   **Tecnología:** `pdf-lib`.
*   **Rutas:** `src/app/api/[tool]/route.ts`.
*   **Responsabilidades:**
    *   Operaciones estructurales: Unir, dividir, eliminar y rotar páginas.
    *   Generación de archivos ZIP (`jszip`) cuando la salida es múltiple.
    *   Estas tareas son rápidas y mantienen los datos cerca del usuario.

### C. Procesamiento en Servidor Externo (VPS/Worker) - *Conversiones Pesadas*
*   **Tecnología:** ImageMagick, LibreOffice, y utilidades de bajo nivel.
*   **Cliente:** `pdf-worker-client.ts`.
*   **Responsabilidades:**
    *   Conversiones de Office a PDF (Word, Excel, PPT).
    *   Conversiones de PDF a formatos editables.
    *   Compresión avanzada de PDF.
    *   Conversión de PDF a imagen con formatos avanzados (TIFF, BMP) o alta densidad (DPI > 300).
    *   Conversión masiva de PDF a imagen con alta densidad (DPI).

---

## 🧱 2. Registro de Componentes Principales

### 📦 Sistema Núcleo PDF (`src/components/pdf-system/`)
*   **`PdfToolLayout`**: El esqueleto de todas las herramientas. Gestiona la zona de carga (Dropzone), la barra lateral de resumen, los controles de descarga y la adaptación automática para móviles.
*   **`PdfGrid`**: Grid interactivo que implementa `@dnd-kit`. Soporta reordenamiento por arrastre y soltado con animaciones fluidas.
*   **`PdfCard`**: Componente polimórfico que cambia su comportamiento mediante **Presets** (`merge`, `delete`, `rotate`, etc.). Renderiza miniaturas o iconos de Office.

### 🛠️ Herramientas y Barras (`src/components/`)
*   **`GlobalToolbar`**: Centro de comandos inteligente. En mobile se transforma automáticamente en un menú táctil optimizado.
*   **`PdfToolbar`**: Controles rápidos para añadir archivos o reiniciar el proceso.
*   **`SaveDialog`**: Modal interactivo para que el usuario nombre su archivo procesado.
*   **`ProcessingScreen`**: Pantalla de bloqueo global que usa progreso real por XHR. Incluye un sistema de `tips` y `funFacts` para mejorar la percepción del tiempo de espera.

### 🖼️ Visualización y UI
*   **`PdfThumbnail`**: Renderizador optimizado que usa canvas para mostrar páginas de PDF sin procesar todo el archivo.
*   **`OfficeThumbnail`**: Iconografía SVG temática para archivos DOCX, XLSX y PPTX.
*   **`BootstrapIcon`**: Wrapper con soporte para animaciones (spin, pulse) y personalización de colores.
*   **`SummaryList`**: Lista detallada de los archivos y cambios, optimizada con diseño responsivo (Grid adaptatible).
*   **`ButtonGroup`**: Componente de selección mutualmente excluyente (usado en selector de DPI).

### 📱 Adaptabilidad Móvil (Responsive)
*   **`GlobalToolbar`**: Ajuste automático de espaciado y separadores en vistas móviles.
*   **`PdfToolLayout`**: Cards con padding condicional para maximizar el espacio en pantallas pequeñas.


---

## 🧠 3. Guía de Hooks Personalizados

### 📁 Gestión de Archivos y Carga
*   **`usePdfFiles`**: Gestiona la lista de archivos subidos. Incluye flags como `skipPdfValidation` para permitir archivos Office.
*   **`usePdfMultiLoader`**: El "caballo de batalla" de la visualización. Convierte archivos subidos en una lista plana de páginas con IDs únicos.
*   **`usePdfLoader`**: Maneja la carga individual de un PDF y su metadata básica.

### ⚡ Procesamiento y Estado
*   **`usePdfProcessing`**: Punto de entrada para todas las APIs. Implementa tracking de progreso real:
    *   **0-50%**: Progreso de subida (Upload).
    *   **50-100%**: Progreso de descarga (Download).
    *   Gestiona el flujo post-descarga (re-descarga, editar otra vez, nuevo).
*   **`usePdfPages`**: Mantiene el estado de las páginas manipuladas (rotación, orden, visibilidad).
*   **`usepdftoimage`**: Lógica compleja para la exportación de páginas individuales como imágenes configurables.

### 🖱️ Interacción Avanzada
*   **`usePageSelection`**: Lógica de selección individual y por rango.
*   **`useMultiSelect`**: Soporte para interacciones tipo "escritorio" (Shift+Click para rangos, Ctrl+Click para selección múltiple).

---

## 📁 4. Estructura de Proyecto Detallada

```
src/
├── app/
│   ├── api/                    # APIs locales (pdf-lib) y proxys al Worker
│   ├── word-a-pdf/             # Rutas de herramientas individuales
│   └── ...
├── components/
│   ├── pdf-system/             # Componentes base del entorno PDF
│   ├── layout/                 # Navbar, Footer, Hero, CTA
│   ├── ui/                     # Componentes atómicos (Radix/Shadcn)
│   └── ...                     # Componentes de funcionalidad específica
├── hooks/                      # Lógica de negocio (Cerebro)
├── lib/                        # Utilidades y configuración central
│   ├── pdf-worker-client.ts    # Cliente para el VPS externo
│   ├── office-utils.ts         # Parsers y estimadores de Office
│   ├── tools-data.ts           # Configuración única de herramientas
│   └── tools-categories.ts     # Estructura del menú y categorías
```

---

## 🔄 5. Flujo de Trabajo Técnico (Pipeline)

1.  **Ingesta:** Los archivos pasan por `usePdfFiles`.
2.  **Preparación:** Si es PDF, `usePdfMultiLoader` genera miniaturas. Si es Office, `OfficeThumbnail` muestra el icono.
3.  **Manipulación:** El usuario interactúa con `PdfGrid`. Las transformaciones se registran en el estado local.
4.  **Ejecución:**
    *   `processAndDownload` recopila datos.
    *   Se abre `SaveDialog`.
    *   `ProcessingScreen` se activa con tracking XHR.
    *   La API (Local o Worker) procesa y devuelve el blob.
5.  **Finalización:** Descarga automática y transición a opciones de éxito en el mismo componente de procesamiento.

---
*Última actualización: 26 de diciembre de 2025.*
