"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useRole } from "@/hooks/useRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Hospital, User } from "lucide-react";

export default function SettingsPage() {
  const { role, userId } = useRole();

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-deep-navy sm:text-3xl">
            Settings
          </h1>
          <p className="text-sm text-cool-grey">
            Manage your account and facility preferences
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-deep-navy">
              <User className="h-5 w-5 text-clinical-teal" />
              My Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate">
            <p>
              <span className="font-medium text-cool-grey">Role:</span>{" "}
              {role ? role.charAt(0).toUpperCase() + role.slice(1) : "—"}
            </p>
            <p>
              <span className="font-medium text-cool-grey">User ID:</span>{" "}
              <span className="font-mono text-xs">{userId ?? "—"}</span>
            </p>
          </CardContent>
        </Card>

        {role === "admin" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-deep-navy">
                <Hospital className="h-5 w-5 text-clinical-teal" />
                Facility Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-cool-grey">
                Facility profile configuration and user management will be
                available here. Admins can add clinicians, manage facility
                details, and configure system preferences.
              </p>
            </CardContent>
          </Card>
        )}

        {role === "admin" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-deep-navy">
                <Shield className="h-5 w-5 text-clinical-teal" />
                NDPR Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-cool-grey">
                Audit logs, data retention policies, and consent management
                settings will be available here.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
