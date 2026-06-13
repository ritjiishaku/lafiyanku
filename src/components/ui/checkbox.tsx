import * as React from "react";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <span className={cn("relative inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center", className)}>
      <input
        type="checkbox"
        ref={ref}
        className={cn(
          "peer h-full w-full cursor-pointer appearance-none rounded-[5px] border-[1.5px] border-slate-300 bg-white transition-all duration-200",
          "checked:border-clinical-teal checked:bg-clinical-teal",
          "hover:border-clinical-teal/60",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clinical-teal/30 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
        {...props}
      />
      <svg
        viewBox="0 0 12 12"
        fill="none"
        className="pointer-events-none absolute h-3 w-3 text-white opacity-0 transition-opacity duration-150 peer-checked:opacity-100"
      >
        <path
          d="M10 3L4.5 8.5L2 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
});
Checkbox.displayName = "Checkbox";

export { Checkbox };
