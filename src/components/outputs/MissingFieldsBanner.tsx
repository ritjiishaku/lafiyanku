import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface MissingFieldsBannerProps {
  fields: string[];
}

export function MissingFieldsBanner({ fields }: MissingFieldsBannerProps) {
  if (fields.length === 0) return null;

  return (
    <Alert variant="default" className="border-warm-amber bg-warm-amber/5">
      <AlertTriangle className="h-4 w-4 text-warm-amber" />
      <AlertTitle className="text-warm-amber">Missing Information</AlertTitle>
      <AlertDescription>
        <ul className="list-inside list-disc text-sm">
          {fields.map((field) => (
            <li key={field}>{field}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
