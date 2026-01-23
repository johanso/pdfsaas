import { WatermarkOptions } from "@/hooks/useWatermarkPdf";
import { cn } from "@/lib/utils";

interface WatermarkOverlayProps {
  config: WatermarkOptions;
  pageData?: {
    width?: number;
    height?: number;
  };
}

/**
 * WatermarkOverlay component for real-time preview in PDF thumbnails.
 * Visual Zone Logic: Shows safe zones to guide the user.
 */
export function WatermarkOverlay({ config, pageData }: WatermarkOverlayProps) {
  if (!config.text && !config.watermarkImage) return null;

  const pageWidth = pageData?.width || 595;
  const pageHeight = pageData?.height || 841;
  const marginPx = 20;

  // Rotation logic matching backend
  const getRotatedSize = (w: number, h: number, angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    const cos = Math.abs(Math.cos(rad));
    const sin = Math.abs(Math.sin(rad));
    return {
      wRot: w * cos + h * sin,
      hRot: w * sin + h * cos
    };
  };

  // Estimate dimensions for CSS scaling
  let contentWidth = 0;
  let contentHeight = 0;

  if (config.type === 'text') {
    contentWidth = (config.text || 'MARCA DE AGUA').length * (config.fontSize || 36) * 0.55;
    contentHeight = (config.fontSize || 36);
  } else {
    contentWidth = config.width || 200;
    contentHeight = config.height || (contentWidth * 0.75);
  }

  const { wRot, hRot } = getRotatedSize(contentWidth, contentHeight, config.rotation || 0);

  let left: string | undefined = '50%';
  let top: string | undefined = '50%';

  switch (config.position) {
    case 'top-left':
      left = `${((marginPx + wRot / 2) / pageWidth) * 100}%`;
      top = `${((marginPx + hRot / 2) / pageHeight) * 100}%`;
      break;
    case 'top-right':
      left = `${((pageWidth - marginPx - wRot / 2) / pageWidth) * 100}%`;
      top = `${((marginPx + hRot / 2) / pageHeight) * 100}%`;
      break;
    case 'bottom-left':
      left = `${((marginPx + wRot / 2) / pageWidth) * 100}%`;
      top = `${((pageHeight - marginPx - hRot / 2) / pageHeight) * 100}%`;
      break;
    case 'bottom-right':
      left = `${((pageWidth - marginPx - wRot / 2) / pageWidth) * 100}%`;
      top = `${((pageHeight - marginPx - hRot / 2) / pageHeight) * 100}%`;
      break;
    case 'custom':
      if (config.customX !== undefined && config.customY !== undefined) {
        left = `${config.customX * 100}%`;
        top = `${config.customY * 100}%`;
      }
      break;
    case 'center':
    default:
      break;
  }

  const fontSizeCqw = (config.fontSize || 36) / pageWidth * 100;
  const marginPct = (marginPx / pageWidth) * 100;

  return (
    <div className="absolute inset-0 pointer-events-none @container/overlay flex items-center justify-center">
      {/* Visual Safe Zone Grid */}
      <div className="absolute inset-0 flex flex-wrap opacity-20 transition-opacity group-hover:opacity-40">
        <div className={cn("w-1/2 h-1/2 border-r border-b border-dashed border-zinc-400", config.position === 'top-left' && "bg-primary/5")} />
        <div className={cn("w-1/2 h-1/2 border-b border-dashed border-zinc-400", config.position === 'top-right' && "bg-primary/5")} />
        <div className={cn("w-1/2 h-1/2 border-r border-dashed border-zinc-400", config.position === 'bottom-left' && "bg-primary/5")} />
        <div className={cn("w-1/2 h-1/2 border-dashed border-zinc-400", config.position === 'bottom-right' && "bg-primary/5")} />
        <div className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 border border-dashed border-zinc-400 rounded-lg",
          config.position === 'center' && "bg-primary/10 border-primary"
        )} />
      </div>

      {/* Actual Watermark */}
      <div
        style={{
          position: 'absolute',
          left,
          top,
          transform: `translate(-50%, -50%) rotate(${config.rotation || 0}deg)`,
          width: config.type === 'image' ? `${(contentWidth / pageWidth) * 100}cqw` : 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {config.type === 'text' ? (
          <div
            style={{
              color: config.color || '#FF0000',
              opacity: config.opacity || 0.5,
              fontSize: `${fontSizeCqw}cqw`,
              fontWeight: '700',
              whiteSpace: 'nowrap',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)',
              lineHeight: 1,
              padding: '2px',
            }}
          >
            {config.text || 'MARCA DE AGUA'}
          </div>
        ) : (
          config.watermarkImage && (
            <img
              src={config.watermarkImage instanceof File ? URL.createObjectURL(config.watermarkImage) : (config.watermarkImage as string)}
              alt="Watermark"
              style={{
                width: '100%',
                height: 'auto',
                maxWidth: 'none',
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
                display: 'block',
                opacity: config.opacity || 0.5,
              }}
            />
          )
        )}
      </div>
    </div>
  );
}
