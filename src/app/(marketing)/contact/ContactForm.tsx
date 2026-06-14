"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Building, Phone, Mail, ArrowRight, CheckCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { demoRequestSchema } from "@/lib/validations";
import { toast } from "sonner";

const ROLES = [
  { value: "medical-director", label: "Medical Director" },
  { value: "it-lead", label: "IT Lead / Director" },
  { value: "cmo", label: "Chief Medical Officer" },
  { value: "clinician", label: "Clinician (Doctor/Nurse)" },
  { value: "records-officer", label: "Records Officer" },
  { value: "other", label: "Other" },
];

type FieldName = "fullName" | "role" | "facilityName" | "whatsappNumber" | "email";
type FieldErrors = Partial<Record<FieldName, string>>;

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ndprConsent, setNdprConsent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    fullName: "",
    role: "",
    facilityName: "",
    whatsappNumber: "",
    email: "",
  });

  function validateField(name: FieldName) {
    const result = demoRequestSchema.safeParse(formData);
    if (result.success) { setFieldErrors({}); return; }
    const issue = result.error.issues.find((i) => i.path[0] === name);
    setFieldErrors((prev) => ({ ...prev, [name]: issue?.message }));
  }

  const updateField = useCallback((name: FieldName, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) validateField(name);
  }, [touched]);

  const handleBlur = useCallback((name: FieldName) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = demoRequestSchema.safeParse(formData);
    if (!result.success) {
      const errors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as FieldName;
        if (!errors[field]) errors[field] = issue.message;
      }
      setFieldErrors(errors);
      setTouched({ fullName: true, role: true, facilityName: true, whatsappNumber: true, email: true });
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      const roleLabel = ROLES.find((r) => r.value === formData.role)?.label ?? formData.role;
      const res = await fetch("/api/contact/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: roleLabel }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }

      setSuccess(true);
      toast.success("Demo request submitted!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-8 sm:p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-clinical-teal/10 mb-4">
          <CheckCircle className="h-7 w-7 text-clinical-teal" />
        </div>
        <h2 className="text-xl font-bold text-deep-navy mb-1">Request Received!</h2>
        <p className="text-sm text-cool-grey">
          Thank you, <strong>{formData.fullName}</strong>. We&apos;ll contact you on WhatsApp within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-sm font-medium text-slate">
            Full name <span className="text-warm-amber">*</span>
          </Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cool-grey/60" />
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              onBlur={() => handleBlur("fullName")}
              placeholder="Dr. Chidi Obi"
              className="pl-10 h-11"
              aria-invalid={!!touched.fullName && !!fieldErrors.fullName}
              aria-describedby={fieldErrors.fullName ? "fullName-error" : undefined}
            />
          </div>
          {touched.fullName && fieldErrors.fullName && <p id="fullName-error" className="text-[11px] text-warm-amber">{fieldErrors.fullName}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="role" className="text-sm font-medium text-slate">
            Your role <span className="text-warm-amber">*</span>
          </Label>
          <Select onValueChange={(val) => { if (typeof val === "string") { updateField("role", val); setTouched((prev) => ({ ...prev, role: true })); } else { setFieldErrors((prev) => ({ ...prev, role: "Please select your role." })); } }}>
            <SelectTrigger id="role" className="h-11" data-invalid={!!touched.role && !!fieldErrors.role} aria-describedby={fieldErrors.role ? "role-error" : undefined}>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => (<SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>))}
            </SelectContent>
          </Select>
          {touched.role && fieldErrors.role && <p id="role-error" className="text-[11px] text-warm-amber">{fieldErrors.role}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="facilityName" className="text-sm font-medium text-slate">
            Facility name <span className="text-warm-amber">*</span>
          </Label>
          <div className="relative">
            <Building className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cool-grey/60" />
            <Input
              id="facilityName"
              value={formData.facilityName}
              onChange={(e) => updateField("facilityName", e.target.value)}
              onBlur={() => handleBlur("facilityName")}
              placeholder="Lagos University Teaching Hospital"
              className="pl-10 h-11"
              aria-invalid={!!touched.facilityName && !!fieldErrors.facilityName}
              aria-describedby={fieldErrors.facilityName ? "facilityName-error" : undefined}
            />
          </div>
          {touched.facilityName && fieldErrors.facilityName && <p id="facilityName-error" className="text-[11px] text-warm-amber">{fieldErrors.facilityName}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="whatsappNumber" className="text-sm font-medium text-slate">
            WhatsApp number <span className="text-warm-amber">*</span>
          </Label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cool-grey/60" />
            <Input
              id="whatsappNumber"
              type="tel"
              value={formData.whatsappNumber}
              onChange={(e) => updateField("whatsappNumber", e.target.value)}
              onBlur={() => handleBlur("whatsappNumber")}
              placeholder="+234 803 123 4567"
              className="pl-10 h-11"
              aria-invalid={!!touched.whatsappNumber && !!fieldErrors.whatsappNumber}
              aria-describedby={fieldErrors.whatsappNumber ? "whatsappNumber-error" : undefined}
            />
          </div>
          {touched.whatsappNumber && fieldErrors.whatsappNumber && <p id="whatsappNumber-error" className="text-[11px] text-warm-amber">{fieldErrors.whatsappNumber}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-medium text-slate">
          Email <span className="text-warm-amber">*</span>
        </Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cool-grey/60" />
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            placeholder="chidi.obi@luth.gov.ng"
            className="pl-10 h-11"
            aria-invalid={!!touched.email && !!fieldErrors.email}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
          />
        </div>
        {touched.email && fieldErrors.email && <p id="email-error" className="text-[11px] text-warm-amber">{fieldErrors.email}</p>}
      </div>

      <div className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <Checkbox id="ndpr-consent" checked={ndprConsent} onChange={(e) => setNdprConsent(e.target.checked)} className="mt-0.5" />
        <label htmlFor="ndpr-consent" className="w-full text-sm text-slate-600 leading-relaxed cursor-pointer select-none">
          I consent to Lafiyanku contacting me via WhatsApp to process my details in accordance with the{" "}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold text-clinical-teal underline hover:text-clinical-teal/80">Privacy Policy</a>{" "}
          and{" "}
          <a href="/ndpr" target="_blank" rel="noopener noreferrer" className="font-semibold text-clinical-teal underline hover:text-clinical-teal/80">NDPR 2019 compliance statement</a>.
        </label>
      </div>

      <Button type="submit" disabled={loading || !ndprConsent} className="w-full h-11 rounded-lg bg-clinical-teal text-white text-sm font-bold hover:bg-clinical-teal/90 hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-clinical-teal/20 transition-all duration-150 disabled:opacity-50 disabled:hover:translate-y-0">
        {loading ? (
          <span className="inline-flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Submitting...</span>
        ) : (
          <span className="inline-flex items-center gap-2">Request a Demo <ArrowRight className="h-4 w-4" /></span>
        )}
      </Button>
    </form>
  );
}
