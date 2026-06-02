import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TranslationPanelProps {
  content: string | null;
  language: string | null;
  confidence: string | null;
}

export function TranslationPanel({
  content,
  language,
  confidence,
}: TranslationPanelProps) {
  if (!content) return null;

  const languageLabel =
    language === "ha" ? "Hausa" : language === "yo" ? "Yoruba" : language === "ig" ? "Igbo" : language;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-deep-navy">
          Translation ({languageLabel})
          {confidence === "low" && (
            <span className="ml-2 text-xs text-warm-amber">Low confidence</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="whitespace-pre-wrap font-sans text-sm text-slate">
          {content}
        </pre>
      </CardContent>
    </Card>
  );
}
