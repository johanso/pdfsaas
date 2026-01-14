"use client";

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Eraser, Check } from "lucide-react";

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  onClear?: () => void;
  width?: number;
  height?: number;
  penColor?: string;
  penWidth?: number;
  initialImage?: string | null;
}

export const SignaturePad = forwardRef<{ clear: () => void }, SignaturePadProps>(
  ({ onSave, onClear, width = 500, height = 200, penColor = "#000000", penWidth = 2, initialImage }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(!!initialImage);

    // Cargar imagen inicial si existe
    useEffect(() => {
      if (initialImage && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = initialImage;
      }
    }, [initialImage]);

    useImperativeHandle(ref, () => ({
      clear: clearCanvas
    }));

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      setIsDrawing(true);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

      ctx.beginPath();
      ctx.moveTo(clientX - rect.left, clientY - rect.top);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

      ctx.lineWidth = penWidth;
      ctx.lineCap = "round";
      ctx.strokeStyle = penColor;

      ctx.lineTo(clientX - rect.left, clientY - rect.top);
      ctx.stroke();
      setHasSignature(true);

      // Prevent scrolling on touch devices
      if ('touches' in e) {
        e.preventDefault();
      }
    };

    const stopDrawing = () => {
      setIsDrawing(false);
    };

    const clearCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
      onClear?.();
    };

    const handleSave = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      // Get base64 (default PNG transparent)
      const dataUrl = canvas.toDataURL();
      onSave(dataUrl);
    };

    return (
      <div className="flex flex-col gap-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white overflow-hidden touch-none">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="w-full h-full cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={clearCanvas}
            disabled={!hasSignature}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Eraser className="w-4 h-4 mr-2" />
            Borrar
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasSignature}
            className="bg-green-600 hover:bg-green-700"
          >
            <Check className="w-4 h-4 mr-2" />
            Usar esta firma
          </Button>
        </div>
      </div>
    );
  }
);

SignaturePad.displayName = "SignaturePad";
