import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return Response.json(
      {
        error: "Sign in to save this conversation.",
      },
      { status: 401 },
    );
  }

  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({ user_id: user.id })
    .select("id")
    .single();

  if (error) {
    console.error("Create chat session error:", error);

    return Response.json(
      {
        error: "Oestra could not start a saved conversation.",
      },
      { status: 500 },
    );
  }

  return Response.json({ sessionId: data.id });
}
