import { createServiceClient } from "./supabase-server";

/**
 * Check and record a rate limit entry.
 * Returns true if the request should be blocked (rate limited).
 *
 * @param identifier - The unique identifier (e.g., user ID, email, IP)
 * @param actionType - The action being rate limited (e.g., "generate", "password_reset")
 * @param maxAttempts - Maximum allowed attempts within the window
 * @param windowMs - Time window in milliseconds
 */
export async function checkRateLimit(
  identifier: string,
  actionType: string,
  maxAttempts: number,
  windowMs: number,
): Promise<{ limited: boolean; remaining: number }> {
  const supabase = createServiceClient();
  const windowStart = new Date(Date.now() - windowMs).toISOString();

  const { count } = await supabase
    .from("rate_limits")
    .select("*", { count: "exact", head: true })
    .eq("identifier", identifier)
    .eq("action_type", actionType)
    .gte("created_at", windowStart);

  const currentCount = count ?? 0;

  if (currentCount >= maxAttempts) {
    return { limited: true, remaining: 0 };
  }

  await supabase.from("rate_limits").insert({
    identifier,
    action_type: actionType,
    created_at: new Date().toISOString(),
  });

  return { limited: false, remaining: maxAttempts - currentCount - 1 };
}
