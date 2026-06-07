"use client";

import { MessageCircle } from "lucide-react";

const PATIENT_HEADERS = [
  "What happened",
  "Treatment you received",
  "Your medications",
  "Important home care instructions",
  "When to return to the hospital",
  "Your follow-up appointment",
];

function parseSections(text: string): Record<string, string> {
  const sections: Record<string, string> = {};
  let remaining = text;

  for (let i = 0; i < PATIENT_HEADERS.length; i++) {
    const header = PATIENT_HEADERS[i];
    const idx = remaining.indexOf(header);
    if (idx === -1) continue;

    const start = idx + header.length;
    const nextHeaders = PATIENT_HEADERS.slice(i + 1);
    let end = remaining.length;
    for (const nh of nextHeaders) {
      const ni = remaining.indexOf(nh, start);
      if (ni !== -1) {
        end = ni;
        break;
      }
    }

    sections[header] = remaining.slice(start, end).trim();
    remaining = remaining.slice(0, idx) + remaining.slice(end);
  }

  return sections;
}

function parseMedicationLines(text: string): Array<{ name: string; dosage: string; frequency: string; timing: string; duration: string; notes: string }> {
  const lines = text.split("\n").filter((l) => l.trim());
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
        if (current) {
          meds.push(current);
        }
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

  if (current) {
    meds.push(current);
  }

  if (meds.length === 0) {
    const firstLine = lines[0]?.trim() ?? "";
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

function SectionBadge({ num }: { num: string }) {
  return (
    <div
      style={{
        width: 24,
        height: 24,
        borderRadius: "50%",
        background: "#0B6E6E",
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {num}
    </div>
  );
}

export function PatientInstructionsPanel({
  content,
  patientFriendlyOutput,
  isFinalised,
}: PatientInstructionsPanelProps & { patientFriendlyOutput?: string; isFinalised?: boolean }) {
  const sections = parseSections(content);
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
          <pre
            style={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontSize: 14,
              color: "#1E293B",
              whiteSpace: "pre-wrap",
              margin: 0,
            }}
          >
            {content}
          </pre>
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
              {sections["What happened"]}
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
              {sections["Treatment you received"]}
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
                      {sections["Your medications"]}
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
                  const bullets = text.split("\n").filter((l) => l.trim());
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
                    {text}
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
                {sections["When to return to the hospital"]}
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
                {sections["Your follow-up appointment"]}
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
