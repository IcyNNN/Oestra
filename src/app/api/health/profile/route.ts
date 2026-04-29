import { createSupabaseServerClient } from "@/lib/supabase/server";

type HormoneProfilePayload = {
  averageCycleLengthDays?: number | null;
  typicalPeriodLengthDays?: number | null;
  notes?: string | null;
};

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return Response.json({ error: "Please sign in first." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("hormone_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ profile: data });
}

export async function PUT(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return Response.json({ error: "Please sign in first." }, { status: 401 });
  }

  const body = (await req.json()) as HormoneProfilePayload;
  const { data, error } = await supabase
    .from("hormone_profiles")
    .upsert(
      {
        user_id: user.id,
        average_cycle_length_days: body.averageCycleLengthDays ?? null,
        typical_period_length_days: body.typicalPeriodLengthDays ?? null,
        notes: body.notes ?? null,
      },
      { onConflict: "user_id" },
    )
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ profile: data });
}
