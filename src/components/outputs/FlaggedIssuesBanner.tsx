import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface FlaggedIssuesBannerProps {
  issues: string[];
}

export function FlaggedIssuesBanner({ issues }: FlaggedIssuesBannerProps) {
  if (issues.length === 0) return null;

  return (
    <Alert variant="default" className="border-warm-amber bg-warm-amber/10" role="alert" aria-live="polite">
      <AlertTriangle className="h-4 w-4 text-warm-amber" />
      <AlertTitle className="text-warm-amber">Issues Detected</AlertTitle>
      <AlertDescription>
        <ul className="list-inside list-disc text-sm">
          {issues.map((issue, i) => (
            <li key={i}>{issue}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
