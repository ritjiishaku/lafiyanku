import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ClinicalSummaryPanelProps {
  content: string;
}

export function ClinicalSummaryPanel({ content }: ClinicalSummaryPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-deep-navy">Clinical Discharge Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="whitespace-pre-wrap font-sans text-sm text-slate">
          {content}
        </pre>
      </CardContent>
    </Card>
  );
}
