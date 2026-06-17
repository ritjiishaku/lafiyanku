"use client";

type OutputMode = "clinical" | "patient" | "translated";

interface DischargeOutputProps {
  text: string;
  mode: OutputMode;
}

const SEPARATOR = "──────────────────────────────────────────";

function parseOutput(text: string): {
  title: string;
  sections: { heading: string; lines: string[] }[];
} {
  const lines = text.split("\n").filter((l) => l.trim() !== SEPARATOR.trim());

  let title = "";
  const sections: { heading: string; lines: string[] }[] = [];
  let currentSection: { heading: string; lines: string[] } | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines and separator remnants
    if (!trimmed || trimmed === SEPARATOR) continue;

    // Detect title (first non-empty line that's all caps or matches known titles)
    if (
      !title &&
      (trimmed === trimmed.toUpperCase() || trimmed.includes("DISCHARGE"))
    ) {
      title = trimmed;
      continue;
    }

    // Detect section heading: a line that's short, not a key-value pair, not a bullet
    const isKeyValue = /^[A-Z][\w\s]*:\s/.test(trimmed) || trimmed.startsWith("- ");
    const isBullet = trimmed.startsWith("- ");
    const isTable = trimmed.startsWith("|");

    if (!isKeyValue && !isBullet && !isTable && trimmed.length < 60 && !trimmed.includes(":")) {
      // This looks like a section heading
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = { heading: trimmed, lines: [] };
    } else if (currentSection) {
      currentSection.lines.push(trimmed);
    } else {
      // Lines before any section — create a default section
      currentSection = { heading: "", lines: [trimmed] };
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return { title, sections };
}

function ClinicalSection({ heading, lines }: { heading: string; lines: string[] }) {
  return (
    <div className="space-y-2">
      {heading && (
        <h4 className="text-xs font-bold uppercase tracking-wider text-clinical-teal mt-4 first:mt-0">
          {heading}
        </h4>
      )}
      <div className="space-y-1">
        {lines.map((line, i) => {
          const trimmed = line.trim();

          // Table separator line
          if (/^\|[-\s|]+\|$/.test(trimmed)) return null;

          // Table row
          if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
            const cells = trimmed
              .split("|")
              .filter((c) => c.trim() !== "")
              .map((c) => c.trim());

            // Check if this is a header row (contains "Medication" or "Dosage")
            if (cells.some((c) => /medication|dosage|frequency/i.test(c))) {
              return (
                <div key={i} className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] font-bold text-clinical-teal border-b border-slate-100 pb-1">
                  {cells.map((cell, j) => (
                    <span key={j} className="min-w-[60px]">{cell}</span>
                  ))}
                </div>
              );
            }

            return (
              <div key={i} className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-700 py-0.5">
                {cells.map((cell, j) => (
                  <span key={j} className="min-w-[60px]">{cell}</span>
                ))}
              </div>
            );
          }

          // Key-value pair
          const kvMatch = trimmed.match(/^([\w\s./]+?):\s*(.+)$/);
          if (kvMatch) {
            const [, key, value] = kvMatch;
            return (
              <div key={i} className="flex flex-col sm:flex-row sm:gap-2 text-xs leading-relaxed">
                <span className="font-semibold text-slate-500 sm:min-w-[140px] sm:flex-shrink-0">{key}:</span>
                <span className="text-slate-800">{value}</span>
              </div>
            );
          }

          // Bullet point
          if (trimmed.startsWith("- ")) {
            return (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed pl-1">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-clinical-teal flex-shrink-0" />
                <span>{trimmed.slice(2)}</span>
              </div>
            );
          }

          // Red flag warning (contains ⚠ or "Red Flag")
          if (trimmed.toLowerCase().includes("red flag") || trimmed.includes("⚠")) {
            return (
              <div key={i} className="flex items-start gap-2 text-xs font-semibold text-red-600 leading-relaxed bg-red-50 rounded-lg px-3 py-2 mt-1">
                <span className="mt-0.5">⚠</span>
                <span>{trimmed.replace(/^⚠\s*/, "")}</span>
              </div>
            );
          }

          // Regular text
          return (
            <p key={i} className="text-xs text-slate-700 leading-relaxed">
              {trimmed}
            </p>
          );
        })}
      </div>
    </div>
  );
}

function PatientSection({ heading, lines }: { heading: string; lines: string[] }) {
  return (
    <div className="space-y-2">
      {heading && (
        <h4 className="text-sm font-bold text-deep-navy mt-5 first:mt-0">
          {heading}
        </h4>
      )}
      <div className="space-y-1">
        {lines.map((line, i) => {
          const trimmed = line.trim();

          // Bullet point
          if (trimmed.startsWith("- ")) {
            return (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                <span>{trimmed.slice(2)}</span>
              </div>
            );
          }

          // Paragraph text
          return (
            <p key={i} className="text-sm text-slate-700 leading-relaxed">
              {trimmed}
            </p>
          );
        })}
      </div>
    </div>
  );
}

export function DischargeOutput({ text, mode }: DischargeOutputProps) {
  const { title, sections } = parseOutput(text);

  const isClinical = mode === "clinical";

  return (
    <div className="space-y-1">
      {title && (
        <div className={`text-center py-3 border-b ${isClinical ? "border-slate-200" : "border-amber-100"}`}>
          <h3 className={`text-xs font-bold uppercase tracking-widest ${isClinical ? "text-clinical-teal" : "text-amber-600"}`}>
            {title}
          </h3>
        </div>
      )}
      <div className="py-4 space-y-1">
        {sections.map((section, i) =>
          isClinical ? (
            <ClinicalSection key={i} heading={section.heading} lines={section.lines} />
          ) : (
            <PatientSection key={i} heading={section.heading} lines={section.lines} />
          ),
        )}
      </div>
    </div>
  );
}
