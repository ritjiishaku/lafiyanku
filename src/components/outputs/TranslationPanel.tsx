"use client";

import { parseSections, parseMedicationLines, renderWithDividers, SectionBadge } from "@/lib/output-utils";

const PATIENT_HEADERS = [
  "What happened",
  "Treatment you received",
  "Your medications",
  "Important home care instructions",
  "When to return to the hospital",
  "Your follow-up appointment",
];

interface TranslationPanelProps {
  content: string | null;
  language: string | null;
  confidence: string | null;
  onRetranslate?: () => void;
}

export function TranslationPanel({
  content,
  language,
  confidence,
  onRetranslate,
}: TranslationPanelProps) {
  if (!content) return null;

  const sections = parseSections(content, PATIENT_HEADERS);
  const hasSections = Object.keys(sections).length > 1;

  const languageLabel =
    language === "ha" ? "Hausa" : language === "yo" ? "Yoruba" : language === "ig" ? "Igbo" : language ?? "";

  const sectionStyle: React.CSSProperties = {
    marginBottom: 20,
  };

  const sectionHeadingStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  };

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

  function renderParsedContent() {
    return (
      <div style={{ padding: "16px 20px" }}>
        {sections["What happened"] && (
          <div style={sectionStyle}>
            <div style={sectionHeadingStyle}>
              <SectionBadge num="1" />
              <span style={{ fontSize: 15, fontWeight: 600, color: "#0D2B4E" }}>
                What happened
              </span>
            </div>
            <div style={{ fontSize: 15, color: "#1E293B", lineHeight: 1.7, marginLeft: 34 }}>
              {renderWithDividers(sections["What happened"], "#0B6E6E", "1.5px", "16px 0", 0.6)}
            </div>
          </div>
        )}

        {sections["Treatment you received"] && (
          <div style={sectionStyle}>
            <div style={sectionHeadingStyle}>
              <SectionBadge num="2" />
              <span style={{ fontSize: 15, fontWeight: 600, color: "#0D2B4E" }}>
                Treatment you received
              </span>
            </div>
            <div style={{ fontSize: 14, color: "#1E293B", lineHeight: 1.6, marginLeft: 34 }}>
              {renderWithDividers(sections["Treatment you received"], "#0B6E6E", "1.5px", "16px 0", 0.6)}
            </div>
          </div>
        )}

        {sections["Your medications"] && (
          <div style={sectionStyle}>
            <div style={sectionHeadingStyle}>
              <SectionBadge num="3" />
              <span style={{ fontSize: 15, fontWeight: 600, color: "#0D2B4E" }}>
                Your medications
              </span>
            </div>
            <div style={{ marginLeft: 34, display: "flex", flexDirection: "column", gap: 8 }}>
              {(() => {
                const meds = parseMedicationLines(sections["Your medications"]);
                if (meds.length === 0) {
                  return (
                    <div style={{ fontSize: 14, color: "#1E293B", lineHeight: 1.6 }}>
                      {renderWithDividers(sections["Your medications"], "#0B6E6E", "1.5px", "16px 0", 0.6)}
                    </div>
                  );
                }
                return meds.map((med, idx) => (
                  <div
                    key={idx}
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
                ));
              })()}
            </div>
          </div>
        )}

        {sections["Important home care instructions"] && (
          <div style={sectionStyle}>
            <div style={sectionHeadingStyle}>
              <SectionBadge num="4" />
              <span style={{ fontSize: 15, fontWeight: 600, color: "#0D2B4E" }}>
                Important home care instructions
              </span>
            </div>
            <div style={{ marginLeft: 34 }}>
              {(() => {
                const text = sections["Important home care instructions"];
                const hasBreaks = text.includes("\n");
                if (hasBreaks) {
                  const bullets = text.split("\n").filter((l) => l.trim() && !/^─{10,}$/.test(l.trim()));
                  if (bullets.length === 0) {
                    return null;
                  }
                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {bullets.map((b, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 14, color: "#1E293B", lineHeight: 1.6 }}>
                          <span style={{ color: "#0B6E6E", fontSize: 18, lineHeight: 1.4 }}>•</span>
                          <span>{b.replace(/^[-•*]\s*/, "")}</span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return (
                  <div style={{ fontSize: 14, color: "#1E293B", lineHeight: 1.6 }}>
                    {renderWithDividers(text, "#E2E8F0", "1.5px", "16px 0", 0.6)}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {sections["When to return to the hospital"] && (
          <div style={{ ...sectionStyle }}>
            <div
              style={{
                background: "#FFF8E1",
                borderLeft: "4px solid #B45309",
                padding: 16,
                borderRadius: 6,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <SectionBadge num="5" />
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 15, fontWeight: 700, color: "#B45309" }}>
                  <span role="img" aria-label="warning">⚠</span>
                  When to return to the hospital
                </span>
              </div>
              <div style={{ fontSize: 14, color: "#1E293B", lineHeight: 1.7, marginLeft: 0 }}>
                {renderWithDividers(sections["When to return to the hospital"], "#0B6E6E", "1.5px", "16px 0", 0.6)}
              </div>
            </div>
          </div>
        )}

        {sections["Your follow-up appointment"] && (
          <div style={sectionStyle}>
            <div
              style={{
                background: "#E0F2F2",
                borderLeft: "3px solid #0B6E6E",
                padding: 16,
                borderRadius: 6,
              }}
            >
              <div style={sectionHeadingStyle}>
                <SectionBadge num="6" />
                <span style={{ fontSize: 15, fontWeight: 600, color: "#0D2B4E" }}>
                  Your follow-up appointment
                </span>
              </div>
              <div style={{ fontSize: 14, color: "#1E293B", lineHeight: 1.6, marginLeft: 0 }}>
                {renderWithDividers(sections["Your follow-up appointment"], "#0B6E6E", "1.5px", "16px 0", 0.6)}
              </div>
            </div>
          </div>
        )}
      </div>
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
      {hasSections ? (
        renderParsedContent()
      ) : (
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 14, color: "#1E293B", lineHeight: 1.6, overflowWrap: "break-word", wordBreak: "break-word" }}>
            {renderWithDividers(content, "#0B6E6E", "1.5px", "16px 0", 0.6)}
          </div>
        </div>
      )}
    </div>
  );
}
