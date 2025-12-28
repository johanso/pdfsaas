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
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function TooltipButton({
  icon,
  tooltip,
  iconSize = 18,
  side = "left",
  disabled = false,
  variant = "ghost",
  onClick,
}: TooltipButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant={variant}
          className={`shadow-none disabled:opacity-15 disabled:bg-zinc-100 ${disabled ? "hidden" : ""}`}
          disabled={disabled}
          onClick={onClick}
        >
          <BootstrapIcon name={icon} size={iconSize} color={variant === "destructive" ? "#fff" : "var(--accent-foreground)"} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side={side}>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}