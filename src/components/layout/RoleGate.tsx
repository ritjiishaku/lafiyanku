import type { ReactNode } from "react";
import type { UserRole } from "@/types/schemas";

interface RoleGateProps {
  allowedRoles: UserRole[];
  userRole?: UserRole;
  fallback?: ReactNode;
  children: ReactNode;
}

export function RoleGate({
  allowedRoles,
  userRole,
  fallback,
  children,
}: RoleGateProps) {
  if (!userRole || !allowedRoles.includes(userRole)) {
    return fallback ?? null;
  }

  return <>{children}</>;
}
