import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.getSession();

    if (error) {
      return Response.json(
        {
          ok: false,
          error: error.message,
        },
        { status: 500 },
      );
    }

    return Response.json({
      ok: true,
      message: "Supabase connection is configured.",
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Supabase connection could not be verified.",
      },
      { status: 500 },
    );
  }
}
