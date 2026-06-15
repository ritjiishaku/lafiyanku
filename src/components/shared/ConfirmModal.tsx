import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, CheckCircle, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

type ModalVariant = "primary" | "destructive" | "warning";

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string | ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  variant?: ModalVariant;
}

const variantConfig: Record<ModalVariant, { icon: typeof AlertTriangle; iconColor: string; bgColor: string }> = {
  primary: { icon: CheckCircle, iconColor: "text-clinical-teal", bgColor: "bg-clinical-teal/10" },
  destructive: { icon: AlertTriangle, iconColor: "text-red-500", bgColor: "bg-red-500/10" },
  warning: { icon: Archive, iconColor: "text-warm-amber", bgColor: "bg-warm-amber/10" },
};

const confirmButtonVariant: Record<ModalVariant, "primary" | "destructive" | "tertiary"> = {
  primary: "primary",
  destructive: "destructive",
  warning: "tertiary",
};

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  variant = "primary",
}: ConfirmModalProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-label={title}>
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", config.bgColor)}>
              <Icon className={cn("h-5 w-5", config.iconColor)} />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-deep-navy">{title}</DialogTitle>
              <DialogDescription className="text-slate">{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant={confirmButtonVariant[variant]} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
