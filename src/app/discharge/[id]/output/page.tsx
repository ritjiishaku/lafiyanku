"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { AppShell } from "@/components/layout/AppShell";
import { useRole } from "@/hooks/useRole";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Edit, Save, X, CheckCircle, Archive } from "lucide-react";

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

export default function DischargeOutputPage() {
  const params = useParams<{ id: string }>();
  const { role, userId } = useRole();
  const [record, setRecord] = useState<DischargeRecordData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editClinical, setEditClinical] = useState("");
  const [editPatient, setEditPatient] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"finalise" | "archive" | null>(null);
  const [translateLang, setTranslateLang] = useState<string>("ha");
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    async function fetchRecord() {
      try {
        const res = await fetch(`/api/discharge/${params.id}`);
        const json = await res.json();
        if (json.success) {
          const d = json.data;
          const pi = d.patient_input;
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
            patientName: pi?.patient_name ?? "",
            facilityName: pi?.facility_name ?? "",
            dischargeDate: pi?.discharge_date ?? "",
            dischargedBy: pi?.discharged_by ?? "",
          });
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
  }, [params.id]);

  async function handleSave() {
    if (!record) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/discharge/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicalSummary: editClinical,
          patientFriendlyOutput: editPatient,
          editedByUserId: userId,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setRecord((prev) =>
          prev
            ? {
                ...prev,
                clinicalSummary: editClinical,
                patientFriendlyOutput: editPatient,
              }
            : prev,
        );
        setIsEditing(false);
      }
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (record) {
      setEditClinical(record.clinicalSummary);
      setEditPatient(record.patientFriendlyOutput);
    }
    setIsEditing(false);
  }

  async function handleFinalise() {
    if (!record) return;
    const res = await fetch(`/api/discharge/${record.recordId}/finalise`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, userRole: role }),
    });
    const json = await res.json();
    if (json.success) {
      setRecord((prev) => (prev ? { ...prev, status: "finalised" } : prev));
    }
    setConfirmOpen(false);
    setConfirmAction(null);
  }

  async function handleArchive() {
    if (!record) return;
    const res = await fetch(`/api/discharge/${record.recordId}/archive`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, userRole: role }),
    });
    const json = await res.json();
    if (json.success) {
      setRecord((prev) => (prev ? { ...prev, status: "archived" } : prev));
    }
    setConfirmOpen(false);
    setConfirmAction(null);
  }

  async function handleTranslate() {
    if (!record) return;
    setTranslating(true);
    try {
      const res = await fetch("/api/translation/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordId: record.recordId,
          targetLanguage: translateLang,
          userId,
          userRole: role,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setRecord((prev) =>
          prev
            ? {
                ...prev,
                translatedOutput: json.data.translatedOutput,
                translationLanguage: json.data.translationLanguage,
                translationConfidence: json.data.confidence,
              }
            : prev,
        );
      }
    } finally {
      setTranslating(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      </AppShell>
    );
  }

  if (error || !record) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-cool-grey">{error ?? "Record not found"}</p>
        </div>
      </AppShell>
    );
  }

  const canEdit = role === "doctor" || role === "nurse";
  const canSeeClinical = role === "doctor" || role === "nurse";

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-4 p-4 pb-20 sm:p-6 sm:pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-deep-navy sm:text-3xl">
              Discharge Output
            </h1>
            <StatusBadge status={record.status as "draft" | "finalised" | "archived"} />
          </div>
          <div className="flex flex-wrap gap-2">
            {record.status !== "archived" && canEdit && !isEditing && (
              <Button
                variant="outline"
                size="sm"
                className="touch-target-min"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="mr-1 h-4 w-4" />
                Edit
              </Button>
            )}
            {record.status === "finalised" && (
              <>
                <PrintButton
                  patientName={record.patientName}
                  facilityName={record.facilityName}
                  dischargeDate={record.dischargeDate}
                  clinicianName={record.dischargedBy}
                  patientFriendlyOutput={record.patientFriendlyOutput}
                  translatedOutput={record.translatedOutput}
                  translationLanguage={record.translationLanguage}
                  translationConfidence={record.translationConfidence}
                />
                <WhatsAppShareButton
                  patientFriendlyOutput={record.patientFriendlyOutput}
                />
              </>
            )}
            {record.status === "draft" && role === "doctor" && (
              <Button
                size="sm"
                className="touch-target-min bg-clinical-teal hover:bg-clinical-teal/90"
                onClick={() => { setConfirmAction("finalise"); setConfirmOpen(true); }}
              >
                <CheckCircle className="mr-1 h-4 w-4" />
                Finalise
              </Button>
            )}
            {record.status !== "archived" && (role === "doctor" || role === "admin") && (
              <Button
                variant="outline"
                size="sm"
                className="touch-target-min text-red-500"
                onClick={() => { setConfirmAction("archive"); setConfirmOpen(true); }}
              >
                <Archive className="mr-1 h-4 w-4" />
                Archive
              </Button>
            )}
            {isEditing && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="touch-target-min"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X className="mr-1 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="touch-target-min bg-clinical-teal hover:bg-clinical-teal/90"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save className="mr-1 h-4 w-4" />
                  {saving ? "Saving..." : "Save"}
                </Button>
              </>
            )}
          </div>
        </div>

        {record.missingFieldsLog && record.missingFieldsLog.length > 0 && (
          <MissingFieldsBanner fields={record.missingFieldsLog} />
        )}
        {record.flaggedIssues && record.flaggedIssues.length > 0 && (
          <FlaggedIssuesBanner issues={record.flaggedIssues} />
        )}

        <div className="flex flex-wrap items-center gap-2 py-3">
          <span className="text-sm font-medium text-slate">Translate to:</span>
          <select
            value={translateLang}
            onChange={(e) => setTranslateLang(e.target.value)}
            className="touch-target-min rounded-md border border-slate/30 bg-white px-3 py-1.5 text-sm text-slate shadow-sm"
          >
            <option value="ha">Hausa</option>
            <option value="yo">Yoruba</option>
            <option value="ig">Igbo</option>
          </select>
          <Button
            size="sm"
            variant="outline"
            className="touch-target-min"
            onClick={handleTranslate}
            disabled={translating}
          >
            {translating
              ? "Translating..."
              : record.translationConfidence === "low" ||
                  record.translationConfidence === "failed"
                ? "Retranslate"
                : "Translate"}
          </Button>
          {record.translationLanguage && (
            <span className="text-xs text-cool-grey">
              {record.translationLanguage === "ha"
                ? "Hausa"
                : record.translationLanguage === "yo"
                  ? "Yoruba"
                  : "Igbo"}
              {record.translationConfidence &&
                (record.translationConfidence === "low"
                  ? " (low confidence)"
                  : record.translationConfidence === "failed"
                    ? " (failed)"
                    : "")}
            </span>
          )}
        </div>

        <div className="lg:hidden">
          <Tabs
            defaultValue={canSeeClinical ? "clinical" : "patient"}
            className="w-full"
          >
            <TabsList className="w-full">
              {canSeeClinical && (
                <TabsTrigger value="clinical" className="flex-1">
                  Clinical Summary
                </TabsTrigger>
              )}
              <TabsTrigger value="patient" className="flex-1">
                Patient Instructions
              </TabsTrigger>
              {record.translatedOutput && (
                <TabsTrigger value="translation" className="flex-1">
                  Translation
                </TabsTrigger>
              )}
            </TabsList>

            {canSeeClinical && (
              <TabsContent value="clinical">
                {isEditing ? (
                  <textarea
                    className="min-h-[500px] w-full rounded-lg border border-input bg-transparent p-4 font-mono text-sm"
                    value={editClinical}
                    onChange={(e) => setEditClinical(e.target.value)}
                  />
                ) : (
                  <ClinicalSummaryPanel content={record.clinicalSummary} />
                )}
              </TabsContent>
            )}

            <TabsContent value="patient">
              {isEditing ? (
                <textarea
                  className="min-h-[400px] w-full rounded-lg border border-input bg-transparent p-4 font-mono text-sm"
                  value={editPatient}
                  onChange={(e) => setEditPatient(e.target.value)}
                />
              ) : (
                <PatientInstructionsPanel content={record.patientFriendlyOutput} />
              )}
            </TabsContent>

            {record.translatedOutput && (
              <TabsContent value="translation">
                <TranslationPanel
                  content={record.translatedOutput}
                  language={record.translationLanguage ?? null}
                  confidence={record.translationConfidence ?? null}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>

        <div className="hidden space-y-6 lg:block">
          <div className="grid grid-cols-2 gap-6">
            {canSeeClinical && (
              <div>
                {isEditing ? (
                  <textarea
                    className="min-h-[500px] w-full rounded-lg border border-input bg-transparent p-4 font-mono text-sm"
                    value={editClinical}
                    onChange={(e) => setEditClinical(e.target.value)}
                  />
                ) : (
                  <ClinicalSummaryPanel content={record.clinicalSummary} />
                )}
              </div>
            )}
            <div className={canSeeClinical ? "" : "col-span-2"}>
              {isEditing ? (
                <textarea
                  className="min-h-[400px] w-full rounded-lg border border-input bg-transparent p-4 font-mono text-sm"
                  value={editPatient}
                  onChange={(e) => setEditPatient(e.target.value)}
                />
              ) : (
                <PatientInstructionsPanel content={record.patientFriendlyOutput} />
              )}
            </div>
          </div>
          {record.translatedOutput && (
            <TranslationPanel
              content={record.translatedOutput}
              language={record.translationLanguage ?? null}
              confidence={record.translationConfidence ?? null}
            />
          )}
        </div>

        <ConfirmModal
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={
            confirmAction === "finalise"
              ? "Finalise Discharge Record?"
              : "Archive Discharge Record?"
          }
          description={
            confirmAction === "finalise"
              ? "This will mark the record as finalised. Only a Doctor can undo this action by editing the record."
              : "Archived records cannot be unarchived. They will remain in the system for audit purposes."
          }
          confirmLabel={confirmAction === "finalise" ? "Finalise" : "Archive"}
          variant={confirmAction === "archive" ? "destructive" : "default"}
          onConfirm={confirmAction === "finalise" ? handleFinalise : handleArchive}
        />
      </div>
    </AppShell>
  );
}
