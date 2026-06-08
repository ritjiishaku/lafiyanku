"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MedicationRow } from "./MedicationRow";
import { LanguageSelector } from "./LanguageSelector";
import { OfflineBanner } from "@/components/shared/OfflineBanner";
import { useOfflineDraft } from "@/hooks/useOfflineDraft";
import { useEffect, useCallback, useState, useRef } from "react";
import { Save, AlertCircle, RefreshCw, X } from "lucide-react";

const medicationSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  timing: z.string().optional(),
  duration: z.string().optional(),
  notes: z.string().optional(),
});

const patientInputSchema = z
  .object({
    facilityName: z.string().min(1, "Facility name is required"),
    facilityCode: z.string().optional(),
    wardName: z.string().optional(),
    admissionDate: z.string().min(1, "Admission date is required"),
    dischargeDate: z.string().min(1, "Discharge date is required"),
    patientName: z.string().min(1, "Patient name is required"),
    age: z.coerce.number().int().min(0).max(130),
    gender: z.enum(["Male", "Female", "Other"]),
    hospitalNumber: z.string().min(1, "Hospital number is required"),
    nhisNumber: z.string().optional(),
    diagnosis: z.string().min(1, "Diagnosis is required"),
    treatmentGiven: z.string().min(1, "Treatment summary is required"),
    proceduresPerformed: z.string().optional(),
    medications: z.array(medicationSchema).min(1, "At least one medication is required"),
    followUpInstructions: z.string().optional(),
    additionalNotes: z.string().optional(),
    languageRequested: z.enum(["en", "ha", "yo", "ig"]).optional(),
    dischargedBy: z.string().min(1, "Clinician name is required"),
    clinicianLicenseNo: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.admissionDate || !data.dischargeDate) return true;
      return new Date(data.dischargeDate) >= new Date(data.admissionDate);
    },
    {
      message: "Discharge date must be on or after admission date",
      path: ["dischargeDate"],
    },
  );

export type PatientInputFormData = z.infer<typeof patientInputSchema>;

interface PatientInputFormProps {
  onSubmit: (data: PatientInputFormData) => void;
  isGenerating?: boolean;
}

const DRAFT_KEY = "careflow-discharge-draft";

export function PatientInputForm({
  onSubmit,
  isGenerating = false,
}: PatientInputFormProps) {
  const form = useForm<PatientInputFormData>({
    resolver: zodResolver(patientInputSchema) as unknown as Resolver<PatientInputFormData>,
    defaultValues: {
      facilityName: "",
      facilityCode: "",
      wardName: "",
      admissionDate: "",
      dischargeDate: "",
      patientName: "",
      age: undefined,
      gender: undefined,
      hospitalNumber: "",
      nhisNumber: "",
      diagnosis: "",
      treatmentGiven: "",
      proceduresPerformed: "",
      medications: [{ name: "", dosage: "", frequency: "", timing: "", duration: "", notes: "" }],
      followUpInstructions: "",
      additionalNotes: "",
      languageRequested: "en",
      dischargedBy: "",
      clinicianLicenseNo: "",
    },
  });

  const [restoredFromDraft, setRestoredFromDraft] = useState(false);
  const [dismissRestore, setDismissRestore] = useState(false);

  const { draft, isOffline, lastSavedAt, autoSave, saveDraft } =
    useOfflineDraft(DRAFT_KEY);

  useEffect(() => {
    if (draft?.data && !dismissRestore && form.formState.isSubmitSuccessful === false) {
      const hasValues = Object.values(form.getValues()).some(
        (v) => v !== "" && v !== undefined && !(Array.isArray(v) && v.length === 1),
      );
      if (!hasValues) {
        form.reset(draft.data as PatientInputFormData);
        setRestoredFromDraft(true);
      }
    }
  }, [draft, dismissRestore, form]);

  function handleDismissRestore() {
    setDismissRestore(true);
    setRestoredFromDraft(false);
  }

  const autoSaveRef = useRef(autoSave);
  autoSaveRef.current = autoSave;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/incompatible-library
    const sub = form.watch((values) => {
      autoSaveRef.current(values);
    });
    return () => sub.unsubscribe();
  }, [form]);

  const handleSaveDraft = useCallback(() => {
    saveDraft(form.getValues());
  }, [saveDraft, form]);

  return (
    <>
      <OfflineBanner />
      {restoredFromDraft && !dismissRestore && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-clinical-teal/20 bg-clinical-teal/5 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-clinical-teal">
            <RefreshCw className="h-4 w-4" />
            <span>
              Draft restored from{" "}
              {draft?.savedAt
                ? new Date(draft.savedAt).toLocaleString("en-NG", {
                    timeZone: "Africa/Lagos",
                  })
                : "previous session"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => { setDismissRestore(true); setRestoredFromDraft(false); }}
            className="touch-target-min rounded p-1 text-clinical-teal/60 transition-colors hover:text-clinical-teal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {!restoredFromDraft && draft?.data && !dismissRestore && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-amber-500/20 bg-amber-50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-amber-700">
            <AlertCircle className="h-4 w-4" />
            <span>
              Unsaved draft from{" "}
              {draft?.savedAt
                ? new Date(draft.savedAt).toLocaleString("en-NG", {
                    timeZone: "Africa/Lagos",
                  })
                : "previous session"}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                form.reset(draft.data as PatientInputFormData);
                setRestoredFromDraft(true);
              }}
              className="touch-target-min rounded-md bg-amber-500 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-amber-600"
            >
              Restore
            </button>
            <button
              type="button"
              onClick={handleDismissRestore}
              className="touch-target-min rounded-md border border-amber-500/30 px-3 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {lastSavedAt && (
            <div className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-xs text-green-700">
              <AlertCircle className="h-3 w-3" />
              Auto-saved at {new Date(lastSavedAt).toLocaleTimeString()}
            </div>
          )}

          <FormField
            control={form.control}
            name="facilityName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Facility Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input className="h-11" {...field} placeholder="e.g. Lagos University Teaching Hospital" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="facilityCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-cool-grey">
                    Facility Code <span className="text-xs">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input className="h-11" {...field} placeholder="e.g. LUTH-001" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="wardName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-cool-grey">
                    Ward Name <span className="text-xs">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input className="h-11" {...field} placeholder="e.g. Medical Ward B" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="admissionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Admission Date <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input className="h-11" type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dischargeDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Discharge Date <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input className="h-11" type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="patientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Patient Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input className="h-11" {...field} placeholder="Full name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Age <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input className="h-11" type="number" min={0} max={130} inputMode="numeric" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Gender <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="hospitalNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Hospital Number <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input className="h-11" {...field} placeholder="e.g. LUTH/2024/00412" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nhisNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-cool-grey">
                    NHIS Number <span className="text-xs">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input className="h-11" {...field} placeholder="e.g. NHIS/0045231" inputMode="numeric" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="diagnosis"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Diagnosis <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Primary diagnosis and secondary conditions"
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="treatmentGiven"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Treatment Given <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Summary of treatment during admission"
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="proceduresPerformed"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-cool-grey">
                  Procedures Performed <span className="text-xs">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="List procedures, one per line, or leave empty"
                    rows={2}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <MedicationRow />

          <FormField
            control={form.control}
            name="followUpInstructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-cool-grey">
                  Follow-up Instructions <span className="text-xs">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Clinical follow-up recommendations"
                    rows={2}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="additionalNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-cool-grey">
                  Additional Notes <span className="text-xs">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Supplementary clinical notes"
                    rows={2}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="dischargedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Discharged By <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input className="h-11" {...field} placeholder="Clinician full name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clinicianLicenseNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-cool-grey">
                    MDCN Licence No. <span className="text-xs">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input className="h-11" {...field} placeholder="e.g. MDCN/2015/07821" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <LanguageSelector />

          <div className="flex flex-col gap-3 sm:flex-row-reverse">
            <Button
              type="submit"
              disabled={isGenerating || isOffline}
              className="flex-1 touch-target-min"
              size="lg"
            >
              {isGenerating
                ? "Generating..."
                : isOffline
                  ? "Offline — Cannot Generate"
                  : "Generate Discharge Summary"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              className="touch-target-min"
              size="lg"
            >
              <Save className="mr-2 h-4 w-4" />
              Save as Draft
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
