"use client";

import { useEffect, useState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { ClinicalSummaryPanel } from "@/components/outputs/ClinicalSummaryPanel";
import { PatientInstructionsPanel } from "@/components/outputs/PatientInstructionsPanel";
import { TranslationPanel } from "@/components/outputs/TranslationPanel";
import { FlaggedIssuesBanner } from "@/components/outputs/FlaggedIssuesBanner";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { PrintButton } from "@/components/shared/PrintButton";
import { WhatsAppShareButton } from "@/components/shared/WhatsAppShareButton";
import { useRole } from "@/hooks/useRole";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Edit, Save, X, CheckCircle, Archive } from "lucide-react";
import { toast } from "sonner";

interface DischargeRecordData {
  recordId: string;
  clinicalSummary: string;
  patientFriendlyOutput: string;
  translatedOutput?: string | null;
  translationLanguage?: string | null;
  translationConfidence?: string | null;
  missingFieldsLog?: string[] | null;
  flaggedIssues?: string[] | null;
  status: string;
  patientName: string;
  facilityName: string;
  dischargeDate: string;
  dischargedBy: string;
}

interface DischargeOutputViewProps {
  id: string;
}

export function DischargeOutputView({ id }: DischargeOutputViewProps) {
  const { role, userId } = useRole();
  const [record, setRecord] = useState<DischargeRecordData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editClinical, setEditClinical] = useState("");
  const [editPatient, setEditPatient] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"finalise" | "archive" | "unarchive" | null>(null);
  const [translating, setTranslating] = useState(false);
  const [translateLang, setTranslateLang] = useState<string>("");
  const [activeMode, setActiveMode] = useState<"clinical" | "patient">("patient");
  const translateAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    document.title = "Lafiyanku — Discharge Output";
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    async function fetchRecord() {
      try {
        const res = await fetch(`/api/discharge/${id}`, { signal: controller.signal });
        const json = await res.json();
        if (json.success) {
          const d = json.data;
          const pi = d.patient_input;
          const name = pi?.patient_name ?? "";
          setRecord({
            recordId: d.record_id,
            clinicalSummary: d.clinical_summary,
            patientFriendlyOutput: d.patient_friendly_output,
            translatedOutput: d.translated_output,
            translationLanguage: d.translation_language,
            translationConfidence: d.translation_confidence,
            missingFieldsLog: d.missing_fields_log,
            flaggedIssues: d.flagged_issues,
            status: d.status,
            patientName: name,
            facilityName: pi?.facility_name ?? "",
            dischargeDate: pi?.discharge_date ?? "",
            dischargedBy: pi?.discharged_by ?? "",
          });
          if (name) document.title = `Lafiyanku — ${name}`;
          setEditClinical(d.clinical_summary);
          setEditPatient(d.patient_friendly_output);
        } else {
          setError("Record not found");
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError("Failed to load record");
      } finally {
        setLoading(false);
      }
    }
    fetchRecord();
    return () => controller.abort();
  }, [id]);

  async function handleSave() {
    if (!record) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/discharge/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinicalSummary: editClinical, patientFriendlyOutput: editPatient, editedByUserId: userId }),
      });
      const json = await res.json();
      if (json.success) {
        setRecord((prev) => prev ? { ...prev, clinicalSummary: editClinical, patientFriendlyOutput: editPatient } : prev);
        setIsEditing(false);
        toast.success("Changes saved");
      } else {
        toast.error(json.error?.message ?? "Failed to save changes");
      }
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (record) { setEditClinical(record.clinicalSummary); setEditPatient(record.patientFriendlyOutput); }
    setIsEditing(false);
  }

  async function handleFinalise() {
    if (!record) return;
    try {
      const res = await fetch(`/api/discharge/${record.recordId}/finalise`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, userRole: role }) });
      const json = await res.json();
      if (json.success) { setRecord((prev) => prev ? { ...prev, status: "finalised" } : prev); toast.success("Record finalised"); }
      else { toast.error(json.error?.message ?? "Failed to finalise"); }
    } catch {
      toast.error("Failed to finalise record");
    } finally {
      setConfirmOpen(false); setConfirmAction(null);
    }
  }

  async function handleArchive() {
    if (!record) return;
    try {
      const res = await fetch(`/api/discharge/${record.recordId}/archive`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, userRole: role }) });
      const json = await res.json();
      if (json.success) { setRecord((prev) => prev ? { ...prev, status: "archived" } : prev); toast.success("Record archived"); }
      else { toast.error(json.error?.message ?? "Failed to archive"); }
    } catch {
      toast.error("Failed to archive record");
    } finally {
      setConfirmOpen(false); setConfirmAction(null);
    }
  }

  async function handleUnarchive() {
    if (!record) return;
    try {
      const res = await fetch(`/api/discharge/${record.recordId}/unarchive`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, userRole: role }) });
      const json = await res.json();
      if (json.success) { setRecord((prev) => prev ? { ...prev, status: "draft" } : prev); toast.success("Record unarchived"); }
      else { toast.error(json.error?.message ?? "Failed to unarchive"); }
    } catch {
      toast.error("Failed to unarchive record");
    } finally {
      setConfirmOpen(false); setConfirmAction(null);
    }
  }

  async function handleTranslate(lang?: string) {
    if (!record) return;
    const targetLang = lang ?? translateLang;
    if (!targetLang) return;

    // Abort any in-flight translation
    translateAbortRef.current?.abort();
    const controller = new AbortController();
    translateAbortRef.current = controller;

    setTranslating(true);
    try {
      const res = await fetch("/api/translation/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recordId: record.recordId, targetLanguage: targetLang, userId, userRole: role }), signal: controller.signal });
      const json = await res.json();
      if (json.success) {
        setRecord((prev) => prev ? { ...prev, translatedOutput: json.data.translatedOutput, translationLanguage: json.data.translationLanguage, translationConfidence: json.data.confidence } : prev);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      toast.error("Translation request failed");
    } finally {
      if (!controller.signal.aborted) setTranslating(false);
    }
  }

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><LoadingSpinner /></div>;
  if (error || !record) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-cool-grey">{error ?? "Record not found"}</p>
    </div>
  );

  const canEdit = role === "doctor" || role === "nurse";
  const canSeeClinical = role === "doctor" || role === "nurse";

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 pb-4 sm:p-6 sm:pb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-deep-navy sm:text-2xl">Discharge Output</h1>
            <StatusBadge status={record.status as "draft" | "finalised" | "archived"} size="lg" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {record.status !== "archived" && canEdit && !isEditing && (
            <Button variant="outline" size="sm" className="touch-target-min" onClick={() => setIsEditing(true)}><Edit className="mr-1 h-4 w-4" />Edit</Button>
          )}
          {record.status === "draft" && role === "doctor" && (
            <Button size="sm" className="touch-target-min" onClick={() => { setConfirmAction("finalise"); setConfirmOpen(true); }}>
              <CheckCircle className="mr-1 h-4 w-4" />Finalise
            </Button>
          )}
          {isEditing && (
            <>
              <Button variant="outline" size="sm" className="touch-target-min" onClick={handleCancel} disabled={saving}><X className="mr-1 h-4 w-4" />Cancel</Button>
              <Button size="sm" className="touch-target-min" onClick={handleSave} disabled={saving}><Save className="mr-1 h-4 w-4" />{saving ? "Saving..." : "Save"}</Button>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {record.status === "finalised" && (
          <>
            <PrintButton patientName={record.patientName} facilityName={record.facilityName} dischargeDate={record.dischargeDate} clinicianName={record.dischargedBy} patientFriendlyOutput={record.patientFriendlyOutput} translatedOutput={record.translatedOutput} translationLanguage={record.translationLanguage} translationConfidence={record.translationConfidence} />
            <WhatsAppShareButton patientFriendlyOutput={record.patientFriendlyOutput} />
          </>
        )}
        {record.status !== "archived" && (role === "doctor" || role === "admin") && (
          <Button variant="outline" size="sm" className="touch-target-min shrink-0 text-red-500" onClick={() => { setConfirmAction("archive"); setConfirmOpen(true); }}>
            <Archive className="mr-1 h-4 w-4" />Archive
          </Button>
        )}
        {record.status === "archived" && (role === "doctor" || role === "admin") && (
          <Button variant="outline" size="sm" className="touch-target-min shrink-0" onClick={() => { setConfirmAction("unarchive"); setConfirmOpen(true); }}>
            <Archive className="mr-1 h-4 w-4" />Unarchive
          </Button>
        )}
      </div>

      {record.flaggedIssues && record.flaggedIssues.length > 0 && (
        <div className="sticky top-0 z-10">
          <FlaggedIssuesBanner issues={record.flaggedIssues} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate/20 bg-white p-3 sm:p-4">
        <span className="text-xs font-medium text-slate sm:text-sm">Translate to:</span>
        <div className="flex flex-wrap items-center gap-1.5">
          {(["ha", "yo", "ig"] as const).map((lang) => {
            const label = lang === "ha" ? "Hausa" : lang === "yo" ? "Yoruba" : "Igbo";
            const isActive = record.translationLanguage === lang;
            const isPending = translateLang === lang && !record.translationLanguage;
            return (
              <button
                key={lang}
                type="button"
                onClick={() => {
                  setTranslateLang(lang);
                  handleTranslate(lang);
                }}
                disabled={translating}
                className={`touch-target-min inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
                  translating && isPending
                    ? "animate-pulse bg-clinical-teal/20 text-clinical-teal"
                    : isActive
                    ? record.translationConfidence === "low" || record.translationConfidence === "failed"
                      ? "bg-warm-amber/10 text-warm-amber"
                      : "bg-clinical-teal/10 text-clinical-teal"
                    : "bg-slate/10 text-slate hover:bg-slate/20"
                }`}
              >
                {label}
                {isActive && record.translationConfidence === "low" && (
                  <span className="text-[9px] opacity-70 sm:text-[10px]">(low)</span>
                )}
                {isActive && record.translationConfidence === "failed" && (
                  <span className="text-[9px] opacity-70 sm:text-[10px]">(failed)</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex rounded-lg border border-slate/20 bg-cool-off-white p-1" role="tablist" aria-label="Output view mode">
        {canSeeClinical && (
          <button
            type="button"
            role="tab"
            aria-selected={activeMode === "clinical"}
            aria-controls="panel-clinical"
            id="tab-clinical"
            onClick={() => setActiveMode("clinical")}
            className={`flex-1 rounded-md px-2 py-2 text-xs font-medium transition-colors sm:px-4 sm:py-2.5 sm:text-sm ${
              activeMode === "clinical"
                ? "bg-clinical-teal text-white shadow-sm"
                : "bg-transparent text-slate hover:text-deep-navy"
            }`}
          >
            <span className="flex flex-col items-center gap-0.5 sm:flex-row sm:gap-2">
              <span className="leading-tight sm:leading-normal">Clinical Summary</span>
              <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider sm:px-2 sm:text-[10px] ${
                activeMode === "clinical"
                  ? "bg-white/20 text-white"
                  : "bg-clinical-teal/10 text-clinical-teal"
              }`}>
                MODE 1
              </span>
            </span>
          </button>
        )}
        <button
          type="button"
          role="tab"
          aria-selected={activeMode === "patient"}
          aria-controls="panel-patient"
          id="tab-patient"
          onClick={() => setActiveMode("patient")}
          className={`flex-1 rounded-md px-2 py-2 text-xs font-medium transition-colors sm:px-4 sm:py-2.5 sm:text-sm ${
            activeMode === "patient"
              ? "bg-clinical-teal text-white shadow-sm"
              : "bg-transparent text-slate hover:text-deep-navy"
          }`}
        >
          <span className="flex flex-col items-center gap-0.5 sm:flex-row sm:gap-2">
            <span className="leading-tight sm:leading-normal">Patient Instructions</span>
            <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider sm:px-2 sm:text-[10px] ${
              activeMode === "patient"
                ? "bg-white/20 text-white"
                : "bg-warm-amber/10 text-warm-amber"
            }`}>
              MODE 2
            </span>
          </span>
        </button>
      </div>

      {activeMode === "clinical" && canSeeClinical && (
        <div role="tabpanel" id="panel-clinical" aria-labelledby="tab-clinical">
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg border-2 border-warm-amber bg-warm-amber/5 p-2">
                <span className="text-xs text-slate">
                  Words: {editClinical.split(/\s+/).filter(Boolean).length} · Characters: {editClinical.length}
                </span>
              </div>
              <textarea aria-label="Edit clinical summary" className="min-h-[500px] w-full rounded-lg border border-input bg-transparent p-4 font-mono text-sm" value={editClinical} onChange={(e) => setEditClinical(e.target.value)} />
            </div>
          ) : (
            <ClinicalSummaryPanel content={record.clinicalSummary} missingFieldsLog={record.missingFieldsLog} />
          )}
        </div>
      )}

      {activeMode === "patient" && (
        <div role="tabpanel" id="panel-patient" aria-labelledby="tab-patient" className="space-y-6">
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg border-2 border-warm-amber bg-warm-amber/5 p-2">
                <span className="text-xs text-slate">
                  Words: {editPatient.split(/\s+/).filter(Boolean).length} · Characters: {editPatient.length}
                </span>
              </div>
              <textarea aria-label="Edit patient instructions" className="min-h-[400px] w-full rounded-lg border border-input bg-transparent p-4 font-mono text-sm" value={editPatient} onChange={(e) => setEditPatient(e.target.value)} />
            </div>
          ) : (
            <PatientInstructionsPanel content={record.patientFriendlyOutput} />
          )}
          {record.translatedOutput && (
            <TranslationPanel
              content={record.translatedOutput}
              language={record.translationLanguage ?? null}
              confidence={record.translationConfidence ?? null}
              onRetranslate={record.translationLanguage ? () => handleTranslate(record.translationLanguage!) : undefined}
            />
          )}
        </div>
      )}

      <ConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmAction === "finalise" ? "Finalise discharge record?" : confirmAction === "archive" ? "Archive this record?" : "Unarchive this record?"}
        description={confirmAction === "finalise" ? "This will lock the record as final and available for export. Only a Doctor can unfinalise it." : confirmAction === "archive" ? "The record will be archived. The patient-friendly instructions will still be accessible." : "This will return the record to draft status and move it back to the active list."}
        confirmLabel={confirmAction === "finalise" ? "Finalise" : confirmAction === "archive" ? "Archive" : "Unarchive"}
        variant={confirmAction === "finalise" ? "primary" : confirmAction === "archive" ? "warning" : "primary"}
        onConfirm={confirmAction === "finalise" ? handleFinalise : confirmAction === "archive" ? handleArchive : handleUnarchive}
      />
    </div>
  );
}
