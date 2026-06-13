import { NextResponse } from "next/server";
import { createServiceClient } from "@/services/supabase-server";
import { auth } from "@/lib/auth";
import { UserRole } from "@/types/schemas";
import { apiError, ErrorCodes } from "@/lib/error-codes";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.role) {
      return NextResponse.json(apiError(ErrorCodes.UNAUTHORIZED), { status: 401 });
    }

    if (session.user.role === UserRole.Admin) {
      return NextResponse.json(apiError(ErrorCodes.ROLE_NOT_PERMITTED), { status: 403 });
    }

    const supabase = createServiceClient();
    const facilityId = session.user.facilityId;

    if (!facilityId) {
      return NextResponse.json(
        apiError(ErrorCodes.ROLE_NOT_PERMITTED, { message: "No facility assigned to your account." }),
        { status: 403 },
      );
    }

    const { data, error } = await supabase
      .from("discharge_records")
      .select("status")
      .eq("facility_id", facilityId);

    if (error) {
      return NextResponse.json(apiError(ErrorCodes.SUPABASE_ERROR), { status: 500 });
    }

    const counts: Record<string, number> = { draft: 0, finalised: 0, archived: 0 };
    for (const row of data ?? []) {
      const s = row.status as string;
      if (s in counts) counts[s]++;
    }

    return NextResponse.json({
      success: true,
      data: {
        total: (data ?? []).length,
        draft: counts.draft,
        finalised: counts.finalised,
        archived: counts.archived,
      },
    });
  } catch {
    return NextResponse.json(apiError(ErrorCodes.SUPABASE_ERROR), { status: 500 });
  }
}
