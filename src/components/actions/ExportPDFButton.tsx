"use client";

import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface ExportPDFButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function ExportPDFButton({
  onClick,
  disabled = false,
}: ExportPDFButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="outline"
      className="touch-target-min"
    >
      <FileText className="mr-2 h-4 w-4" />
      Export PDF
    </Button>
  );
}
