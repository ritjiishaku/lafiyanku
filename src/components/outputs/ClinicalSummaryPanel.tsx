"use client";

import { MissingFieldsBanner } from "./MissingFieldsBanner";
import { parseSections, renderWithDividers, CopyButton } from "@/lib/output-utils";

const CLINICAL_HEADERS = [
  "Facility",
  "Patient information",
  "Diagnosis",
  "Treatment provided",
  "Procedures performed",
  "Medications",
  "Follow-up instructions",
  "Red flag warnings",
  "Discharged by",
];

function parseKeyValue(text: string): Record<string, string> {
  const kv: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      const val = line.slice(colonIdx + 1).trim();
      if (key && val) kv[key] = val;
    }
  }
  return kv;
}

function parseMedicationTable(text: string): Array<Record<string, string>> {
  const lines = text.split("\n").filter((l) => l.trim());
  const rows: Array<Record<string, string>> = [];
  let headerFound = false;
  const cols = ["Medication", "Dosage", "Frequency", "Timing", "Duration", "Notes"];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) continue;
    const cells = trimmed.split("|").filter((c) => c.trim());
    if (!headerFound) {
      headerFound = true;
      continue;
    }
    if (cells.length < 2) continue;
    const isSeparator = cells.every((c) => /^[-]+$/.test(c.trim()));
    if (isSeparator) continue;

    const row: Record<string, string> = {};
    cols.forEach((col, i) => {
      row[col] = (cells[i] ?? "").trim();
    });
    rows.push(row);
  }

  return rows;
}

interface ClinicalSummaryPanelProps {
  content: string;
  missingFieldsLog?: string[] | null;
}

export function ClinicalSummaryPanel({ content, missingFieldsLog }: ClinicalSummaryPanelProps) {
  const sections = parseSections(content, CLINICAL_HEADERS);
  const hasSections = Object.keys(sections).length > 1;

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
              Clinical Discharge Summary
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                background: "#0B6E6E",
                color: "#FFFFFF",
                padding: "2px 8px",
                borderRadius: 9999,
              }}
            >
              MODE 1
            </span>
          </div>
        </div>
        {missingFieldsLog && missingFieldsLog.length > 0 && (
          <div style={{ padding: "8px 20px" }}>
            <MissingFieldsBanner fields={missingFieldsLog} />
          </div>
        )}
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 14, color: "#1E293B", lineHeight: 1.6, overflowWrap: "break-word", wordBreak: "break-word" }}>
            {renderWithDividers(content)}
          </div>
        </div>
      </div>
    );
  }

  const facilityKv = sections["Facility"] ? parseKeyValue(sections["Facility"]) : {};
  const patientKv = sections["Patient information"] ? parseKeyValue(sections["Patient information"]) : {};
  const medications = sections["Medications"] ? parseMedicationTable(sections["Medications"]) : [];

  function renderSection(name: string, children: React.ReactNode, heading?: React.ReactNode, style?: React.CSSProperties) {
    const sectionText = sections[name] ?? "";
    return (
      <div style={{ ...style }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, minHeight: 28 }}>
          {heading !== undefined ? (
            heading
          ) : (
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#4B5E73" }}>
              {name}
            </div>
          )}
          <CopyButton text={sectionText} label={name} />
        </div>
        {children}
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
            Clinical Discharge Summary
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              background: "#0B6E6E",
              color: "#FFFFFF",
              padding: "2px 8px",
              borderRadius: 9999,
            }}
          >
            MODE 1
          </span>
        </div>
      </div>

      {missingFieldsLog && missingFieldsLog.length > 0 && (
        <div style={{ padding: "8px 20px" }}>
          <MissingFieldsBanner fields={missingFieldsLog} />
        </div>
      )}

      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 20 }}>

        {sections["Facility"] && (
          renderSection("Facility",
            <div>
              <div className="space-y-1 sm:grid sm:grid-cols-[auto_1fr] sm:gap-x-6 sm:gap-y-1">
                {Object.entries(facilityKv).map(([k, v]) => (
                  <div key={k} className="contents">
                    <span className="text-[13px] text-cool-grey">{k}</span>
                    <span className="text-sm text-foreground">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {sections["Patient information"] && (
          renderSection("Patient information",
            <div>
              <div className="space-y-1 sm:grid sm:grid-cols-[auto_1fr] sm:gap-x-6 sm:gap-y-1">
                {Object.entries(patientKv).map(([k, v]) => (
                  <div key={k} className="contents">
                    <span className="text-[13px] text-cool-grey">{k}</span>
                    <span className="text-sm text-foreground">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {sections["Diagnosis"] && (
          renderSection("Diagnosis",
            <div
              style={{
                borderLeft: "3px solid #0B6E6E",
                paddingLeft: 16,
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 600, color: "#0D2B4E", marginBottom: 4, lineHeight: 1.5 }}>
                {renderWithDividers(sections["Diagnosis"])}
              </div>
            </div>
          )
        )}

        {(sections["Treatment provided"] || sections["Procedures performed"]) && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sections["Treatment provided"] && (
              renderSection("Treatment provided",
                <div style={{ fontSize: 14, color: "#1E293B", lineHeight: 1.6 }}>
                  {renderWithDividers(sections["Treatment provided"])}
                </div>
              )
            )}
            {sections["Procedures performed"] && (
              renderSection("Procedures performed",
                <div style={{ fontSize: 14, color: "#1E293B", lineHeight: 1.6 }}>
                  {renderWithDividers(sections["Procedures performed"])}
                </div>
              )
            )}
          </div>
        )}

        {medications.length > 0 && (
          renderSection("Medications",
            <div>
              {/* Mobile: stacked cards */}
              <div className="sm:hidden space-y-3">
                {medications.map((med, idx) => (
                  <div key={idx} className="rounded-lg border border-slate-200 bg-cool-off-white p-3">
                    <div className="text-sm font-semibold text-foreground mb-2">{med.Medication}</div>
                    <div className="space-y-1 text-xs">
                      {med.Dosage && <div><span className="font-medium text-cool-grey">Dosage:</span> <span className="text-foreground">{med.Dosage}</span></div>}
                      {med.Frequency && <div><span className="font-medium text-cool-grey">Frequency:</span> <span className="text-foreground">{med.Frequency}</span></div>}
                      {med.Timing && <div><span className="font-medium text-cool-grey">Timing:</span> <span className="text-foreground">{med.Timing}</span></div>}
                      {med.Duration && <div><span className="font-medium text-cool-grey">Duration:</span> <span className="text-foreground">{med.Duration}</span></div>}
                      {med.Notes && <div><span className="font-medium text-cool-grey">Notes:</span> <span className="text-foreground">{med.Notes}</span></div>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: table */}
              <div className="hidden sm:block rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="bg-deep-navy text-white">
                      <th className="text-left px-3 py-2 font-semibold">Medication</th>
                      <th className="text-left px-3 py-2 font-semibold">Dosage</th>
                      <th className="text-left px-3 py-2 font-semibold">Frequency</th>
                      <th className="text-left px-3 py-2 font-semibold">Timing</th>
                      <th className="text-left px-3 py-2 font-semibold">Duration</th>
                      <th className="text-left px-3 py-2 font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medications.map((med, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-cool-off-white"}>
                        <td className="px-3 py-2 font-semibold text-foreground">{med.Medication}</td>
                        <td className="px-3 py-2 text-cool-grey">{med.Dosage}</td>
                        <td className="px-3 py-2 text-cool-grey">{med.Frequency}</td>
                        <td className="px-3 py-2 text-cool-grey">{med.Timing}</td>
                        <td className="px-3 py-2 text-cool-grey">{med.Duration}</td>
                        <td className="px-3 py-2 text-cool-grey">{med.Notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {sections["Follow-up instructions"] && (
          renderSection("Follow-up instructions",
            <div
              style={{
                borderLeft: "3px solid #0B6E6E",
                background: "#E0F2F2",
                padding: 16,
                borderRadius: 6,
              }}
            >
              <div style={{ fontSize: 14, color: "#1E293B", lineHeight: 1.6 }}>
                {renderWithDividers(sections["Follow-up instructions"])}
              </div>
            </div>,
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#0B6E6E" }}>
              Follow-up instructions
            </div>
          )
        )}

        {sections["Red flag warnings"] && (
          renderSection("Red flag warnings",
            <div
              style={{
                background: "#FFF8E1",
                borderLeft: "4px solid #B45309",
                padding: 16,
                borderRadius: 6,
              }}
            >
              <div style={{ fontSize: 14, color: "#1E293B", lineHeight: 1.6 }}>
                {renderWithDividers(sections["Red flag warnings"])}
              </div>
            </div>,
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span role="img" aria-label="warning" style={{ fontSize: 18, color: "#B45309" }}>⚠</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#B45309" }}>
                Red flag warnings
              </span>
            </div>
          )
        )}

        {sections["Discharged by"] && (
          renderSection("Discharged by",
            <div
              style={{
                background: "#F8FAFC",
                borderTop: "1px solid #E2E8F0",
                padding: "12px 16px",
                borderRadius: 6,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: "#1E293B" }}>
                {(() => {
                  const kv = parseKeyValue(sections["Discharged by"]);
                  return kv["Name"] ?? sections["Discharged by"];
                })()}
              </div>
              {(() => {
                const kv = parseKeyValue(sections["Discharged by"]);
                if (kv["MDCN Licence No."]) {
                  return (
                    <div style={{ fontSize: 12, color: "#4B5E73", marginTop: 2 }}>
                      MDCN: {kv["MDCN Licence No."]}
                    </div>
                  );
                }
                const licenceMatch = sections["Discharged by"].match(/MDCN[:\s]+(.+)/i);
                if (licenceMatch) {
                  return (
                    <div style={{ fontSize: 12, color: "#4B5E73", marginTop: 2 }}>
                      MDCN: {licenceMatch[1].trim()}
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          )
        )}

      </div>
    </div>
  );
}
