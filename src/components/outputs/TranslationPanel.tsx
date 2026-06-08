"use client";

import { SEPARATOR_RE } from "@/lib/output-utils";

interface TranslationPanelProps {
  content: string | null;
  language: string | null;
  confidence: string | null;
  onRetranslate?: () => void;
}

function isSeparatorLine(line: string): boolean {
  return SEPARATOR_RE.test(line.trim()) || /^[─━—–\-*]{5,}$/.test(line.trim());
}

function renderDocumentContent(text: string) {
  const blocks = text.split(/\n{2,}/);
  const nodes: React.ReactNode[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const raw = blocks[i].trim();
    if (!raw) continue;

    const lines = raw.split("\n").filter((l) => {
      const t = l.trim();
      return t && !isSeparatorLine(t) && !/^translated discharge instructions/i.test(t) && !/^language:/i.test(t);
    });

    if (lines.length === 0) continue;

    const allBullets = lines.every((l) => /^[-•*]\s/.test(l.trim()));

    if (allBullets) {
      nodes.push(
        <div key={`b-${i}`} style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 20 }}>
          {lines.map((l, j) => (
            <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 14, color: "#1E293B", lineHeight: 1.6 }}>
              <span style={{ color: "#0B6E6E", fontSize: 18, lineHeight: 1.4 }}>•</span>
              <span>{l.replace(/^[-•*]\s*/, "")}</span>
            </div>
          ))}
        </div>,
      );
      continue;
    }

    const joined = lines.join(" ").trim();
    const isShort = joined.length < 100 && lines.length <= 2;

    if (isShort) {
      nodes.push(
        <div key={`h-${i}`} style={{ fontSize: 16, fontWeight: 700, color: "#0D2B4E", marginBottom: 12, marginTop: i > 0 ? 4 : 0 }}>
          {joined}
        </div>,
      );
    } else {
      const meds = parseTranslationMedications(raw);
      if (meds.length > 0) {
        nodes.push(
          <div key={`m-${i}`} style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {meds.map((med, j) => (
              <div
                key={j}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                {med.name && (
                  <div style={{ fontWeight: 700, color: "#1E293B", fontSize: 14, marginBottom: 4 }}>
                    {med.name}
                  </div>
                )}
                {(med.dosage || med.frequency) && (
                  <div style={{ color: "#0B6E6E", fontSize: 13, marginBottom: 4 }}>
                    {[med.dosage, med.frequency].filter(Boolean).join(" — ")}
                  </div>
                )}
                {(med.timing || med.duration) && (
                  <div style={{ color: "#64748B", fontSize: 12, marginBottom: 2 }}>
                    {[med.timing, med.duration].filter(Boolean).join(" · ")}
                  </div>
                )}
                {med.notes && (
                  <div style={{ color: "#64748B", fontStyle: "italic", fontSize: 12 }}>
                    {med.notes}
                  </div>
                )}
              </div>
            ))}
          </div>,
        );
      } else {
        nodes.push(
          <div key={`p-${i}`} style={{ fontSize: 14, color: "#1E293B", lineHeight: 1.7, marginBottom: 20 }}>
            {joined}
          </div>,
        );
      }
    }
  }

  return nodes.length > 0 ? nodes : <div style={{ fontSize: 14, color: "#1E293B", lineHeight: 1.6 }}>{text}</div>;
}

function parseTranslationMedications(text: string): Array<{ name: string; dosage: string; frequency: string; timing: string; duration: string; notes: string }> {
  const lines = text.split("\n").filter((l) => {
    const t = l.trim();
    return t && !isSeparatorLine(t);
  });
  const meds: Array<{ name: string; dosage: string; frequency: string; timing: string; duration: string; notes: string }> = [];
  let current: { name: string; dosage: string; frequency: string; timing: string; duration: string; notes: string } | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const dashMatch = trimmed.match(/^[-•*]\s*(.+)/);
    const content = dashMatch ? dashMatch[1].trim() : trimmed;

    const colonIdx = content.indexOf(":");
    if (colonIdx > 0) {
      const key = content.slice(0, colonIdx).trim().toLowerCase();
      const val = content.slice(colonIdx + 1).trim();

      if (key.includes("medication") || key.includes("name") || key === "take" || key === "use") {
        if (current) meds.push(current);
        current = { name: val, dosage: "", frequency: "", timing: "", duration: "", notes: "" };
      } else if (current) {
        if (key.includes("dose") || key.includes("dosa")) current.dosage = val;
        else if (key.includes("freq") || key.includes("how often")) current.frequency = val;
        else if (key.includes("tim") || key.includes("when")) current.timing = val;
        else if (key.includes("dur") || key.includes("how long")) current.duration = val;
        else if (key.includes("note")) current.notes = val;
      }
    } else {
      if (current) {
        if (!current.name) current.name = content;
        else if (!current.dosage) current.dosage = content;
        else if (!current.frequency) current.frequency = content;
      }
    }
  }

  if (current) meds.push(current);

  if (meds.length === 0 && lines.length > 0) {
    const firstLine = lines[0].trim();
    if (firstLine) {
      meds.push({ name: firstLine, dosage: "", frequency: "", timing: "", duration: "", notes: "" });
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          const last = meds[meds.length - 1];
          if (!last.dosage) last.dosage = line;
          else if (!last.frequency) last.frequency = line;
        }
      }
    }
  }

  return meds;
}

export function TranslationPanel({
  content,
  language,
  confidence,
  onRetranslate,
}: TranslationPanelProps) {
  if (!content) return null;

  const languageLabel =
    language === "ha" ? "Hausa" : language === "yo" ? "Yoruba" : language === "ig" ? "Igbo" : language ?? "";

  function renderHeader() {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#0D2B4E" }}>
            Translation ({languageLabel})
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              background: "#0D2B4E",
              color: "#FFFFFF",
              padding: "3px 10px",
              borderRadius: 9999,
              letterSpacing: "0.03em",
            }}
          >
            {languageLabel}
          </span>
        </div>
      </div>
    );
  }

  function renderConfidenceBanners() {
    return (
      <>
        {confidence === "low" && (
          <div
            style={{
              background: "#FFF8E1",
              borderBottom: "1px solid #FDE68A",
              padding: "10px 20px",
              fontSize: 13,
              color: "#B45309",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span role="img" aria-label="warning">⚠</span>
            Fallback — low confidence
          </div>
        )}
        {confidence === "failed" && (
          <div
            style={{
              background: "#FEF2F2",
              borderBottom: "1px solid #FECACA",
              padding: "10px 20px",
              fontSize: 13,
              color: "#DC2626",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span role="img" aria-label="warning">⚠</span>
            Translation failed — English shown
          </div>
        )}
        {(confidence === "low" || confidence === "failed") && onRetranslate && (
          <div style={{ padding: "8px 20px", borderBottom: "1px solid #E2E8F0" }}>
            <button
              type="button"
              onClick={onRetranslate}
              style={{
                background: "#0B6E6E",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 6,
                padding: "6px 14px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                minHeight: 36,
              }}
            >
              Retranslate
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {renderHeader()}
      {renderConfidenceBanners()}
      <div style={{ padding: 20 }}>
        <div style={{ fontSize: 14, color: "#1E293B", lineHeight: 1.6, overflowWrap: "break-word", wordBreak: "break-word" }}>
          {renderDocumentContent(content)}
        </div>
      </div>
    </div>
  );
}
