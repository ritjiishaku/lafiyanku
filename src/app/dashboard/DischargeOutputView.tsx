"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { ClinicalSummaryPanel } from "@/components/outputs/ClinicalSummaryPanel";
import { PatientInstructionsPanel } from "@/components/outputs/PatientInstructionsPanel";
import { TranslationPanel } from "@/components/outputs/TranslationPanel";
import { MissingFieldsBanner } from "@/components/outputs/MissingFieldsBanner";
import { FlaggedIssuesBanner } from "@/components/outputs/FlaggedIssuesBanner";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { PrintButton } from "@/components/shared/PrintButton";
import { WhatsAppShareButton } from "@/components/shared/WhatsAppShareButton";
import { useRole } from "@/hooks/useRole";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Edit, Save, X, CheckCircle, Archive, ArrowLeft } from "lucide-react";
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
  onNavigate: (view: { name: string; id?: string }) => void;
}

export function DischargeOutputView({ id, onNavigate }: DischargeOutputViewProps) {
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
  const [translateLang, setTranslateLang] = useState<string>("");
  const [translating, setTranslating] = useState(false);
  const [activeMode, setActiveMode] = useState<"clinical" | "patient">("patient");

  useEffect(() => {
    document.title = "CareFlow — Discharge Output";
  }, []);

  useEffect(() => {
    async function fetchRecord() {
      try {
        const res = await fetch(`/api/discharge/${id}`);
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
          if (name) document.title = `CareFlow — ${name}`;
          setEditClinical(d.clinical_summary);
          setEditPatient(d.patient_friendly_output);
        } else {
          setError("Record not found");
        }
      } catch {
        setError("Failed to load record");
      } finally {
        setLoading(false);
      }
    }
    fetchRecord();
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
    setTranslating(true);
    try {
      const res = await fetch("/api/translation/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recordId: record.recordId, targetLanguage: targetLang, userId, userRole: role }) });
      const json = await res.json();
      if (json.success) {
        setRecord((prev) => prev ? { ...prev, translatedOutput: json.data.translatedOutput, translationLanguage: json.data.translationLanguage, translationConfidence: json.data.confidence } : prev);
      }
    } catch {
      toast.error("Translation request failed");
    } finally { setTranslating(false); }
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
      <button type="button" onClick={() => onNavigate({ name: "list" })} className="inline-flex items-center gap-1.5 text-sm text-cool-grey hover:text-deep-navy transition-colors mb-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </button>

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
            <Button size="sm" className="touch-target-min bg-clinical-teal hover:bg-clinical-teal/90" onClick={() => { setConfirmAction("finalise"); setConfirmOpen(true); }}>
              <CheckCircle className="mr-1 h-4 w-4" />Finalise
            </Button>
          )}
          {isEditing && (
            <>
              <Button variant="outline" size="sm" className="touch-target-min" onClick={handleCancel} disabled={saving}><X className="mr-1 h-4 w-4" />Cancel</Button>
              <Button size="sm" className="touch-target-min bg-clinical-teal hover:bg-clinical-teal/90" onClick={handleSave} disabled={saving}><Save className="mr-1 h-4 w-4" />{saving ? "Saving..." : "Save"}</Button>
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

      <div className="rounded-lg border border-slate/20 bg-white p-3 sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <span className="text-sm font-medium text-slate">Translate to:</span>
          <div className="flex flex-wrap items-center gap-2">
            <select value={translateLang} onChange={(e) => setTranslateLang(e.target.value)} className="touch-target-min rounded-md border border-slate/30 bg-white px-3 py-1.5 text-sm text-slate shadow-sm">
              <option value="">Select language</option>
              <option value="ha">Hausa</option>
              <option value="yo">Yoruba</option>
              <option value="ig">Igbo</option>
            </select>
            <Button size="sm" variant="outline" className="touch-target-min" onClick={() => handleTranslate()} disabled={translating || !translateLang}>
              {translating ? "Translating..." : record.translationConfidence === "low" || record.translationConfidence === "failed" ? "Retranslate" : "Translate"}
            </Button>
          </div>
          {record.translationLanguage && (
            <span className="text-xs text-cool-grey">
              {record.translationLanguage === "ha" ? "Hausa" : record.translationLanguage === "yo" ? "Yoruba" : "Igbo"}
              {record.translationConfidence && (record.translationConfidence === "low" ? " (low confidence)" : record.translationConfidence === "failed" ? " (failed)" : "")}
            </span>
          )}
        </div>
      </div>

      <div className="flex rounded-lg border border-slate/20 bg-cool-off-white p-1">
        {canSeeClinical && (
          <button
            type="button"
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
        <div>
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg border-2 border-warm-amber bg-warm-amber/5 p-2">
                <span className="text-xs text-slate">
                  Words: {editClinical.split(/\s+/).filter(Boolean).length} · Characters: {editClinical.length}
                </span>
              </div>
              <textarea className="min-h-[500px] w-full rounded-lg border border-input bg-transparent p-4 font-mono text-sm" value={editClinical} onChange={(e) => setEditClinical(e.target.value)} />
            </div>
          ) : (
            <ClinicalSummaryPanel content={record.clinicalSummary} missingFieldsLog={record.missingFieldsLog} />
          )}
        </div>
      )}

      {activeMode === "patient" && (
        <div className="space-y-6">
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg border-2 border-warm-amber bg-warm-amber/5 p-2">
                <span className="text-xs text-slate">
                  Words: {editPatient.split(/\s+/).filter(Boolean).length} · Characters: {editPatient.length}
                </span>
              </div>
              <textarea className="min-h-[400px] w-full rounded-lg border border-input bg-transparent p-4 font-mono text-sm" value={editPatient} onChange={(e) => setEditPatient(e.target.value)} />
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
        title={confirmAction === "finalise" ? "Finalise Discharge Record?" : confirmAction === "archive" ? "Archive Discharge Record?" : "Unarchive Discharge Record?"}
        description={confirmAction === "finalise" ? "This will mark the record as finalised. Only a Doctor can undo this action." : confirmAction === "archive" ? "Archived records can be unarchived later." : "This will return the record to draft status."}
        confirmLabel={confirmAction === "finalise" ? "Finalise" : confirmAction === "archive" ? "Archive" : "Unarchive"}
        variant={confirmAction === "archive" ? "destructive" : "default"}
        onConfirm={confirmAction === "finalise" ? handleFinalise : confirmAction === "archive" ? handleArchive : handleUnarchive}
      />
    </div>
  );
}
