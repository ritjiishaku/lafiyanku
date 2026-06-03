"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Phone, MapPin, User, CheckCircle, ArrowRight } from "lucide-react";
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

export function DemoRequestForm() {
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
              {formData.facilityName} &middot; {formData.state}
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
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">See CareFlow in Your Hospital</h2>
          <p className="mt-3 text-lg text-slate-300">Request a personalized walkthrough or start your 30-day free facility pilot.</p>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-2xl shadow-black/20 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-sm font-medium text-slate">Full name</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cool-grey/60" />
                  <Input id="fullName" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} placeholder="Dr. Chidi Obi" required className="pl-10 h-11" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="role" className="text-sm font-medium text-slate">Your role</Label>
                <Select onValueChange={(val) => setFormData({ ...formData, role: val as string })}>
                  <SelectTrigger id="role" className="h-11"><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="facilityName" className="text-sm font-medium text-slate">Facility name</Label>
                <div className="relative">
                  <Building className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cool-grey/60" />
                  <Input id="facilityName" value={formData.facilityName} onChange={(e) => setFormData({ ...formData, facilityName: e.target.value })} placeholder="Lagos University Teaching Hospital" required className="pl-10 h-11" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="whatsappNumber" className="text-sm font-medium text-slate">WhatsApp number</Label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cool-grey/60" />
                  <Input id="whatsappNumber" type="tel" value={formData.whatsappNumber} onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })} placeholder="+234 803 123 4567" required className="pl-10 h-11" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="state" className="text-sm font-medium text-slate">State</Label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cool-grey/60 z-10" />
                <Select onValueChange={(val) => setFormData({ ...formData, state: val as string })}>
                  <SelectTrigger id="state" className="h-11 pl-10"><SelectValue placeholder="Select your state" /></SelectTrigger>
                  <SelectContent>
                    {NIGERIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <Checkbox id="ndpr-consent" checked={ndprConsent} onChange={(e) => setNdprConsent(e.target.checked)} />
              <Label htmlFor="ndpr-consent" className="w-full text-sm text-slate-600 leading-relaxed cursor-pointer select-none">
                I consent to CareFlow contacting me via WhatsApp to discuss this demo request and to process my details in accordance with the{" "}
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
