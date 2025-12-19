import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import BootstrapIcon from "@/components/bootstrapIcon";

interface TooltipButtonProps {
  icon: string;
  tooltip: string;
  iconSize?: number;
  side?: "top" | "right" | "bottom" | "left";
  onClick?: () => void;
  disabled?: boolean;
}

export function TooltipButton({
  icon,
  tooltip,
  iconSize = 16,
  side = "top",
  disabled = false,
  onClick,
}: TooltipButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="shadow-none disabled:opacity-15 disabled:bg-zinc-100"
          disabled={disabled}
          onClick={onClick}
        >
          <BootstrapIcon name={icon} size={iconSize} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side={side}>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}