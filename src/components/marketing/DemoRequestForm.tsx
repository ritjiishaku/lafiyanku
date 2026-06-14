"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Phone, Mail, User, CheckCircle, ArrowRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { isNigerianPhone, isValidEmail } from "@/lib/validations";
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

const FIELD_LABELS: Record<FieldName, string> = {
  fullName: "Full name",
  role: "Role",
  facilityName: "Facility name",
  whatsappNumber: "WhatsApp number",
  email: "Email",
};

function validateField(name: FieldName, value: string): string | undefined {
  if (name === "whatsappNumber") {
    if (!value.trim()) return "WhatsApp number is required";
    const digits = value.replace(/\s+/g, "");
    if (!isNigerianPhone(digits)) return "Enter a valid Nigerian number (e.g. +2348031234567)";
    return;
  }
  if (name === "email") {
    if (!value.trim()) return "Email is required";
    if (!isValidEmail(value.trim())) return "Enter a valid email address";
    return;
  }
  if (!value.trim()) return `${FIELD_LABELS[name]} is required`;
}

export function DemoRequestForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ndprConsent, setNdprConsent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formData, setFormData] = useState({
    fullName: "",
    role: "",
    facilityName: "",
    whatsappNumber: "",
    email: "",
  });

  const updateField = useCallback((name: FieldName, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => {
      const err = validateField(name, value);
      return err ? { ...prev, [name]: err } : { ...prev, [name]: undefined };
    });
  }, []);

  const handleBlur = useCallback((name: FieldName) => {
    setFieldErrors((prev) => {
      const err = validateField(name, formData[name]);
      return err ? { ...prev, [name]: err } : { ...prev, [name]: undefined };
    });
  }, [formData]);

  const validate = useCallback((): FieldErrors => {
    const errors: FieldErrors = {};
    for (const name of Object.keys(FIELD_LABELS) as FieldName[]) {
      const err = validateField(name, formData[name]);
      if (err) errors[name] = err;
    }
    return errors;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

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
      <section id="demo-request" className="bg-gradient-to-br from-deep-navy to-deep-navy/95 py-20 lg:py-28 scroll-mt-20 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(11,110,110,0.15),transparent_50%)]" />
        <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-10 border border-white/10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-clinical-teal/20 mb-6">
              <CheckCircle className="h-8 w-8 text-clinical-teal" />
            </div>
            <h3 className="text-2xl font-bold text-white">Request Received!</h3>
            <p className="mt-3 text-slate-300 leading-relaxed">
              Thank you, <strong className="text-white">{formData.fullName}</strong>. Our team will contact you on WhatsApp within 24 hours to schedule your demo.
            </p>
            <div className="mt-2 text-sm text-slate-400/70">
              {formData.facilityName}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="demo-request" className="bg-gradient-to-br from-deep-navy to-deep-navy/95 py-20 lg:py-28 scroll-mt-20 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(11,110,110,0.15),transparent_50%)]" />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">See Lafiyanku in Your Hospital</h2>
          <p className="mt-3 text-lg text-slate-300">Request a personalized walkthrough or start your 30-day free facility pilot.</p>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-2xl shadow-black/20 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-sm font-medium text-slate">Full name</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cool-grey/60" />
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    onBlur={() => handleBlur("fullName")}
                    placeholder="Dr. Chidi Obi"
                    className="pl-10 h-11"
                    aria-invalid={!!fieldErrors.fullName}
                  />
                </div>
                {fieldErrors.fullName && <p className="text-xs text-warm-amber mt-1">{fieldErrors.fullName}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="role" className="text-sm font-medium text-slate">Your role</Label>
                <Select onValueChange={(val) => updateField("role", val as string)}>
                  <SelectTrigger id="role" className="h-11" data-invalid={!!fieldErrors.role}><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.role && <p className="text-xs text-warm-amber mt-1">{fieldErrors.role}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="facilityName" className="text-sm font-medium text-slate">Facility name</Label>
                <div className="relative">
                  <Building className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cool-grey/60" />
                  <Input
                    id="facilityName"
                    value={formData.facilityName}
                    onChange={(e) => updateField("facilityName", e.target.value)}
                    onBlur={() => handleBlur("facilityName")}
                    placeholder="Lagos University Teaching Hospital"
                    className="pl-10 h-11"
                    aria-invalid={!!fieldErrors.facilityName}
                  />
                </div>
                {fieldErrors.facilityName && <p className="text-xs text-warm-amber mt-1">{fieldErrors.facilityName}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="whatsappNumber" className="text-sm font-medium text-slate">WhatsApp number</Label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cool-grey/60" />
                  <Input
                    id="whatsappNumber"
                    type="tel"
                    value={formData.whatsappNumber}
                    onChange={(e) => updateField("whatsappNumber", e.target.value)}
                    onBlur={() => handleBlur("whatsappNumber")}
                    placeholder="+234 803 123 4567"
                    className="pl-10 h-11"
                    aria-invalid={!!fieldErrors.whatsappNumber}
                  />
                </div>
                {fieldErrors.whatsappNumber && <p className="text-xs text-warm-amber mt-1">{fieldErrors.whatsappNumber}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-slate">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cool-grey/60" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  placeholder="chidi.obi@luth.gov.ng"
                  className="pl-10 h-11"
                  aria-invalid={!!fieldErrors.email}
                />
              </div>
              {fieldErrors.email && <p className="text-xs text-warm-amber mt-1">{fieldErrors.email}</p>}
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <Checkbox id="ndpr-consent" checked={ndprConsent} onChange={(e) => setNdprConsent(e.target.checked)} />
              <Label htmlFor="ndpr-consent" className="w-full text-sm text-slate-600 leading-relaxed cursor-pointer select-none">
                I consent to Lafiyanku contacting me via WhatsApp to discuss this demo request and to process my details in accordance with the{" "}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold text-clinical-teal underline hover:text-clinical-teal/80">Privacy Policy</a>{" "}
                and{" "}
                <a href="/ndpr" target="_blank" rel="noopener noreferrer" className="font-semibold text-clinical-teal underline hover:text-clinical-teal/80">NDPR 2019 compliance statement</a>.
              </Label>
            </div>

            <Button
              type="submit"
              disabled={loading || !ndprConsent}
              className="w-full h-11 rounded-lg bg-clinical-teal text-white text-sm font-bold hover:bg-clinical-teal/90 hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-clinical-teal/20 transition-all duration-150 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Submitting...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  Request a Demo
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
