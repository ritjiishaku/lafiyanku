"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface FinaliseButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function FinaliseButton({
  onClick,
  disabled = false,
}: FinaliseButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="default"
      className="touch-target-min"
    >
      <CheckCircle className="mr-2 h-4 w-4" />
      Finalise Record
    </Button>
  );
}
