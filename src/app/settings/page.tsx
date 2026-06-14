"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { AppShell } from "@/components/layout/AppShell";
import { useRole } from "@/hooks/useRole";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Hospital, Camera, Copy, Check, ArrowRight, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { changePasswordSchema } from "@/lib/validations";

const AVATAR_KEY = "lafiyanku-avatar";

function notifyAvatarChange() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("avatar-updated"));
}

function ProfileAvatar() {
  const [src, setSrc] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem(AVATAR_KEY) : null,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    localStorage.removeItem(AVATAR_KEY);
    setSrc(null);
    notifyAvatarChange();
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div
          className="h-24 w-24 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center cursor-pointer ring-4 ring-white shadow-md hover:ring-clinical-teal/30 transition-all"
          onClick={() => inputRef.current?.click()}
        >
          {src ? (
            <Image src={src} alt="Avatar" width={96} height={96} className="h-full w-full object-cover" />
          ) : (
            <Camera className="h-10 w-10 text-slate-400" />
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              const dataUrl = ev.target?.result as string;
              localStorage.setItem(AVATAR_KEY, dataUrl);
              setSrc(dataUrl);
              notifyAvatarChange();
            };
            reader.readAsDataURL(file);
          }
        }} />
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => inputRef.current?.click()}
          className="text-sm font-medium text-clinical-teal hover:text-clinical-teal/80 transition-colors"
        >
          {src ? "Change photo" : "Upload photo"}
        </button>
        {src && (
          <>
            <span className="text-sm text-slate-300">·</span>
            <button
              onClick={handleDelete}
              className="text-sm font-medium text-red-500 hover:text-red-400 transition-colors"
            >
              Remove
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { role, userId, userName } = useRole();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
  const [pwErrors, setPwErrors] = useState<Partial<Record<keyof typeof pwForm, string>>>({});
  const [pwTouched, setPwTouched] = useState<Record<string, boolean>>({});

  function validatePwField(name: string) {
    const result = changePasswordSchema.safeParse(pwForm);
    if (result.success) { setPwErrors({}); return; }
    const issue = result.error.issues.find((i) => i.path[0] === name);
    setPwErrors((prev) => ({ ...prev, [name]: issue?.message }));
  }

  function handlePwBlur(name: string) {
    setPwTouched((prev) => ({ ...prev, [name]: true }));
    validatePwField(name);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    const result = changePasswordSchema.safeParse(pwForm);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof typeof pwForm, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        if (!fieldErrors[field as keyof typeof pwForm]) {
          fieldErrors[field as keyof typeof pwForm] = issue.message;
        }
      }
      setPwErrors(fieldErrors);
      setPwTouched({ currentPassword: true, newPassword: true, confirmNewPassword: true });
      return;
    }
    setPwErrors({});
    setChangingPassword(true);
    try {
      const res = await fetch("/api/settings/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pwForm),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Password changed. You will be signed out.");
        setPwForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
        setShowChangePassword(false);
        setTimeout(async () => {
          await signOut({ redirect: false });
          window.location.href = "/login";
        }, 1500);
      } else {
        const errMsg = json.error?.message ?? json.error ?? "Failed to change password";
        toast.error(typeof errMsg === "string" ? errMsg : "Failed to change password");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-deep-navy sm:text-3xl">Settings</h1>
          <p className="text-sm text-cool-grey">Manage your account and facility preferences</p>
        </div>

        <Card className="overflow-hidden border-slate/10">
          <div className="bg-gradient-to-r from-clinical-teal/10 to-deep-navy/10 px-6 py-8 sm:px-8">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <ProfileAvatar />
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-bold text-deep-navy">{userName ?? "User"}</h2>
                {role && (
                  <span className="inline-block mt-1 rounded-full bg-clinical-teal/10 px-3 py-0.5 text-xs font-semibold text-clinical-teal">
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <CardContent className="p-6 sm:p-8 space-y-5">
            <div>
              <p className="text-xs font-medium text-cool-grey uppercase tracking-wider">User ID</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="font-mono text-sm text-slate break-all">{userId ?? "—"}</span>
                <button
                  onClick={() => {
                    if (userId) {
                      navigator.clipboard.writeText(userId);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }
                  }}
                  className="shrink-0 rounded-md p-1.5 text-cool-grey hover:bg-slate-100 hover:text-clinical-teal transition-colors"
                  title="Copy user ID"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-clinical-teal" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-cool-grey uppercase tracking-wider">Session</p>
              <p className="mt-1 text-sm text-slate">Active</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate/10">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-clinical-teal/10 p-3 shrink-0">
                  <Lock className="h-5 w-5 text-clinical-teal" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-deep-navy">Change Password</h3>
                  <p className="mt-1 text-sm text-cool-grey leading-relaxed">
                    Update your account password. You will be signed out after changing it.
                  </p>
                  {showChangePassword && (
                    <form onSubmit={handleChangePassword} className="mt-4 space-y-3 max-w-sm" noValidate>
                      <div className="space-y-1">
                        <Label htmlFor="currentPassword" className="text-xs font-medium text-slate">Current password</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            value={pwForm.currentPassword}
                            onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                            onBlur={() => handlePwBlur("currentPassword")}
                            type={showCurrentPw ? "text" : "password"}
                            className="h-11 pr-10"
                            aria-invalid={!!pwTouched.currentPassword && !!pwErrors.currentPassword}
                            aria-describedby={pwErrors.currentPassword ? "currentPassword-error" : undefined}
                          />
                          <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-cool-grey hover:text-slate" tabIndex={-1}>
                            {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {pwTouched.currentPassword && pwErrors.currentPassword && <p id="currentPassword-error" className="text-[11px] text-warm-amber">{pwErrors.currentPassword}</p>}
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="newPassword" className="text-xs font-medium text-slate">New password</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            value={pwForm.newPassword}
                            onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                            onBlur={() => handlePwBlur("newPassword")}
                            type={showNewPw ? "text" : "password"}
                            placeholder="Min. 8 characters"
                            className="h-11 pr-10"
                            aria-invalid={!!pwTouched.newPassword && !!pwErrors.newPassword}
                            aria-describedby={pwErrors.newPassword ? "newPassword-error" : undefined}
                          />
                          <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-cool-grey hover:text-slate" tabIndex={-1}>
                            {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {pwTouched.newPassword && pwErrors.newPassword && <p id="newPassword-error" className="text-[11px] text-warm-amber">{pwErrors.newPassword}</p>}
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="confirmNewPassword" className="text-xs font-medium text-slate">Confirm new password</Label>
                        <div className="relative">
                          <Input
                            id="confirmNewPassword"
                            value={pwForm.confirmNewPassword}
                            onChange={(e) => setPwForm({ ...pwForm, confirmNewPassword: e.target.value })}
                            onBlur={() => handlePwBlur("confirmNewPassword")}
                            type={showConfirmPw ? "text" : "password"}
                            className="h-11 pr-10"
                            aria-invalid={!!pwTouched.confirmNewPassword && !!pwErrors.confirmNewPassword}
                            aria-describedby={pwErrors.confirmNewPassword ? "confirmNewPassword-error" : undefined}
                          />
                          <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-cool-grey hover:text-slate" tabIndex={-1}>
                            {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {pwTouched.confirmNewPassword && pwErrors.confirmNewPassword && <p id="confirmNewPassword-error" className="text-[11px] text-warm-amber">{pwErrors.confirmNewPassword}</p>}
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <Button type="submit" disabled={changingPassword}>
                          {changingPassword ? "Saving..." : "Update Password"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowChangePassword(false);
                            setPwForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
                            setPwErrors({});
                            setPwTouched({});
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
              {!showChangePassword && (
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="shrink-0 rounded-lg border border-slate/20 px-3 py-1.5 text-xs font-medium text-slate hover:bg-slate/5 transition-colors"
                >
                  Change
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {role === "admin" && (
          <>
            <button type="button" onClick={() => router.push("/admin")} className="w-full text-left">
              <Card className="border-slate/10 transition-shadow hover:shadow-md cursor-pointer">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-clinical-teal/10 p-3 shrink-0">
                        <Hospital className="h-5 w-5 text-clinical-teal" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-deep-navy">Facility Management</h3>
                        <p className="mt-1 text-sm text-cool-grey leading-relaxed">
                          View facilities, manage clinicians, and configure system preferences.
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-cool-grey" />
                  </div>
                </CardContent>
              </Card>
            </button>

            <button type="button" onClick={() => router.push("/admin/compliance")} className="w-full text-left">
              <Card className="border-slate/10 transition-shadow hover:shadow-md cursor-pointer">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-clinical-teal/10 p-3 shrink-0">
                        <Shield className="h-5 w-5 text-clinical-teal" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-deep-navy">NDPR Compliance</h3>
                        <p className="mt-1 text-sm text-cool-grey leading-relaxed">
                          View audit logs, monitor data access, and ensure regulatory compliance.
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-cool-grey" />
                  </div>
                </CardContent>
              </Card>
            </button>
          </>
        )}
      </div>
    </AppShell>
  );
}
