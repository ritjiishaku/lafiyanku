"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface PrintButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function PrintButton({ onClick, disabled = false }: PrintButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="outline"
      className="touch-target-min"
    >
      <Printer className="mr-2 h-4 w-4" />
      Print
    </Button>
  );
}
