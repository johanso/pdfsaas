# 📘 Documentación Maestra del Proyecto PDF SaaS

Este documento sirve como la **fuente de verdad técnica** para todo el proyecto. Detalla cada archivo, componente, hook y decisión arquitectónica de la plataforma.

---

## 🏗️ 1. Arquitectura del Sistema

El proyecto opera bajo un modelo **Híbrido de Tres Capas**, diseñado para equilibrar la privacidad del usuario, la velocidad de respuesta y la capacidad de procesamiento pesado.

### Capa 1: Cliente (Navegador) 🌐
*   **Tecnología:** React 19, Next.js 15 (Client Components), `pdfjs-dist`.
*   **Función:** Interacción inmediata, visualización y tareas ligeras.
*   **Responsabilidades:**
    *   Generación de miniaturas y conteo de páginas.
    *   Conversión de **Imagen a PDF** (si son < 50 imágenes).
    *   Reordenamiento visual y rotación (antes de procesar).
    *   Validación de archivos y UX.
    *   Gestión del estado global de la herramienta en uso.

### Capa 2: Servidor Local (Next.js API Routes) ⚡
*   **Tecnología:** Node.js, `pdf-lib`, `jszip`.
*   **Ubicación:** `/src/app/api/...`
*   **Función:** Manipulación estructural de PDFs sin dependencias externas pesadas.
*   **Responsabilidades:**
    *   **Unir PDF:** Combina documentos.
    *   **Dividir PDF:** Separa rangos o páginas individuales.
    *   **Eliminar Páginas:** Remueve páginas seleccionadas.
    *   **Organizar:** Aplica el nuevo orden definido en el cliente.
    *   **Rotar:** Aplica la rotación física a las páginas.
    *   **Extraer Páginas:** Crea nuevos PDFs a partir de una selección.

### Capa 3: Servidor Externo (VPS/Worker) 🦾
*   **Tecnología:** Python/Node, ImageMagick, LibreOffice, Ghostscript.
*   **Acceso:** Vía `PdfWorkerClient` (`/api/workerProxy`).
*   **Función:** Tareas intensivas en CPU/RAM y conversiones de formatos complejos.
*   **Responsabilidades:**
    *   **Office a PDF:** Word, Excel, PowerPoint.
    *   **PDF a Office:** Conversión inversa (OCR opcional).
    *   **PDF a Imagen:** Renderizado de alta fidelidad (TIFF, BMP, DPI > 300).
    *   **Compresión:** Optimización avanzada con Ghostscript.
    *   **HTML a PDF:** Renderizado fiel de oáginas web.

---

## 📂 2. Mapeo de Herramientas y Páginas (`src/app`)

Cada herramienta tiene su propia ruta y típicamente consta de un `page.tsx` (Server Component para SEO) y un `client.tsx` (Lógica interactiva).

### Herramientas de Organización
| Ruta | Componente Cliente | Backend | Descripción |
| :--- | :--- | :--- | :--- |
| `/unir-pdf` | `MergePdfClient` | Local API | Combina múltiples PDFs en uno solo ordenado. |
| `/dividir-pdf` | `SplitPdfClient` | Local API | Divide por rangos o extrae todas las páginas. |
| `/eliminar-paginas-pdf`| `DeletePagesClient`| Local API | Elimina páginas visualmente seleccionadas. |
| `/extraer-paginas-pdf` | `ExtractPagesClient`| Local API | Descarga solo las páginas seleccionadas. |
| `/organizar-pdf` | `OrganizePdfClient` | Local API | Reordena páginas arrastrando y soltando. |
| `/rotar-pdf` | `RotatePdfClient` | Local API | Rota páginas individuales o todo el documento. |

### Convertir DESDE PDF
| Ruta | Cliente | Backend | Descripción |
| :--- | :--- | :--- | :--- |
| `/pdf-a-imagen` | `PdfToImageClient` | **Híbrido** | Usa Cliente para JPG/PNG baja res. Usa VPS para TIFF/BMP/DPI alto. |
| `/pdf-a-word` | `PdfToWordClient` | **VPS** | Conversión compleja de layout y texto. |
| `/pdf-a-excel` | `PdfToExcelClient` | **VPS** | Extracción de tablas. |
| `/pdf-a-powerpoint`| `PdfToPptClient` | **VPS** | Reconstrucción de diapositivas. |
| `/pdf-a-pdf-a` | *Pendiente* | **VPS** | Conversión a formato de archivo (PDF/A). |

### Convertir HACIA PDF
| Ruta | Cliente | Backend | Descripción |
| :--- | :--- | :--- | :--- |
| `/imagen-a-pdf` | `ImageToPdfClient` | **Híbrido** | Cliente (`pdf-lib`) para tareas rápidas. Servidor si hay >50 imágenes. |
| `/word-a-pdf` | `WordToPdfClient` | **VPS** | Renderizado fiel de .docx. |
| `/excel-a-pdf` | `ExcelToPdfClient` | **VPS** | Conversión de hojas de cálculo. |
| `/powerpoint-a-pdf`| `PptToPdfClient` | **VPS** | Conversión de diapositivas. |
| `/html-a-pdf` | `HtmlToPdfClient` | **VPS** | Captura de webs o HTML raw. |

---

## 🎣 3. Hooks Personalizados (`src/hooks`) - El "Cerebro"

La arquitectura ha sido refactorizada para usar un patrón de **Pipeline Modular**.

### Core Hooks (`src/hooks/core/`) - Bloques de Construcción
*   **`useXhrUpload`**: Maneja la subida de archivos vía `XMLHttpRequest` con reportes de progreso, velocidad y tiempo restante reales.
*   **`useProcessingTimer`**: Simula el progreso para fases de espera (como procesamiento en servidor) para mejorar la UX.
*   **`useDownload`**: Gestiona la descarga de Blobs o URLs de forma unificada.

### Orquestador
*   **`useProcessingPipeline`**: 
    *   *Qué hace:* Combina los Core Hooks en un flujo estándar: Preparar -> Subir -> Procesar -> Descargar.
    *   *Beneficio:* Elimina código duplicado y asegura que todas las herramientas tengan el mismo manejo de errores y feedback visual.

### Hooks de Herramientas (Consumidores)
*   **`usePdfProcessing`**: (Genérico) Usa el pipeline para herramientas estándar (`unir`, `dividir`).
*   **`useCompressPdf`**: (Especializado) Inyecta lógica de compresión Gzip antes de la subida en el pipeline.
*   **`useOcrPdf`**: (Complejo) Gestiona estados de UI avanzados (tips, rotación de mensajes) y simula tiempos largos de espera mientras orquesta el pipeline.

### Hooks de Utilidad y Híbridos
*   **`usePdfFiles`**: Gestión global de archivos (drag & drop, validaciones).
*   **`usePdfMultiLoader`**: Renderizado virtual de páginas para grids grandes.
*   **`usePdfToImage` / `useImageToPdf`**: Herramientas híbridas que deciden inteligentemente si procesar en cliente o servidor.
*   **`useMobile`**: Responsive design.
*   **`useMultiSelect`**: Selección avanzada.

---

## 🧩 4. Catálogo de Componentes (`src/components`)

### A. Sistema PDF (`src/components/pdf-system/`)
Componentes especializados que forman la interfaz de las herramientas.
1.  **`PdfToolLayout`**: **(Crítico)** El wrapper principal. Contiene:
    *   `Dropzone` (Área de carga).
    *   Sidebar de opciones/resumen.
    *   Lógica adaptativa (Layout cambia si hay archivos cargados).
2.  **`PdfGrid`**: Contenedor de páginas. Implementa `@dnd-kit` para arrastrar y soltar.
3.  **`PdfCard`**: La unidad atómica. Representa una página o archivo.
    *   *Props:* Soporta modo selección, eliminación, rotación y visualización de número de página.

### B. UI Global y Layout (`src/components/layout/`)
1.  **`GlobalToolbar`**: Barra de navegación superior. Adaptable a móvil (Drawer).
2.  **`Footer`**: Enlaces legales y de navegación.
3.  **`Features`**: Grid de características en landing pages.
4.  **`HowItWorks`**: Sección explicativa paso a paso.
5.  **`Hero`**: Cabecera principal de las landing pages.
6.  **`ProcessingScreen`**: Pantalla de carga inmersiva con barra de progreso y "fun facts".

### C. Elementos de Interfaz (`src/components/ui/` & `src/components/`)
*   **`Dropzone`**: Área de arrastrar archivos. Acepta tipos MIME específicos.
*   **`PdfThumbnail`**: Renderizador de canvas para previsualizar PDFs reales.
*   **`OfficeThumbnail`**: Icono SVG dinámico para Word/Excel/PPT.
*   **`BootstrapIcon`**: Utilidad para iconos consistentes.
*   **`SaveDialog`**: Modal final para nombrar el archivo antes de procesar.
*   **`SummaryList`**: Lista lateral que muestra qué archivos se van a procesar.
*   **`SuccessDialog`**: (Obsoleto/Legacy) Reemplazado por el estado de éxito en `ProcessingScreen`.

---

## 🛠️ 5. Librerías y Utilidades (`src/lib`)

1.  **`pdf-worker-client.ts`**:
    *   Clase Singleton.
    *   Abstrae todas las llamadas a la API del VPS.
    *   Maneja `FormData` y errores de red.
2.  **`tools-data.ts`**:
    *   Base de datos estática de todas las herramientas.
    *   Define iconos, rutas, descripciones y estado (`isAvailable`, `comingSoon`).
3.  **`office-utils.ts`**:
    *   Ayudantes para estimar conteo de páginas en archivos Office (ya que no se pueden leer fácil en cliente).

---

*Documentación actualizada automáticamente por Antigravity. Última revisión: 29 de Diciembre de 2025.*
