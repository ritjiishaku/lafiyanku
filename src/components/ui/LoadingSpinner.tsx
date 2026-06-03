import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export function LoadingSpinner({ size = "md", label, className = "" }: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`} role="status" aria-live="polite">
      <Loader2 className={`animate-spin text-clinical-teal ${sizeClasses[size]}`} />
      {label && <p className="text-sm text-cool-grey">{label}</p>}
      <span className="sr-only">{label ?? "Loading"}</span>
    </div>
  );
}
