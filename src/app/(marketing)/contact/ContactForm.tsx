"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Building, Phone, MapPin, ArrowRight, CheckCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

const ROLES = [
  { value: "medical-director", label: "Medical Director" },
  { value: "it-lead", label: "IT Lead / Director" },
  { value: "cmo", label: "Chief Medical Officer" },
  { value: "clinician", label: "Clinician (Doctor/Nurse)" },
  { value: "records-officer", label: "Records Officer" },
  { value: "other", label: "Other" },
];

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ndprConsent, setNdprConsent] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    role: "",
    facilityName: "",
    whatsappNumber: "",
    state: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.role || !formData.facilityName || !formData.whatsappNumber || !formData.state) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (!ndprConsent) {
      toast.error("Please confirm your consent to continue.");
      return;
    }

    setLoading(true);
    try {
      const roleLabel = ROLES.find((r) => r.value === formData.role)?.label ?? formData.role;
      const res = await fetch("/api/contact/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: roleLabel }),
      });
      if (!res.ok) throw new Error();
      setSuccess(true);
      toast.success("Demo request submitted!");
    } catch {
      toast.error("Something went wrong. Please try again.");
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
    <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-sm font-medium text-slate">Full name</Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cool-grey/60" />
            <Input id="fullName" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} placeholder="Dr. Chidi Obi" required className="pl-10 h-11" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="role" className="text-sm font-medium text-slate">Your role</Label>
          <Select onValueChange={(val) => setFormData({ ...formData, role: val as string })}>
            <SelectTrigger id="role" className="h-11"><SelectValue placeholder="Select role" /></SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => (<SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="facilityName" className="text-sm font-medium text-slate">Facility name</Label>
          <div className="relative">
            <Building className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cool-grey/60" />
            <Input id="facilityName" value={formData.facilityName} onChange={(e) => setFormData({ ...formData, facilityName: e.target.value })} placeholder="Lagos University Teaching Hospital" required className="pl-10 h-11" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="whatsappNumber" className="text-sm font-medium text-slate">WhatsApp number</Label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cool-grey/60" />
            <Input id="whatsappNumber" type="tel" value={formData.whatsappNumber} onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })} placeholder="+234 803 123 4567" required className="pl-10 h-11" />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="state" className="text-sm font-medium text-slate">State</Label>
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cool-grey/60 z-10" />
          <Select onValueChange={(val) => setFormData({ ...formData, state: val as string })}>
            <SelectTrigger id="state" className="h-11 pl-10"><SelectValue placeholder="Select your state" /></SelectTrigger>
            <SelectContent>
              {NIGERIAN_STATES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <Checkbox id="ndpr-consent" checked={ndprConsent} onChange={(e) => setNdprConsent(e.target.checked)} className="mt-0.5" />
        <label htmlFor="ndpr-consent" className="w-full text-sm text-slate-600 leading-relaxed cursor-pointer select-none">
          I consent to CareFlow contacting me via WhatsApp to process my details in accordance with the{" "}
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
