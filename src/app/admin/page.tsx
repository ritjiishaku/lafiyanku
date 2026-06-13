"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRole } from "@/hooks/useRole";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit2, Trash2, UserPlus, User, Copy, Check, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { registerSchema, clinicianUpdateSchema } from "@/lib/validations";

interface Clinician {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  facility_id: string | null;
  created_at: string;
}

const ROLE_BADGES: Record<string, { label: string; color: string }> = {
  doctor: { label: "Doctor", color: "bg-clinical-teal/10 text-clinical-teal" },
  nurse: { label: "Nurse", color: "bg-blue-500/10 text-blue-600" },
  admin: { label: "Admin", color: "bg-purple-500/10 text-purple-600" },
};

export default function AdminPage() {
  const { role, facilityId } = useRole();
  const [clinicians, setClinicians] = useState<Clinician[]>([]);
  const [facilityCode, setFacilityCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClinician, setEditingClinician] = useState<Clinician | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "doctor" });
  const [credentialsData, setCredentialsData] = useState<{
    userId: string;
    email: string;
    defaultPassword: string;
    loginUrl: string;
    fullName: string;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [adminFieldErrors, setAdminFieldErrors] = useState<Record<string, string>>({});
  const [adminTouched, setAdminTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function load() {
      try {
        const [clinRes, facRes] = await Promise.all([
          fetch("/api/admin/clinicians"),
          fetch("/api/facilities"),
        ]);
        const clinJson = await clinRes.json();
        if (clinJson.success) setClinicians(clinJson.data ?? []);
        const facJson = await facRes.json();
        if (facJson.success) {
          const myFacility = facJson.data.find((f: { facility_id: string }) => f.facility_id === facilityId);
          if (myFacility) setFacilityCode(myFacility.facility_code || myFacility.facility_name.toLowerCase().replace(/\s+/g, "-"));
        }
      } catch {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [facilityId]);

  function validateAdminField(name: string) {
    const schema = editingClinician ? clinicianUpdateSchema : registerSchema;
    const result = schema.safeParse(editingClinician ? { fullName: form.fullName, role: form.role } : { email: form.email, fullName: form.fullName, role: form.role });
    if (result.success) { setAdminFieldErrors({}); return; }
    const issue = result.error.issues.find((i) => i.path[0] === name);
    setAdminFieldErrors((prev) => ({ ...prev, [name]: issue?.message ?? "" }));
  }

  const handleAdminBlur = useCallback((name: string) => {
    setAdminTouched((prev) => ({ ...prev, [name]: true }));
    validateAdminField(name);
  }, [editingClinician, form.fullName, form.email, form.role]);

  function resetAdminDialog() {
    setEditingClinician(null);
    setForm({ fullName: "", email: "", password: "", role: "doctor" });
    setAdminFieldErrors({});
    setAdminTouched({});
  }

  async function refresh() {
    setLoading(true);
    try {
      const [clinRes, facRes] = await Promise.all([
        fetch("/api/admin/clinicians"),
        fetch("/api/facilities"),
      ]);
      const clinJson = await clinRes.json();
      if (clinJson.success) setClinicians(clinJson.data ?? []);
      const facJson = await facRes.json();
      if (facJson.success) {
        const myFacility = facJson.data.find((f: { facility_id: string }) => f.facility_id === facilityId);
        if (myFacility) setFacilityCode(myFacility.facility_code || myFacility.facility_name.toLowerCase().replace(/\s+/g, "-"));
      }
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  function openAddDialog() {
    resetAdminDialog();
    setDialogOpen(true);
  }

  function openEditDialog(c: Clinician) {
    setEditingClinician(c);
    setForm({ fullName: c.full_name, email: c.email, password: "", role: c.role });
    setAdminFieldErrors({});
    setAdminTouched({});
    setDialogOpen(true);
  }

  async function handleAddClinician() {
    setAdminTouched({ fullName: true, email: true, role: true });
    const result = registerSchema.safeParse({ email: form.email, fullName: form.fullName, role: form.role });
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        if (!errors[field]) errors[field] = issue.message;
      }
      setAdminFieldErrors(errors);
      return;
    }
    setAdminFieldErrors({});
    setSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          fullName: form.fullName,
          role: form.role,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setDialogOpen(false);
        setCredentialsData({
          userId: json.data.userId ?? "",
          email: json.data.email,
          defaultPassword: json.data.defaultPassword,
          loginUrl: json.data.loginUrl,
          fullName: form.fullName,
        });
        resetAdminDialog();
        await refresh();
      } else {
        const errMsg = json.error?.message ?? json.error ?? "Failed to add clinician";
        toast.error(typeof errMsg === "string" ? errMsg : "Failed to add clinician");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditClinician() {
    setAdminTouched({ fullName: true, role: true });
    const result = clinicianUpdateSchema.safeParse({ fullName: form.fullName, role: form.role });
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        if (!errors[field]) errors[field] = issue.message;
      }
      setAdminFieldErrors(errors);
      return;
    }
    setAdminFieldErrors({});
    if (!editingClinician) return;
    setSubmitting(true);
    try {
      const body: Record<string, string> = { fullName: form.fullName, role: form.role };
      if (form.password) body.password = form.password;
      const res = await fetch(`/api/admin/clinicians/${editingClinician.user_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Clinician updated");
        setDialogOpen(false);
        resetAdminDialog();
        await refresh();
      } else {
        toast.error(json.error ?? "Failed to update clinician");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteClinician(clinician: Clinician) {
    const confirmed = window.confirm(`Remove ${clinician.full_name || clinician.email} from your facility? This cannot be undone.`);
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/admin/clinicians/${clinician.user_id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Clinician removed");
        await refresh();
      } else {
        toast.error(json.error ?? "Failed to remove clinician");
      }
    } catch {
      toast.error("Network error. Please try again.");
    }
  }

  async function regeneratePassword() {
    if (!credentialsData) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/clinicians/${credentialsData.userId}/regenerate-password`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        setCredentialsData({ ...credentialsData, defaultPassword: json.data.password });
        toast.success("Password regenerated");
      } else {
        toast.error(json.error?.message ?? json.error ?? "Failed to regenerate password");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function copyToClipboard(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  function copyAllCredentials() {
    if (!credentialsData) return;
    const text = `Email: ${credentialsData.email}\nPassword: ${credentialsData.defaultPassword}\nLogin URL: ${credentialsData.loginUrl}`;
    copyToClipboard(text, "all");
  }

  const filtered = clinicians.filter((c) => {
    const query = search.toLowerCase();
    const matchesSearch = !query || c.full_name.toLowerCase().includes(query) || c.email.toLowerCase().includes(query);
    const matchesRole = roleFilter === "all" || c.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (role !== "admin") {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center text-cool-grey">
          Access restricted to Admin users.
        </div>
      </AppShell>
    );
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center"><LoadingSpinner /></div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto flex h-full min-h-0 max-w-6xl flex-col p-4 sm:p-6">
        {error && (
          <div className="mb-4 flex-shrink-0 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        <div className="mb-6 flex flex-shrink-0 flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-deep-navy sm:text-3xl">Facility Management</h1>
            <p className="text-sm text-cool-grey">Manage facilities, clinicians, and system preferences.</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { resetAdminDialog(); } }}>
            <DialogTrigger render={<Button className="touch-target-min" onClick={openAddDialog}><UserPlus className="mr-1 h-4 w-4" />Add Clinician</Button>} />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingClinician ? "Edit Clinician" : "Add Clinician"}</DialogTitle>
                <DialogDescription>{editingClinician ? `Editing ${editingClinician.full_name || editingClinician.email}` : "Create a new doctor or nurse account."}</DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); editingClinician ? handleEditClinician() : handleAddClinician(); }} noValidate className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="admin-fullName" className="text-sm font-medium text-slate">
                    Full name <span className="text-warm-amber">*</span>
                  </Label>
                  <Input
                    id="admin-fullName"
                    value={form.fullName}
                    onChange={(e) => {
                      const name = e.target.value;
                      if (editingClinician) {
                        setForm({ ...form, fullName: name });
                      } else {
                        const slug = name.toLowerCase().replace(/^dr\.?\s*/i, "").replace(/[^a-zA-Z0-9]/g, ".").replace(/\.+/g, ".").replace(/^\.|\.$/g, "");
                        const autoEmail = slug && facilityCode ? `${slug}@${facilityCode}.careflow.app` : "";
                        setForm({ ...form, fullName: name, email: autoEmail || form.email });
                      }
                    }}
                    onBlur={() => handleAdminBlur("fullName")}
                    placeholder="e.g. Dr. Jane Doe"
                    className="h-11"
                    aria-invalid={!!adminTouched.fullName && !!adminFieldErrors.fullName}
                    aria-describedby={adminFieldErrors.fullName ? "admin-fullName-error" : undefined}
                  />
                  {adminTouched.fullName && adminFieldErrors.fullName && <p id="admin-fullName-error" className="text-[11px] text-warm-amber">{adminFieldErrors.fullName}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="admin-email" className="text-sm font-medium text-slate">
                    Email <span className="text-warm-amber">*</span>
                  </Label>
                  <Input
                    id="admin-email"
                    value={form.email}
                    disabled={!!editingClinician}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    onBlur={() => handleAdminBlur("email")}
                    type="email"
                    inputMode="email"
                    placeholder="e.g. jane.doe@hospital.ng"
                    className="h-11"
                    aria-invalid={!!adminTouched.email && !!adminFieldErrors.email}
                    aria-describedby={adminFieldErrors.email ? "admin-email-error" : undefined}
                  />
                  {adminTouched.email && adminFieldErrors.email && <p id="admin-email-error" className="text-[11px] text-warm-amber">{adminFieldErrors.email}</p>}
                </div>

                {editingClinician && (
                  <div className="space-y-1.5">
                    <Label htmlFor="admin-password" className="text-sm font-medium text-slate">New Password</Label>
                    <Input
                      id="admin-password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      type="password"
                      placeholder="Leave blank to keep current"
                      className="h-11"
                      aria-describedby="admin-password-hint"
                    />
                    <p id="admin-password-hint" className="text-[11px] text-cool-grey">Leave blank to keep current password.</p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="admin-role" className="text-sm font-medium text-slate">
                    Role <span className="text-warm-amber">*</span>
                  </Label>
                  <Select
                    value={form.role}
                    onValueChange={(val) => { if (val) { setForm({ ...form, role: val }); setAdminTouched((prev) => ({ ...prev, role: true })); validateAdminField("role"); } }}
                  >
                    <SelectTrigger
                      id="admin-role"
                      className="h-11"
                      aria-invalid={!!adminTouched.role && !!adminFieldErrors.role}
                      aria-describedby={adminFieldErrors.role ? "admin-role-error" : undefined}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="nurse">Nurse</SelectItem>
                    </SelectContent>
                  </Select>
                  {adminTouched.role && adminFieldErrors.role && <p id="admin-role-error" className="text-[11px] text-warm-amber">{adminFieldErrors.role}</p>}
                </div>
              </form>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setDialogOpen(false); resetAdminDialog(); }} disabled={submitting}>Cancel</Button>
                <Button onClick={editingClinician ? handleEditClinician : handleAddClinician} disabled={submitting}>{submitting ? "Saving..." : editingClinician ? "Save Changes" : "Add Clinician"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-4 flex flex-shrink-0 flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cool-grey" />
            <input
              type="text"
              aria-label="Search clinicians"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate/30 bg-white px-3.5 pl-10 text-sm text-slate placeholder:text-cool-grey focus:border-clinical-teal focus:outline-none focus:ring-1 focus:ring-clinical-teal h-11"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            aria-label="Filter by role"
            className="h-11 rounded-lg border border-slate/30 bg-white px-3.5 text-sm text-slate shadow-sm focus:border-clinical-teal focus:outline-none focus:ring-1 focus:ring-clinical-teal"
          >
            <option value="all">All roles</option>
            <option value="doctor">Doctor</option>
            <option value="nurse">Nurse</option>
          </select>
        </div>

        <Card className="flex min-h-0 flex-1 flex-col border-slate/10">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center gap-2 text-base text-deep-navy">
              <User className="h-5 w-5 text-clinical-teal" />
              Clinicians ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col min-h-0 flex-1 overflow-hidden p-0">
            <div className="flex-1 min-h-0 overflow-auto">
              <div className="space-y-3 p-4 sm:hidden">
                {filtered.length === 0 ? (
                  <div className="rounded-lg border border-slate/10 bg-white p-8 text-center text-sm text-cool-grey">
                    No clinicians found.
                  </div>
                ) : (
                  filtered.map((c) => {
                    const badge = ROLE_BADGES[c.role] ?? { label: c.role, color: "bg-slate/10 text-slate" };
                    return (
                      <div key={c.user_id} className="rounded-lg border border-slate/10 bg-white p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate">{c.full_name || "—"}</p>
                            <p className="truncate text-xs text-cool-grey mt-0.5">{c.email}</p>
                          </div>
                          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.color}`}>{badge.label}</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-slate/10 pt-3">
                          <span className="text-xs text-cool-grey font-mono">
                            {new Date(c.created_at).toLocaleDateString("en-NG")}
                          </span>
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEditDialog(c)} className="touch-target-min rounded-md p-2 text-cool-grey hover:text-clinical-teal hover:bg-clinical-teal/5 transition-colors" aria-label={`Edit ${c.full_name || c.email}`}>
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDeleteClinician(c)} className="touch-target-min rounded-md p-2 text-cool-grey hover:text-red-500 hover:bg-red-50 transition-colors" aria-label={`Remove ${c.full_name || c.email}`}>
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="hidden sm:block">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-cool-off-white">
                    <tr className="border-b border-slate/10">
                      <th scope="col" className="px-3 py-2 font-semibold text-deep-navy sm:px-4 sm:py-3">Name</th>
                      <th scope="col" className="px-3 py-2 font-semibold text-deep-navy sm:px-4 sm:py-3">Email</th>
                      <th scope="col" className="px-3 py-2 font-semibold text-deep-navy sm:px-4 sm:py-3">Role</th>
                      <th scope="col" className="px-3 py-2 font-semibold text-deep-navy sm:px-4 sm:py-3">Joined</th>
                      <th scope="col" className="px-3 py-2 text-right font-semibold text-deep-navy sm:px-4 sm:py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={5} className="px-3 py-8 text-center text-cool-grey sm:px-4">No clinicians found.</td></tr>
                    ) : (
                      filtered.map((c, i) => {
                        const badge = ROLE_BADGES[c.role] ?? { label: c.role, color: "bg-slate/10 text-slate" };
                        return (
                          <tr key={c.user_id} className={`border-b border-slate/10 ${i % 2 === 0 ? "bg-white" : "bg-cool-off-white/50"}`}>
                            <td className="px-3 py-2 font-medium text-slate sm:px-4 sm:py-3">{c.full_name || "—"}</td>
                            <td className="px-3 py-2 text-cool-grey sm:px-4 sm:py-3">{c.email}</td>
                            <td className="px-3 py-2 sm:px-4 sm:py-3">
                              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.color}`}>{badge.label}</span>
                            </td>
                            <td className="px-3 py-2 text-xs text-cool-grey font-mono sm:px-4 sm:py-3">
                              {new Date(c.created_at).toLocaleDateString("en-NG")}
                            </td>
                            <td className="px-3 py-2 text-right sm:px-4 sm:py-3">
                              <div className="inline-flex items-center gap-1">
                                <button onClick={() => openEditDialog(c)} className="p-2.5 rounded-md text-cool-grey hover:text-clinical-teal hover:bg-clinical-teal/5 transition-colors" title="Edit clinician" aria-label={`Edit ${c.full_name || c.email}`}>
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button onClick={() => handleDeleteClinician(c)} className="p-2.5 rounded-md text-cool-grey hover:text-red-500 hover:bg-red-50 transition-colors" title="Remove clinician" aria-label={`Remove ${c.full_name || c.email}`}>
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={!!credentialsData} onOpenChange={(open) => { if (!open) setCredentialsData(null); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Clinician Created</DialogTitle>
              <DialogDescription>
                {credentialsData?.fullName} has been added. Share these credentials securely with the clinician.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="rounded-lg border border-slate/10 bg-cool-off-white p-3 font-mono text-xs space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-cool-grey shrink-0">Email:</span>
                  <span className="text-slate truncate min-w-0">{credentialsData?.email}</span>
                  <button
                    onClick={() => credentialsData && copyToClipboard(credentialsData.email, "email")}
                    className="shrink-0 rounded p-1 text-cool-grey hover:text-clinical-teal transition-colors"
                    title="Copy email"
                  >
                    {copiedField === "email" ? <Check className="h-3.5 w-3.5 text-clinical-teal" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-cool-grey shrink-0">Password:</span>
                  <span className="text-slate truncate min-w-0 font-bold tracking-wide">{credentialsData?.defaultPassword}</span>
                  <button
                    onClick={() => credentialsData && copyToClipboard(credentialsData.defaultPassword, "password")}
                    className="shrink-0 rounded p-1 text-cool-grey hover:text-clinical-teal transition-colors"
                    title="Copy password"
                  >
                    {copiedField === "password" ? <Check className="h-3.5 w-3.5 text-clinical-teal" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-cool-grey shrink-0 mt-0.5">Login URL:</span>
                  <span className="text-slate text-[10px] break-all leading-relaxed">{credentialsData?.loginUrl}</span>
                  <button
                    onClick={() => credentialsData && copyToClipboard(credentialsData.loginUrl, "url")}
                    className="shrink-0 rounded p-1 text-cool-grey hover:text-clinical-teal transition-colors"
                    title="Copy login URL"
                  >
                    {copiedField === "url" ? <Check className="h-3.5 w-3.5 text-clinical-teal" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={copyAllCredentials}
                  className="flex items-center gap-1.5 rounded-lg border border-slate/20 bg-white px-3 py-2 text-xs font-medium text-slate hover:bg-slate/5 transition-colors"
                >
                  {copiedField === "all" ? <Check className="h-3.5 w-3.5 text-clinical-teal" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy All
                </button>
                <button
                  onClick={regeneratePassword}
                  disabled={submitting}
                  className="flex items-center gap-1.5 rounded-lg border border-slate/20 bg-white px-3 py-2 text-xs font-medium text-slate hover:bg-slate/5 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${submitting ? "animate-spin" : ""}`} />
                  Regenerate Password
                </button>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setCredentialsData(null)}>
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
