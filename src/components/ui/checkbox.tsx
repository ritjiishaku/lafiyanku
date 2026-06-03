import * as React from "react";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      type="checkbox"
      ref={ref}
      className={cn(
        "peer relative h-4 w-4 shrink-0 appearance-none rounded border-2 border-slate-300 bg-white transition-all duration-150",
        "checked:border-clinical-teal checked:bg-clinical-teal",
        "checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2",
        "checked:after:h-2.5 checked:after:w-1.5 checked:after:border-r-2 checked:after:border-b-2 checked:after:border-white checked:after:rotate-45",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clinical-teal/30 focus-visible:ring-offset-1",
        "hover:border-clinical-teal/60",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});
Checkbox.displayName = "Checkbox";

export { Checkbox };
