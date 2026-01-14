"use client";

import { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignaturePad } from "./signature-pad";
import {
  Type,
  PenTool,
  Upload,
  Check,
  Trash2,
  Image as ImageIcon,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

// Estilos de fuentes para firmas tipográficas
export const SIGNATURE_FONTS = [
  { name: "Dancing Script", family: "'Dancing Script', cursive" },
  { name: "Cormorant Upright", family: "'Cormorant Upright', serif" },
  { name: "Yellowtail", family: "'Yellowtail', cursive" },
  { name: "Caveat", family: "'Caveat', cursive" },
  { name: "Great Vibes", family: "'Great Vibes', cursive" },
  { name: "Alex Brush", family: "'Alex Brush', cursive" },
];

export const SIGNATURE_COLORS = [
  { name: "Negro", value: "#000000" },
  { name: "Azul Profundo", value: "#1e3a8a" },
  { name: "Azul Real", value: "#2563eb" },
  { name: "Rojo Oscuro", value: "#991b1b" },
];

export interface SignatureSource {
  type: 'draw' | 'type' | 'upload';
  dataUrl: string;
  text?: string;
  font?: string;
  color?: string;
}

interface SignatureCreatorProps {
  onSave: (info: SignatureSource) => void;
  initialData?: SignatureSource | null;
}

export function SignatureCreator({ onSave, initialData }: SignatureCreatorProps) {
  const [activeTab, setActiveTab] = useState<string>(initialData?.type || "draw");
  const [typedName, setTypedName] = useState(initialData?.text || "");
  const [selectedFont, setSelectedFont] = useState(initialData?.font || SIGNATURE_FONTS[0].family);
  const [selectedColor, setSelectedColor] = useState(initialData?.color || SIGNATURE_COLORS[0].value);
  const [uploadedImage, setUploadedImage] = useState<string | null>(initialData?.type === 'upload' ? initialData.dataUrl : null);

  // Sincronizar estado cuando cambia initialData (al abrir la modal)
  useEffect(() => {
    if (initialData) {
      setActiveTab(initialData.type);
      if (initialData.type === 'type') {
        setTypedName(initialData.text || "");
        setSelectedFont(initialData.font || SIGNATURE_FONTS[0].family);
      }
      if (initialData.color) {
        setSelectedColor(initialData.color);
      }
      if (initialData.type === 'upload') {
        setUploadedImage(initialData.dataUrl);
      } else {
        setUploadedImage(null);
      }
    }
  }, [initialData]);

  const textCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inyectar fuentes de Google para las firmas
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Alex+Brush&family=Caveat&family=Cormorant+Upright:wght@300;500&family=Dancing+Script:wght@400;700&family=Great+Vibes&family=Yellowtail&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const handleSaveTyped = () => {
    if (!typedName) return;
    const canvas = textCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Limpiar y configurar
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Configurar fuente
    ctx.font = `60px ${selectedFont}`;
    ctx.fillStyle = selectedColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Dibujar texto
    ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);

    onSave({
      type: 'type',
      dataUrl: canvas.toDataURL(),
      text: typedName,
      font: selectedFont,
      color: selectedColor
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveUpload = () => {
    if (uploadedImage) {
      onSave({
        type: 'upload',
        dataUrl: uploadedImage
      });
    }
  };

  const handleDrawSave = (dataUrl: string) => {
    onSave({
      type: 'draw',
      dataUrl,
      color: selectedColor
    });
  }

  return (
    <div className="w-full space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
          <TabsTrigger value="draw" className="rounded-lg transition-all flex items-center gap-2">
            <PenTool className="w-4 h-4" />
            <span className="hidden sm:inline">Dibujar</span>
          </TabsTrigger>
          <TabsTrigger value="type" className="rounded-lg transition-all flex items-center gap-2">
            <Type className="w-4 h-4" />
            <span className="hidden sm:inline">Escribir</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="rounded-lg transition-all flex items-center gap-2">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Subir</span>
          </TabsTrigger>
        </TabsList>

        {/* --- Selector de Color Global para Dibujar y Escribir --- */}
        {(activeTab === 'draw' || activeTab === 'type') && (
          <div className="flex items-center gap-4 mb-6 px-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mr-auto">Color de Tinta</span>
            <div className="flex items-center gap-2">
              {SIGNATURE_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  title={color.name}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all hover:scale-110 flex items-center justify-center",
                    selectedColor === color.value ? "border-primary ring-2 ring-primary/20 scale-110 shadow-sm" : "border-white/50"
                  )}
                  style={{ backgroundColor: color.value }}
                >
                  {selectedColor === color.value && <Check className="w-3 h-3 text-white mix-blend-difference" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB: DIBUJAR */}
        <TabsContent value="draw" className="mt-0 outline-none">
          <div className="bg-zinc-50 dark:bg-zinc-900 border rounded-2xl p-4 overflow-hidden">
            <SignaturePad
              onSave={handleDrawSave}
              penColor={selectedColor}
              initialImage={initialData?.type === 'draw' ? initialData.dataUrl : null}
            />
            <p className="text-[10px] text-muted-foreground mt-3 text-center uppercase tracking-widest font-medium opacity-60">
              Dibuja tu firma arriba con el mouse o pantalla táctil
            </p>
          </div>
        </TabsContent>

        {/* TAB: ESCRIBIR */}
        <TabsContent value="type" className="mt-0 outline-none space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <Input
                placeholder="Escribe tu nombre aquí..."
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                className="text-lg py-6 px-4 rounded-xl border-2 focus-visible:ring-primary h-14"
              />
              {typedName && (
                <button
                  onClick={() => setTypedName("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SIGNATURE_FONTS.map((font) => (
                <button
                  key={font.name}
                  onClick={() => setSelectedFont(font.family)}
                  className={cn(
                    "relative h-24 border-2 rounded-xl p-3 flex items-center justify-center transition-all bg-white dark:bg-zinc-950 overflow-hidden group",
                    selectedFont === font.family ? "border-primary shadow-md ring-1 ring-primary/20" : "hover:border-zinc-300 dark:hover:border-zinc-700"
                  )}
                >
                  <span
                    style={{ fontFamily: font.family, color: selectedColor }}
                    className={cn(
                      "text-2xl truncate px-2",
                      selectedFont === font.family ? "" : "opacity-80 group-hover:opacity-100"
                    )}
                  >
                    {typedName || "Tu Firma"}
                  </span>
                  {selectedFont === font.family && (
                    <div className="absolute top-1 right-1">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <canvas ref={textCanvasRef} width={600} height={200} className="hidden" />

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSaveTyped}
                className="rounded-xl px-8 h-11"
                disabled={!typedName}
              >
                <Check className="w-4 h-4 mr-2" />
                Usar esta firma
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* TAB: SUBIR */}
        <TabsContent value="upload" className="mt-0 outline-none">
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-2xl h-56 flex flex-col items-center justify-center cursor-pointer transition-all gap-4 relative overflow-hidden group",
                uploadedImage ? "border-primary bg-primary/5" : "border-zinc-300 dark:border-zinc-800 hover:border-primary/50 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              )}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />

              {uploadedImage ? (
                <div className="w-full h-full flex items-center justify-center p-6 relative">
                  <img src={uploadedImage} alt="Firma subida" className="max-w-full max-h-full object-contain drop-shadow-md" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <Button variant="secondary" size="sm" onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}>
                      <ImageIcon className="w-4 h-4 mr-2" /> Cambiar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={(e) => {
                      e.stopPropagation();
                      setUploadedImage(null);
                    }}>
                      <Trash2 className="w-4 h-4 mr-2" /> Quitar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-4 rounded-full bg-zinc-100 dark:bg-zinc-800 group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-8 h-8 text-zinc-400 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-zinc-700 dark:text-zinc-200">Sube una Firma, Logo o Sello</p>
                    <p className="text-sm text-muted-foreground px-8">Selecciona una imagen de tu dispositivo. Los PNG con transparencia funcionan mejor.</p>
                  </div>
                </>
              )}
            </div>

            {uploadedImage && (
              <div className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <Sparkles className="w-4 h-4 text-primary" />
                <p className="text-[11px] text-muted-foreground flex-1">
                  Recomendación: Usa imágenes con fondo transparente para un resultado profesional.
                </p>
                <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-bold" onClick={() => setUploadedImage(null)}>
                  Limpiar
                </Button>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSaveUpload}
                className="rounded-xl px-8 h-11"
                disabled={!uploadedImage}
              >
                <Check className="w-4 h-4 mr-2" />
                Usar imagen como firma
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
