import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return Response.json({ user: null, profile: null }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, email, display_name, password_set_at, created_at, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    user: {
      id: user.id,
      email: user.email,
    },
    profile,
  });
}

async function upsertProfile(req?: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    displayName,
    passwordSet,
  }: { displayName?: string; passwordSet?: boolean } = req
    ? await req.json()
    : {};
  const { data: profile, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email: user.email,
        display_name: displayName?.trim() || null,
        ...(passwordSet ? { password_set_at: new Date().toISOString() } : {}),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    )
    .select("id, email, display_name, password_set_at, created_at, updated_at")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ profile });
}

export async function POST() {
  return upsertProfile();
}

export async function PUT(req: Request) {
  return upsertProfile(req);
}

