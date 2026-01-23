import { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { PositionSelector } from "./position-selector";
import { WatermarkOptions, WatermarkPosition } from "@/hooks/useWatermarkPdf";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { notify } from "@/lib/errors/notifications";
import { parsePageInput } from "@/lib/watermark-utils";

interface WatermarkImageConfigProps {
  config: Partial<WatermarkOptions>;
  onChange: (updates: Partial<WatermarkOptions>) => void;
}

export function WatermarkImageConfig({ config, onChange }: WatermarkImageConfigProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pageInput, setPageInput] = useState("");

  const handleChange = (key: keyof WatermarkOptions, value: any) => {
    onChange({ [key]: value });
  };

  const handlePageInputChange = (value: string) => {
    setPageInput(value);

    if (!value.trim()) {
      handleChange('pages', 'all');
      return;
    }

    if (value.trim().endsWith('-') || value.trim().endsWith(',')) {
      return;
    }

    const timeoutId = setTimeout(() => {
      try {
        const parsed = parsePageInput(value);
        handleChange('pages', parsed);
      } catch (error) {
        // Suppress error during typing
        // notify.error(error instanceof Error ? error.message : "Formato de páginas inválido");
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        notify.error("La imagen no puede exceder 5MB");
        return;
      }
      handleChange('watermarkImage', file);
    }
  };

  const clearImage = () => {
    handleChange('watermarkImage', undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Upload Image */}
      <div className="space-y-2">
        <Label>Imagen</Label>
        {!config.watermarkImage ? (
          <div
            className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
            <span className="text-sm font-medium text-muted-foreground">Subir imagen (PNG/JPG)</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="relative group rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
            <div className="h-40 w-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center p-4">
              <img
                src={URL.createObjectURL(config.watermarkImage)}
                alt="Preview"
                className="max-h-full max-w-full object-contain shadow-sm"
              />
            </div>
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={clearImage}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      {config.watermarkImage && (
        <>
          {/* Tamaño */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Ancho ({config.width || 200}px)</Label>
            </div>
            <Slider
              value={[config.width || 200]}
              min={50}
              max={500}
              step={10}
              onValueChange={([val]) => handleChange('width', val)}
            />
          </div>

          {/* Mantener Proporción */}
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="aspect-ratio">Mantener proporción</Label>
            <Switch
              id="aspect-ratio"
              checked={config.maintainAspectRatio === 'true'}
              onCheckedChange={(checked) => handleChange('maintainAspectRatio', checked ? 'true' : 'false')}
            />
          </div>

          {/* Opacidad */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Opacidad ({Math.round((config.opacity || 0.5) * 100)}%)</Label>
            </div>
            <Slider
              value={[config.opacity || 0.5]}
              min={0}
              max={1}
              step={0.05}
              onValueChange={([val]) => handleChange('opacity', val)}
            />
          </div>

          {/* Rotación */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Rotación ({config.rotation || 0}°)</Label>
            </div>
            <Slider
              value={[config.rotation || 0]}
              min={0}
              max={360}
              step={15}
              onValueChange={([val]) => handleChange('rotation', val)}
            />
          </div>

          {/* Posición */}
          <PositionSelector
            value={config.position as WatermarkPosition}
            onChange={(pos) => handleChange('position', pos)}
            customX={config.customX}
            customY={config.customY}
            onCustomChange={(x, y) => {
              onChange({ customX: x, customY: y });
            }}
          />

          {/* Páginas */}
          <div className="space-y-2">
            <Label>Páginas</Label>
            <div className="flex gap-2">
              <Button
                variant={config.pages === 'all' ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  handleChange('pages', 'all');
                  setPageInput("");
                }}
                className="flex-1"
              >
                Todas
              </Button>
            </div>
            <Input
              placeholder="Ej: 1,3-5,10 (o dejar vacío para todas)"
              value={pageInput}
              onChange={(e) => handlePageInputChange(e.target.value)}
            />
          </div>
        </>
      )}
    </div>
  );
}
