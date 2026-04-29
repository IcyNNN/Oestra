import { anthropic } from "@ai-sdk/anthropic"
import { convertToModelMessages, streamText, type UIMessage } from "ai"

import { getMessageText } from "@/lib/chat"
import { createSupabaseServerClient } from "@/lib/supabase/server"

const SYSTEM_PROMPT = `You are Oestra, an AI companion for women's hormonal health.
You speak gently, with care, and always with a sister-like warmth.
Don't give medical diagnoses. Always suggest consulting a doctor for serious concerns.
For now, this is a minimal placeholder. The full personality system prompt will come later.`

export async function POST(req: Request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json(
        {
          error:
            "Oestra is missing an Anthropic API key. Please add ANTHROPIC_API_KEY to .env.local.",
        },
        { status: 500 }
      )
    }

    const {
      messages,
      sessionId,
    }: { messages: UIMessage[]; sessionId?: string } = await req.json()
    const latestUserMessage = messages.findLast(
      (message) => message.role === "user"
    )
    const latestUserText = latestUserMessage
      ? getMessageText(latestUserMessage.parts)
      : ""

    const result = streamText({
      model: anthropic("claude-sonnet-4-5-20250929"),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      async onFinish({ text }) {
        if (!sessionId || !latestUserText) {
          return
        }

        const supabase = await createSupabaseServerClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          return
        }

        const { data: session } = await supabase
          .from("chat_sessions")
          .select("id")
          .eq("id", sessionId)
          .eq("user_id", user.id)
          .maybeSingle()

        if (!session) {
          return
        }

        await supabase.from("chat_messages").insert([
          {
            session_id: sessionId,
            user_id: user.id,
            role: "user",
            content: latestUserText,
          },
          {
            session_id: sessionId,
            user_id: user.id,
            role: "assistant",
            content: text,
          },
        ])

        await supabase
          .from("chat_sessions")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", sessionId)
          .eq("user_id", user.id)
      },
    })

    return result.toUIMessageStreamResponse({
      onError: () =>
        "Oestra is having trouble answering right now. Please try again in a moment.",
    })
  } catch (error) {
    console.error("Chat route error:", error)

    return Response.json(
      {
        error:
          "Oestra is having trouble answering right now. Please try again in a moment.",
      },
      { status: 500 }
    )
  }
}
