"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Edit2, Trash2, UserPlus, User } from "lucide-react";
import { toast } from "sonner";

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

  async function handleAddClinician() {
    if (!form.fullName || !form.email || !form.password) {
      toast.error("Full name, email, and password are required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          role: form.role,
          facilityId,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`${form.fullName} added as ${form.role}`);
        setDialogOpen(false);
        setForm({ fullName: "", email: "", password: "", role: "doctor" });
        await refresh();
      } else {
        toast.error(json.error ?? "Failed to add clinician");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditClinician() {
    if (!form.fullName) {
      toast.error("Full name is required.");
      return;
    }
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
        setEditingClinician(null);
        setForm({ fullName: "", email: "", password: "", role: "doctor" });
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

  function openEditDialog(clinician: Clinician) {
    setEditingClinician(clinician);
    setForm({ fullName: clinician.full_name, email: clinician.email, password: "", role: clinician.role });
    setDialogOpen(true);
  }

  function openAddDialog() {
    setEditingClinician(null);
    setForm({ fullName: "", email: "", password: "", role: "doctor" });
    setDialogOpen(true);
  }

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
      <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-deep-navy sm:text-3xl">Facility Management</h1>
            <p className="text-sm text-cool-grey">Manage facilities, clinicians, and system preferences.</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingClinician(null); } }}>
            <DialogTrigger render={<Button className="touch-target-min bg-clinical-teal hover:bg-clinical-teal/90" onClick={openAddDialog}><UserPlus className="mr-1 h-4 w-4" />Add Clinician</Button>} />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingClinician ? "Edit Clinician" : "Add Clinician"}</DialogTitle>
                <DialogDescription>{editingClinician ? `Editing ${editingClinician.full_name || editingClinician.email}` : "Create a new doctor or nurse account."}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate">Full Name</label>
                  <Input value={form.fullName} onChange={(e) => {
                    const name = e.target.value;
                    if (editingClinician) {
                      setForm({ ...form, fullName: name });
                    } else {
                      const slug = name.toLowerCase().replace(/^dr\.?\s*/i, "").replace(/[^a-zA-Z0-9]/g, ".").replace(/\.+/g, ".").replace(/^\.|\.$/g, "");
                      const autoEmail = slug && facilityCode ? `${slug}@${facilityCode}.careflow.app` : "";
                      setForm({ ...form, fullName: name, email: autoEmail || form.email });
                    }
                  }} placeholder="e.g. Dr. Jane Doe" className="h-11" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate">Email</label>
                  <Input value={form.email} disabled={!!editingClinician} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" placeholder="e.g. jane.doe@hospital.ng" className="h-11" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate">{editingClinician ? "New Password (leave blank to keep current)" : "Temporary Password"}</label>
                  <Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" placeholder={editingClinician ? "Leave blank to keep current" : "Min. 8 characters"} className="h-11" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate">Role</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="h-11 w-full rounded-lg border border-slate/30 bg-white px-3 text-sm text-slate">
                    <option value="doctor">Doctor</option>
                    <option value="nurse">Nurse</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setDialogOpen(false); setEditingClinician(null); }} disabled={submitting}>Cancel</Button>
                <Button className="bg-clinical-teal hover:bg-clinical-teal/90" onClick={editingClinician ? handleEditClinician : handleAddClinician} disabled={submitting}>{submitting ? "Saving..." : editingClinician ? "Save Changes" : "Add Clinician"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        <Card className="border-slate/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-deep-navy">
              <User className="h-5 w-5 text-clinical-teal" />
              Clinicians ({clinicians.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate/10 bg-cool-off-white">
                    <th scope="col" className="px-4 py-3 font-semibold text-deep-navy">Name</th>
                    <th scope="col" className="px-4 py-3 font-semibold text-deep-navy">Email</th>
                    <th scope="col" className="px-4 py-3 font-semibold text-deep-navy">Role</th>
                    <th scope="col" className="px-4 py-3 font-semibold text-deep-navy">Joined</th>
                    <th scope="col" className="px-4 py-3 font-semibold text-deep-navy text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clinicians.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-cool-grey">No clinicians found.</td></tr>
                  ) : (
                    clinicians.map((c, i) => {
                      const badge = ROLE_BADGES[c.role] ?? { label: c.role, color: "bg-slate/10 text-slate" };
                      return (
                        <tr key={c.user_id} className={`border-b border-slate/10 ${i % 2 === 0 ? "bg-white" : "bg-cool-off-white/50"}`}>
                          <td className="px-4 py-3 font-medium text-slate">{c.full_name || "—"}</td>
                          <td className="px-4 py-3 text-cool-grey">{c.email}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.color}`}>{badge.label}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-cool-grey font-mono">
                            {new Date(c.created_at).toLocaleDateString("en-NG")}
                          </td>
                          <td className="px-4 py-3 text-right">
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
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
