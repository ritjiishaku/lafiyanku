"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Lock, Stethoscope, CheckCircle, ArrowRight, Eye, EyeOff } from "lucide-react";

interface SignUpFormProps {
  onSwitchToLogin?: () => void;
}

interface Facility {
  facility_id: string;
  facility_name: string;
  facility_code: string | null;
}

type Role = "doctor" | "nurse";

function InputIcon({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
      <Icon className="h-4 w-4 text-cool-grey/60" />
    </div>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-sm font-medium text-slate/90">{label}</Label>
      {children}
    </div>
  );
}

export function SignUpForm({ onSwitchToLogin }: SignUpFormProps = {}) {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("doctor");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [facilityId, setFacilityId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/facilities")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data)) {
          setFacilities(d.data);
        } else {
          console.warn("Facilities API returned:", d);
        }
      })
      .catch((err) => console.warn("Facilities fetch failed:", err));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName, role, facilityId: facilityId || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Signup failed. Please try again.");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setIsLoading(false);
      setTimeout(() => router.push("/auth"), 2000);
    } catch {
      setError("Network error. Please try again.");
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-sm rounded-2xl bg-pure-white p-8 shadow-xl shadow-slate-200/60 border border-slate-100 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-clinical-teal/10 mb-5">
          <CheckCircle className="h-8 w-8 text-clinical-teal" />
        </div>
        <h1 className="text-xl font-bold text-deep-navy">Account created</h1>
        <p className="mt-1.5 text-sm text-cool-grey">Redirecting you to sign in...</p>
        <div className="mt-6 h-1 w-full rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full w-2/3 rounded-full bg-clinical-teal animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-7">
        <Link href="/" className="text-xl font-bold tracking-tight text-deep-navy sm:text-2xl hover:text-clinical-teal transition-colors">CareFlow</Link>
        <p className="mt-1 text-sm text-cool-grey">Create your clinician account</p>
      </div>

      <div className="rounded-2xl bg-pure-white px-7 py-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Full name" id="fullName">
              <div className="relative">
                <InputIcon icon={User} />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="e.g. Dr. Ada Obi"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                  enterKeyHint="next"
                  className="pl-10 h-11"
                />
              </div>
            </Field>

            <Field label="Email" id="email">
              <div className="relative">
                <InputIcon icon={Mail} />
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoCapitalize="off"
                  placeholder="clinician@hospital.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  enterKeyHint="next"
                  className="pl-10 h-11"
                />
              </div>
            </Field>

            <Field label="Password" id="password">
              <div className="relative">
                <InputIcon icon={Lock} />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  enterKeyHint="done"
                  className="pl-10 pr-10 h-11"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cool-grey/60 hover:text-cool-grey transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Role" id="role">
                <Select value={role} onValueChange={(v) => setRole(v as "doctor" | "nurse")}>
                  <SelectTrigger id="role" className="h-11">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">
                      <span className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4" />
                        Doctor
                      </span>
                    </SelectItem>
                    <SelectItem value="nurse">
                      <span className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Nurse
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Facility" id="facility">
                <Select value={facilityId} onValueChange={(v) => setFacilityId(v as string)}>
                  <SelectTrigger id="facility" className="h-11">
                    <SelectValue placeholder={facilities.length === 0 ? "No facilities found" : "Select your facility"} className="truncate">
                      {(() => {
                        const f = facilities.find((f) => f.facility_id === facilityId);
                        return f ? `${f.facility_name}${f.facility_code ? ` (${f.facility_code})` : ""}` : undefined;
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {facilities.length === 0 ? (
                      <div className="px-3 py-4 text-sm text-cool-grey text-center">
                        No facilities available. Contact your admin.
                      </div>
                    ) : (
                      facilities.map((f) => (
                        <SelectItem key={f.facility_id} value={f.facility_id}>
                          {f.facility_name}{f.facility_code ? ` (${f.facility_code})` : ""}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {error && (
              <Alert variant="destructive" className="rounded-lg border-red-200 bg-red-50 text-red-700 py-2.5">
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-lg bg-clinical-teal text-white text-sm font-bold hover:bg-clinical-teal/90 hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-clinical-teal/20 transition-all duration-150 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating account...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-cool-grey">
          Already have an account?{" "}
          <button type="button" onClick={onSwitchToLogin} className="font-medium text-clinical-teal hover:text-clinical-teal/80 transition-colors">
            Sign in
          </button>
        </p>

        <p className="mt-3 text-xs text-warm-amber/70 leading-relaxed text-center">
          By continuing, you consent to the processing of patient data in accordance with NDPR 2019.
        </p>
    </>
  );
}
