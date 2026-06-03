import "server-only";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";

declare module "@auth/core/types" {
  interface User {
    role?: string;
    facilityId?: string;
  }
  interface Session {
    user: {
      role?: string;
      facilityId?: string;
      id?: string;
    };
    expires: string;
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

const RATE_LIMIT_WINDOW = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(email: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(email);

  if (!record || now > record.resetAt) {
    loginAttempts.set(email, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }

  record.count++;
  if (record.count > RATE_LIMIT_MAX) {
    return true;
  }

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

        if (isRateLimited(email)) {
          throw new Error("RATE_LIMITED");
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error || !data.user) {
          return null;
        }

        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role, facility_id")
          .eq("user_id", data.user.id)
          .single();

        const fullName = data.user.user_metadata?.full_name as string | undefined;

        return {
          id: data.user.id,
          email: data.user.email,
          name: fullName ?? data.user.email,
          role: profile?.role ?? "nurse",
          facilityId: profile?.facility_id as string | undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as { role?: string; facilityId?: string };
        token.role = u.role;
        token.id = user.id;
        token.name = user.name;
        token.facilityId = u.facilityId;
      }
      return token;
    },
    async session({ session, token }) {
      const t = token as { role?: string; id?: string; facilityId?: string; name?: string };
      return {
        ...session,
        user: {
          ...session.user,
          role: t.role,
          id: t.id,
          name: t.name,
          facilityId: t.facilityId,
        },
      } as typeof session;
    },
  },
  session: {
    maxAge: 8 * 60 * 60,
  },
  pages: {
    signIn: "/auth",
  },
});
