import { useState } from "react";
import type { UserRole } from "@/types/schemas";

export function useRole() {
  const [role] = useState<UserRole | null>(null);
  const [userId] = useState<string | null>(null);

  return { role, userId, isLoading: false };
}
