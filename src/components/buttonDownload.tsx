import { Button } from "./ui/button";
import { ArrowDownToLine } from "lucide-react";

export function ButtonDownload({
  handleOpenSaveDialog,
  buttonText,
  disabled
}: {
  handleOpenSaveDialog: () => void;
  buttonText: string;
  disabled: any;
}) {
  return (
    <div className="lg:border-t lg:border-zinc-200 dark:lg:border-zinc-800">
      <Button
        variant="hero"
        className="w-full py-6 font-medium"
        size="lg"
        onClick={handleOpenSaveDialog}
        disabled={disabled}
      >
        {buttonText}
        <ArrowDownToLine className="w-4 h-4" />
      </Button>
    </div>
  )
}