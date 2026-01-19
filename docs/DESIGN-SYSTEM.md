# 🎨 Sistema de Diseño: DOCUMENTALISTA MODERNO

## Concepto

PDFConver adopta una estética **"Documentalista Moderno"** que combina la sofisticación editorial con la precisión técnica. El diseño evita los estereotipos genéricos de SaaS y crea una experiencia visual distintiva y memorable.

### Filosofía de Diseño

- **Editorial**: Inspirado en revistas modernas y publicaciones de diseño
- **Preciso**: Atención meticulosa a la tipografía y el espaciado
- **Distintivo**: Evita las fuentes y colores genéricos de AI
- **Profesional**: Transmite confianza y competencia técnica

---

## 🎨 Paleta de Colores

### Primario - Coral Vibrante
```css
--primary: oklch(0.70 0.19 25);
--primary-foreground: oklch(1 0 0);
--primary-soft: oklch(0.70 0.19 25 / 0.1);
--primary-muted: oklch(0.70 0.19 25 / 0.2);
```
**Uso**: CTAs principales, acentos, enlaces importantes
**Significado**: Cálido, confiable, energético

### Secundario - Tinta Editorial
```css
--secondary: oklch(0.30 0.08 260);
--secondary-foreground: oklch(0.98 0 0);
--secondary-soft: oklch(0.30 0.08 260 / 0.08);
```
**Uso**: Elementos complementarios, badges, componentes secundarios
**Significado**: Profesional, profundo, editorial

### Acento - Ámbar Brillante
```css
--accent: oklch(0.80 0.15 75);
--accent-foreground: oklch(0.20 0.05 75);
```
**Uso**: Destacados, notificaciones, elementos interactivos
**Significado**: Energía, optimismo, dinamismo

### Neutral - Grafito
```css
--foreground: oklch(0.28 0.02 250);
--background: oklch(0.99 0.002 270);
--muted: oklch(0.96 0.005 260);
--muted-foreground: oklch(0.55 0.01 250);
```
**Uso**: Texto, fondos, bordes
**Significado**: Balance, legibilidad, neutralidad

### Modo Oscuro
El modo oscuro mantiene la misma paleta pero con ajustes de luminosidad:
- Primario más vibrante (oklch 0.75)
- Fondo editorial oscuro (oklch 0.15)
- Bordes y superficies más sutiles

---

## ✍️ Tipografía

### Display - Fraunces
```typescript
font-family: var(--font-display), serif;
```
**Uso**: H1, H2, H3, títulos principales
**Características**:
- Serif variable con personalidad
- Elegante y editorial
- Letter-spacing: -0.02em
- Font-optical-sizing: auto

**Ejemplo**:
```html
<h1 class="text-7xl font-bold">Herramientas PDF</h1>
```

### Body - Bricolage Grotesque
```typescript
font-family: var(--font-body), sans-serif;
```
**Uso**: Texto del cuerpo, párrafos, descripciones
**Características**:
- Grotesca moderna y única
- Legible y profesional
- Letter-spacing: -0.011em
- Peso: 400 (regular)

**Ejemplo**:
```html
<p class="text-lg leading-relaxed">Descripción de la herramienta...</p>
```

### Monospace - JetBrains Mono
```typescript
font-family: var(--font-mono), monospace;
```
**Uso**: Código, datos técnicos, números
**Características**:
- Técnica y precisa
- Excelente legibilidad
- Para elementos técnicos

---

## 📐 Espaciado & Layout

### Principios de Composición

1. **Asimetría Intencional**: Layouts que rompen con la simetría tradicional
2. **Espacio Generoso**: Usar el espacio negativo como elemento de diseño
3. **Grid Editorial**: 12 columnas con breakouts asimétricos
4. **Overlap Estratégico**: Elementos que se superponen para crear profundidad

### Breakpoints
```css
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Espaciado Escala
```css
Base: 0.25rem (4px)
Escala: 1, 2, 3, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64
```

---

## 🎭 Gradientes

### Gradiente Primario
```css
--gradient-primary: linear-gradient(135deg,
  oklch(0.70 0.19 25) 0%,
  oklch(0.80 0.15 75) 100%
);
```
**Uso**: CTAs, elementos destacados

### Gradiente Hero
```css
--gradient-hero:
  radial-gradient(ellipse 80% 50% at 50% -20%, oklch(0.70 0.19 25 / 0.15), transparent),
  linear-gradient(180deg, oklch(0.99 0.002 270) 0%, oklch(0.97 0.005 260) 100%);
```
**Uso**: Fondo del hero, secciones principales

### Gradiente Card
```css
--gradient-card: linear-gradient(145deg,
  oklch(1 0 0) 0%,
  oklch(0.99 0.005 270) 100%
);
```
**Uso**: Tarjetas, componentes elevados

---

## ✨ Animaciones

### Principios
- **Sutileza**: Animaciones suaves y no intrusivas
- **Propósito**: Cada animación tiene una razón
- **Performance**: CSS-only cuando sea posible
- **Staggered**: Delays escalonados para revelar elementos

### Animaciones Definidas

#### Fade In Up
```css
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```
**Uso**: Entrada de elementos, revelación de contenido

#### Float
```css
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}
```
**Uso**: Elementos decorativos, fondos

#### Pulse Soft
```css
@keyframes pulse-soft {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.4; }
}
```
**Uso**: Indicadores sutiles, elementos de fondo

### Delays Staggered
```html
<div style={{ animationDelay: `${index * 0.05}s` }}>
```
Multiplica el índice por 50ms para crear revelación secuencial

---

## 🧩 Componentes Base

### Botones

#### Primario
```html
<Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 rounded-xl shadow-lg shadow-primary/20">
  Acción Principal
</Button>
```

#### Secundario
```html
<Button variant="outline" className="border-2 hover:bg-secondary-soft hover:border-secondary/30 rounded-xl">
  Acción Secundaria
</Button>
```

### Cards
```html
<div className="bg-gradient-card rounded-3xl shadow-2xl border border-border/50 backdrop-blur-sm p-8">
  Contenido
</div>
```

### Badges
```html
<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-soft border border-primary/20 backdrop-blur-sm">
  <Icon />
  <span>Texto</span>
</div>
```

---

## 🎯 Principios de Uso

### DO's ✅

- Usar Fraunces para títulos impactantes
- Aprovechar el espacio negativo
- Aplicar animaciones staggered en listas
- Usar la paleta coral-tinta-ámbar consistentemente
- Crear composiciones asimétricas intencionales
- Aplicar noise texture para textura editorial

### DON'Ts ❌

- No usar Inter, Roboto o Arial
- No usar gradientes púrpura genéricos
- No centrar todo simétricamente
- No abusar de las animaciones
- No mezclar paletas de colores externas
- No ignorar el modo oscuro

---

## 📱 Responsive

### Mobile First
Diseñar primero para móvil, luego expandir:
```html
<h1 className="text-5xl md:text-7xl lg:text-8xl">
```

### Breakpoints Críticos
- **Mobile** (< 640px): Layout de 1 columna, tipografía reducida
- **Tablet** (640-1024px): 2-3 columnas, tipografía media
- **Desktop** (> 1024px): Layout completo, tipografía grande

---

## 🔧 Variables CSS Personalizadas

### Colores Adicionales
```css
--primary-soft: oklch(0.70 0.19 25 / 0.1);
--secondary-soft: oklch(0.30 0.08 260 / 0.08);
```

### Border Radius
```css
--radius: 0.75rem;
--radius-sm: calc(var(--radius) - 4px);
--radius-lg: var(--radius);
--radius-xl: calc(var(--radius) + 4px);
```

### Sombras
```css
shadow-lg shadow-primary/20
shadow-2xl
shadow-xl shadow-primary/30
```

---

## 🎨 Decoración Editorial

### Noise Texture
```html
<div className="absolute inset-0 opacity-[0.015] mix-blend-overlay">
  <svg className="w-full h-full">
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" />
    </filter>
    <rect width="100%" height="100%" filter="url(#noise)" />
  </svg>
</div>
```

### Líneas Decorativas
```html
<div className="w-2 h-32 bg-primary/20 rotate-12 animate-pulse-soft" />
```

### Formas Flotantes
```html
<div className="w-80 h-80 rounded-full bg-primary/8 blur-3xl animate-float" />
```

---

## 📚 Referencias

- **Inspiración**: Revistas editoriales modernas (Kinfolk, Monocle)
- **Tipografía**: Variable fonts con personalidad
- **Color**: Paletas cálidas y distintivas
- **Espaciado**: Sistemas editoriales clásicos

---

## ✅ Checklist de Implementación

Cuando crees un nuevo componente:

- [ ] Usa Fraunces para títulos
- [ ] Usa Bricolage Grotesque para cuerpo
- [ ] Aplica la paleta coral-tinta-ámbar
- [ ] Implementa animaciones fade-in-up
- [ ] Crea composición asimétrica
- [ ] Añade espacio generoso
- [ ] Verifica modo oscuro
- [ ] Prueba responsive
- [ ] Añade noise texture si aplica
- [ ] Implementa micro-interacciones

---

**Última actualización**: 2026-01-18
**Diseñador**: Claude Code con SKILL-design.md
**Estilo**: Documentalista Moderno
