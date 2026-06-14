import { useSession } from "next-auth/react";
import type { UserRole } from "@/types/schemas";

export function useRole() {
  const { data: session, status } = useSession();

  const user = session?.user as
    | {
        role?: string;
        id?: string;
        name?: string;
        facilityId?: string;
        mustChangePassword?: boolean;
      }
    | undefined;

  return {
    role: (user?.role as UserRole) ?? null,
    userId: user?.id ?? null,
    userName: user?.name ?? null,
    facilityId: user?.facilityId ?? null,
    mustChangePassword: user?.mustChangePassword ?? false,
    isLoading: status === "loading",
  };
}
