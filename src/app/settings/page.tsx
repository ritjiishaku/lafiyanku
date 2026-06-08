"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AppShell } from "@/components/layout/AppShell";
import { useRole } from "@/hooks/useRole";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Hospital, Camera, Copy, Check, ArrowRight } from "lucide-react";

const AVATAR_KEY = "careflow-avatar";

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
