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
  )
}