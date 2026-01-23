import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { PositionSelector } from "./position-selector";
import { WatermarkOptions, WatermarkPosition } from "@/hooks/useWatermarkPdf";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { parsePageInput } from "@/lib/watermark-utils";
import { notify } from "@/lib/errors/notifications";

interface WatermarkTextConfigProps {
  config: Partial<WatermarkOptions>;
  onChange: (updates: Partial<WatermarkOptions>) => void;
}

const PRESET_COLORS = [
  "#000000", // Negro
  "#FF0000", // Rojo
  "#0000FF", // Azul
  "#808080", // Gris
  "#008000", // Verde
  "#FFA500", // Naranja
];

export function WatermarkTextConfig({ config, onChange }: WatermarkTextConfigProps) {
  const [pageInput, setPageInput] = useState("");

  const handleChange = (key: keyof WatermarkOptions, value: any) => {
    onChange({ [key]: value });
  };

  const handlePageInputChange = (value: string) => {
    setPageInput(value);

    // If empty, set to all
    if (!value.trim()) {
      handleChange('pages', 'all');
      return;
    }

    // Don't validate if ending with incomplete syntax
    if (value.trim().endsWith('-') || value.trim().endsWith(',')) {
      return;
    }

    // Debounce validation slightly to avoid flash of error while typing
    const timeoutId = setTimeout(() => {
      try {
        const parsed = parsePageInput(value);
        handleChange('pages', parsed);
      } catch (error) {
        // Only show error for "complete" looking inputs that are invalid
        // or just let the user finish typing.
        // For now, suppress error toast on intermediate typing, 
        // maybe just log or show inline error state if we had one.
        // We will notify only if it seems like a done attempt or very broken.
        // notify.error(error instanceof Error ? error.message : "Formato de páginas inválido");
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  return (
    <div className="space-y-6">
      {/* Texto */}
      <div className="space-y-2">
        <Label htmlFor="text-input">Texto de la marca</Label>
        <Input
          id="text-input"
          value={config.text || ""}
          onChange={(e) => handleChange('text', e.target.value)}
          placeholder="Ej: CONFIDENCIAL"
          maxLength={50}
        />
      </div>

      {/* Tamaño de fuente */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Tamaño ({config.fontSize}pt)</Label>
          {(config.fontSize || 48) > 60 && (
            <span className="text-[10px] text-amber-600 dark:text-amber-400">Grande</span>
          )}
        </div>
        <Slider
          value={[config.fontSize || 48]}
          min={12}
          max={72}
          step={1}
          onValueChange={([val]) => handleChange('fontSize', val)}
        />
        <div className="flex justify-between text-[10px] text-zinc-400">
          <span>12pt</span>
          <span>36pt</span>
          <span>72pt</span>
        </div>
      </div>

      {/* Color */}
      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex gap-2 flex-wrap">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              className={cn(
                "w-6 h-6 rounded-full border border-zinc-200 dark:border-zinc-700 shadow-sm",
                config.color === color && "ring-2 ring-primary ring-offset-2"
              )}
              style={{ backgroundColor: color }}
              onClick={() => handleChange('color', color)}
            />
          ))}
          <div className="relative w-6 h-6 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700">
            <input
              type="color"
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              value={config.color}
              onChange={(e) => handleChange('color', e.target.value)}
            />
            <div
              className="w-full h-full"
              style={{
                background: `conic-gradient(from 180deg at 50% 50%, 
                   red 0deg, 
                   orange 60deg, 
                   yellow 120deg, 
                   green 180deg, 
                   blue 240deg, 
                   indigo 300deg, 
                   violet 360deg)`
              }}
            />
          </div>
        </div>
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
          <Label>Rotación ({config.rotation}°)</Label>
        </div>
        <div className="flex gap-2 mb-2">
          {[0, 45, 90].map(deg => (
            <Button
              key={deg}
              variant="outline"
              size="sm"
              className="h-6 text-[10px]"
              onClick={() => handleChange('rotation', deg)}
            >
              {deg}°
            </Button>
          ))}
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
    </div>
  );
}
