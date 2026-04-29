import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return Response.json({ error: "Please sign in first." }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("cycle_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("cycle_start_date", { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ cycleLogs: data ?? [] });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Cycle logs could not be loaded.",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return Response.json({ error: "Please sign in first." }, { status: 401 });
    }

    const body = await req.json();
    const { data, error } = await supabase
      .from("cycle_logs")
      .insert({
        user_id: user.id,
        cycle_start_date: body.cycleStartDate,
        cycle_end_date: body.cycleEndDate || null,
        notes: body.notes || null,
      })
      .select("*")
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ cycleLog: data });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Cycle log could not be saved.",
      },
      { status: 500 },
    );
  }
}
