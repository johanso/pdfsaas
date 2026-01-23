import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WatermarkPosition } from "@/hooks/useWatermarkPdf";

interface PositionSelectorProps {
  value: WatermarkPosition;
  onChange: (pos: WatermarkPosition) => void;
  customX?: number;
  customY?: number;
  onCustomChange?: (x: number, y: number) => void;
}

const POSITIONS: { value: WatermarkPosition; label: string; gridArea: string }[] = [
  { value: 'top-left', label: 'TL', gridArea: '1 / 1 / 2 / 2' },
  { value: 'top-right', label: 'TR', gridArea: '1 / 3 / 2 / 4' },
  { value: 'center', label: 'C', gridArea: '2 / 2 / 3 / 3' },
  { value: 'bottom-left', label: 'BL', gridArea: '3 / 1 / 4 / 2' },
  { value: 'bottom-right', label: 'BR', gridArea: '3 / 3 / 4 / 4' },
];

export function PositionSelector({ value, onChange, customX, customY, onCustomChange }: PositionSelectorProps) {
  return (
    <div className="space-y-3">
      <Label>Posición</Label>
      <div className="grid grid-cols-3 grid-rows-3 gap-2 w-32 h-32 mx-auto bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg border border-zinc-200 dark:border-zinc-700">
        {POSITIONS.map((pos) => (
          <Button
            key={pos.value}
            variant={value === pos.value ? "default" : "outline"}
            size="sm"
            className={cn("w-full h-full p-0 text-[10px]", value !== pos.value && "opacity-50 hover:opacity-100")}
            style={{ gridArea: pos.gridArea }}
            onClick={() => onChange(pos.value)}
          >
            {pos.label}
          </Button>
        ))}
        {/* Custom middle button if needed or separate */}
      </div>

      {/* Custom option toggle */}
      <div className="flex justify-center">
        <Button
          variant={value === 'custom' ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onChange('custom')}
          className="text-xs h-7"
        >
          Posición manual
        </Button>
      </div>

      {value === 'custom' && onCustomChange && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="space-y-1">
            <Label htmlFor="posX" className="text-[10px]">X ({Math.round((customX || 0) * 100)}%)</Label>
            <Input
              id="posX"
              type="number"
              min="0"
              max="100"
              step="1"
              value={Math.round((customX || 0) * 100)}
              onChange={(e) => {
                const percent = Math.max(0, Math.min(100, Number(e.target.value)));
                onCustomChange(percent / 100, customY || 0);
              }}
              className="h-7 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="posY" className="text-[10px]">Y ({Math.round((customY || 0) * 100)}%)</Label>
            <Input
              id="posY"
              type="number"
              min="0"
              max="100"
              step="1"
              value={Math.round((customY || 0) * 100)}
              onChange={(e) => {
                const percent = Math.max(0, Math.min(100, Number(e.target.value)));
                onCustomChange(customX || 0, percent / 100);
              }}
              className="h-7 text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
}
