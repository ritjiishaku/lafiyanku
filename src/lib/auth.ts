import "server-only";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";

declare module "@auth/core/types" {
  interface User {
    role?: string;
    facilityId?: string;
    mustChangePassword?: boolean;
  }
  interface Session {
    user: {
      role?: string;
      facilityId?: string;
      mustChangePassword?: boolean;
      id?: string;
      email?: string;
    };
    expires: string;
  }
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set",
    );
  }
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

async function isRateLimited(email: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

  const { count } = await supabase
    .from("rate_limits")
    .select("*", { count: "exact", head: true })
    .eq("identifier", email)
    .eq("action_type", "login")
    .gte("created_at", windowStart);

  if (count && count >= RATE_LIMIT_MAX) {
    return true;
  }

  await supabase.from("rate_limits").insert({
    identifier: email,
    action_type: "login",
    created_at: new Date().toISOString(),
  });

  return false;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) {
          return null;
        }

        if (await isRateLimited(email)) {
          throw new Error("RATE_LIMITED");
        }

        const supabase = getSupabaseClient();

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error || !data.user) {
          return null;
        }

        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role, facility_id, must_change_password")
          .eq("user_id", data.user.id)
          .single();

        const fullName = data.user.user_metadata?.full_name as string | undefined;

        return {
          id: data.user.id,
          email: data.user.email,
          name: fullName ?? data.user.email,
          role: profile?.role ?? "nurse",
          facilityId: profile?.facility_id as string | undefined,
          mustChangePassword: profile?.must_change_password ?? false,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as { role?: string; facilityId?: string; mustChangePassword?: boolean };
        token.role = u.role;
        token.id = user.id;
        token.name = user.name;
        token.facilityId = u.facilityId;
        token.mustChangePassword = u.mustChangePassword;
      }
      return token;
    },
    async session({ session, token }) {
      const t = token as { role?: string; id?: string; facilityId?: string; name?: string; mustChangePassword?: boolean };
      return {
        ...session,
        user: {
          ...session.user,
          role: t.role,
          id: t.id,
          name: t.name,
          facilityId: t.facilityId,
          mustChangePassword: t.mustChangePassword,
        },
      } as typeof session;
    },
  },
  session: {
    maxAge: 8 * 60 * 60,
  },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
});
