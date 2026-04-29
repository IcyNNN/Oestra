import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return Response.json({ error: "Authentication required." }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("symptom_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("logged_on", { ascending: false })
      .limit(30);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ symptomLogs: data });
  } catch (error) {
    console.error("Symptom log fetch error:", error);
    return Response.json(
      { error: "Could not fetch symptom logs." },
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
      return Response.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await req.json();
    const { data, error } = await supabase
      .from("symptom_logs")
      .insert({
        user_id: user.id,
        logged_on: body.loggedOn,
        symptom: body.symptom,
        severity: body.severity,
        notes: body.notes ?? null,
      })
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ symptomLog: data });
  } catch (error) {
    console.error("Symptom log create error:", error);
    return Response.json(
      { error: "Could not create symptom log." },
      { status: 500 },
    );
  }
}
