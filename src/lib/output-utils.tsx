"use client";

import { useState, useCallback } from "react";

export const SEPARATOR_RE = /[─━—–\-]{10,}/;

export function parseSections(text: string, headers: string[]): Record<string, string> {
  const sections: Record<string, string> = {};
  let remaining = text;

  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    const idx = remaining.indexOf(header);
    if (idx === -1) continue;

    const start = idx + header.length;
    const nextHeaders = headers.slice(i + 1);
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

export function parseMedicationLines(text: string): Array<{ name: string; dosage: string; frequency: string; timing: string; duration: string; notes: string }> {
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

export function renderWithDividers(
  text: string,
  dividerColor = "#E2E8F0",
  borderTopWidth = "1px",
  margin = "12px 0",
  opacity?: number,
): React.ReactNode[] {
  const parts = text.split(SEPARATOR_RE);
  const nodes: React.ReactNode[] = [];
  parts.forEach((part, i) => {
    const trimmed = part.trim();
    if (trimmed) {
      if (nodes.length > 0) {
        nodes.push(<br key={`br-${i}`} />);
      }
      nodes.push(<span key={`t-${i}`}>{trimmed}</span>);
    }
    if (i < parts.length - 1) {
      nodes.push(
        <hr
          key={`hr-${i}`}
          style={{
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
            border: "none",
            borderTop: `${borderTopWidth} solid ${dividerColor}`,
            margin,
            ...(opacity !== undefined ? { opacity } : {}),
          }}
        />,
      );
    }
  });
  return nodes.length > 0 ? nodes : [text];
}

export function SectionBadge({ num }: { num: string }) {
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

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Copy ${label}`}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: 12,
        color: "#64748B",
        padding: "4px 8px",
        borderRadius: 4,
        minWidth: 44,
        minHeight: 44,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
      }}
    >
      {copied ? (
        <span style={{ color: "#0B6E6E", fontWeight: 500 }}>Copied</span>
      ) : (
        <span role="img" aria-label="copy">📋</span>
      )}
    </button>
  );
}
