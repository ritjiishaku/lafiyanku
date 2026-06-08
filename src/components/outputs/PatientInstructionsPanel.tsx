"use client";

import { MessageCircle } from "lucide-react";
import { parseSections, parseMedicationLines, renderWithDividers, SectionBadge } from "@/lib/output-utils";

const PATIENT_HEADERS = [
  "What happened",
  "Treatment you received",
  "Your medications",
  "Important home care instructions",
  "When to return to the hospital",
  "Your follow-up appointment",
];

function formatWhatsAppText(patientFriendlyOutput: string): string {
  const stripped = patientFriendlyOutput.replace(/─{2,}/g, "").trim();
  const lines = stripped.split("\n").filter((l) => l.trim());
  const formatted: string[] = [];
  let inTable = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      if (!inTable) inTable = true;
      continue;
    }
    if (inTable && !trimmed.startsWith("|")) inTable = false;
    if (inTable) continue;
    formatted.push(trimmed);
  }

  let text = formatted.join("\n");
  const maxLen = 1500;

  if (text.length > maxLen) {
    const breakpoints = [
      "When to return to the hospital",
      "Your follow-up appointment",
      "Important home care instructions",
      "Your medications",
    ];
    for (const bp of breakpoints) {
      const idx = text.indexOf(bp);
      if (idx !== -1 && idx + bp.length + 200 < maxLen) {
        text = text.slice(0, maxLen - 30) + "\n\n... continued in full print version.";
        break;
      }
    }
    if (text.length > maxLen) {
      text = text.slice(0, maxLen - 30) + "\n\n... continued in full print version.";
    }
  }

  return text;
}

interface PatientInstructionsPanelProps {
  content: string;
  patientName?: string;
  facilityName?: string;
  dischargeDate?: string;
  clinicianName?: string;
  translatedOutput?: string | null;
  translationLanguage?: string | null;
  translationConfidence?: string | null;
  isFinalised?: boolean;
}

export function PatientInstructionsPanel({
  content,
  patientFriendlyOutput,
  isFinalised,
}: PatientInstructionsPanelProps & { patientFriendlyOutput?: string; isFinalised?: boolean }) {
  const sections = parseSections(content, PATIENT_HEADERS);
  const hasSections = Object.keys(sections).length > 1;
  const effectiveContent = patientFriendlyOutput ?? content;

  const sectionStyle: React.CSSProperties = {
    marginBottom: 20,
  };

  const sectionHeadingStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  };

  if (!hasSections) {
    return (
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
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
              Patient Discharge Instructions
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                background: "#B45309",
                color: "#FFFFFF",
                padding: "2px 8px",
                borderRadius: 9999,
              }}
            >
              MODE 2
            </span>
          </div>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 14, color: "#1E293B", lineHeight: 1.6, overflowWrap: "break-word", wordBreak: "break-word" }}>
            {renderWithDividers(content)}
          </div>
        </div>
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
            Patient Discharge Instructions
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              background: "#B45309",
              color: "#FFFFFF",
              padding: "2px 8px",
              borderRadius: 9999,
            }}
          >
            MODE 2
          </span>
        </div>
      </div>

      <div style={{ padding: "16px 20px", overflowWrap: "break-word", wordBreak: "break-word" }}>

        {sections["What happened"] && (
          <div style={sectionStyle}>
            <div style={sectionHeadingStyle}>
              <SectionBadge num="1" />
              <span style={{ fontSize: 15, fontWeight: 600, color: "#0D2B4E" }}>
                What happened
              </span>
            </div>
            <div style={{ fontSize: 15, color: "#1E293B", lineHeight: 1.7, marginLeft: 34 }}>
              {renderWithDividers(sections["What happened"])}
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
              {renderWithDividers(sections["Treatment you received"])}
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
                      {renderWithDividers(sections["Your medications"])}
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
                    {renderWithDividers(text)}
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
                {renderWithDividers(sections["When to return to the hospital"])}
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
                {renderWithDividers(sections["Your follow-up appointment"])}
              </div>
            </div>
          </div>
        )}

      </div>

      {isFinalised && effectiveContent && (
        <div
          style={{
            borderTop: "1px solid #E2E8F0",
            padding: "16px 20px",
          }}
        >
          <button
            type="button"
            onClick={() => {
              const msg = formatWhatsAppText(effectiveContent);
              const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
              if (isMobile) {
                window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
              } else {
                navigator.clipboard.writeText(msg);
              }
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              width: "100%",
              height: 44,
              minHeight: 44,
              background: "#25D366",
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: 14,
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            <MessageCircle size={18} />
            Share via WhatsApp
          </button>
        </div>
      )}
    </div>
  );
}
