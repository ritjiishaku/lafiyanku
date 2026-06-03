"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useRole } from "@/hooks/useRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Edit, ArrowLeft, FileText, Calendar, User } from "lucide-react";

interface RecordDetail {
  recordId: string;
  status: string;
  generatedAt: string;
  patientName: string;
  facilityName: string;
  dischargeDate: string;
  dischargedBy: string;
}

interface DischargeDetailViewProps {
  id: string;
  onNavigate: (view: { name: string; id?: string }) => void;
}

export function DischargeDetailView({ id, onNavigate }: DischargeDetailViewProps) {
  const { role } = useRole();
  const [record, setRecord] = useState<RecordDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecord() {
      try {
        const res = await fetch(`/api/discharge/${id}`);
        const json = await res.json();
        if (json.success) {
          const d = json.data;
          const pi = d.patient_input;
          setRecord({
            recordId: d.record_id,
            status: d.status,
            generatedAt: d.generated_at,
            patientName: pi?.patient_name ?? "",
            facilityName: pi?.facility_name ?? "",
            dischargeDate: pi?.discharge_date ?? "",
            dischargedBy: pi?.discharged_by ?? "",
          });
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

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><LoadingSpinner /></div>;
  }

  if (error || !record) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-cool-grey/50" />
          <p className="mt-4 text-lg font-medium text-deep-navy">{error ?? "Record not found"}</p>
          <Button variant="outline" size="sm" className="mt-4 touch-target-min" onClick={() => onNavigate({ name: "list" })}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const canEdit = role === "doctor" || role === "nurse";

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <button type="button" onClick={() => onNavigate({ name: "list" })} className="inline-flex items-center gap-1.5 text-sm text-cool-grey hover:text-deep-navy transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-deep-navy sm:text-3xl">{record.patientName}</h1>
          <p className="text-sm text-cool-grey">{record.facilityName}</p>
        </div>
        <StatusBadge status={record.status as "draft" | "finalised" | "archived"} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-deep-navy">
              <Calendar className="h-4 w-4 text-clinical-teal" />Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate">
            <p><span className="text-cool-grey">Discharge date:</span> {record.dischargeDate}</p>
            <p><span className="text-cool-grey">Generated at:</span> {new Date(record.generatedAt).toLocaleString("en-NG", { timeZone: "Africa/Lagos" })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-deep-navy">
              <User className="h-4 w-4 text-clinical-teal" />Clinician
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate">
            <p><span className="text-cool-grey">Discharged by:</span> {record.dischargedBy}</p>
            <p><span className="text-cool-grey">Record ID:</span> <span className="font-mono text-xs">{record.recordId.slice(0, 12)}...</span></p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button className="touch-target-min bg-clinical-teal hover:bg-clinical-teal/90" onClick={() => onNavigate({ name: "output", id: record.recordId })}>
          <Eye className="mr-1 h-4 w-4" />
          View Full Output
        </Button>
        {canEdit && record.status !== "archived" && (
          <Button variant="outline" size="sm" className="touch-target-min" onClick={() => onNavigate({ name: "output", id: record.recordId })}>
            <Edit className="mr-1 h-4 w-4" />
            Edit Record
          </Button>
        )}
      </div>
    </div>
  );
}
