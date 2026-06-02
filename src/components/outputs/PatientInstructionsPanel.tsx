import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PatientInstructionsPanelProps {
  content: string;
}

export function PatientInstructionsPanel({
  content,
}: PatientInstructionsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-deep-navy">Patient Discharge Instructions</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="whitespace-pre-wrap font-sans text-sm text-slate">
          {content}
        </pre>
      </CardContent>
    </Card>
  );
}
