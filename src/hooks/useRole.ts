import { useSession } from "next-auth/react";
import type { UserRole } from "@/types/schemas";

export function useRole() {
  const { data: session, status } = useSession();
  return {
    role: (session?.user?.role as UserRole) ?? null,
    userId: session?.user?.id ?? null,
    isLoading: status === "loading",
  };
}
