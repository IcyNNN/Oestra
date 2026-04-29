"use client";

import { KeyboardEvent, useMemo, useRef } from "react";
import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { ArrowUp, Sparkles } from "lucide-react";

import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function messageText(parts: { type: string; text?: string }[]) {
  return parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export default function Home() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    [],
  );
  const { messages, sendMessage, status, error } = useChat({ transport });

  const isSending = status === "submitted" || status === "streaming";

  async function sendCurrentMessage() {
    const text = textareaRef.current?.value.trim() ?? "";
    if (!text || isSending) {
      return;
    }

    if (textareaRef.current) {
      textareaRef.current.value = "";
    }
    await sendMessage({ text });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendCurrentMessage();
    }
  }

  return (
    <main className="flex min-h-screen bg-oestra-cream px-4 py-6 text-oestra-ink sm:px-6">
      <Card className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border-oestra-mist/80 bg-oestra-cream/80 p-0 shadow-[0_18px_70px_rgba(61,43,78,0.08)]">
        <header className="px-6 pb-5 pt-7 text-center sm:px-8">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-oestra-mist bg-white/55 text-oestra-blush">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </div>
          <h1 className="font-serif text-5xl font-semibold tracking-wide text-oestra-purple">
            Oestra
          </h1>
          <p className="mt-2 text-sm uppercase tracking-[0.34em] text-oestra-purple/55">
            a quiet revolution
          </p>
        </header>

        <Separator className="bg-oestra-mist/80" />

        <ScrollArea className="min-h-0 flex-1">
          <section className="flex min-h-[48vh] flex-col gap-5 px-4 py-6 sm:px-7">
            {messages.length === 0 ? (
              <div className="flex flex-1 items-center justify-center text-center">
                <p className="max-w-xs text-lg leading-8 text-oestra-purple/70">
                  嗨，我在这里。今天想聊聊什么？
                </p>
              </div>
            ) : (
              messages.map((message) => {
                const isUser = message.role === "user";
                const text = messageText(message.parts);

                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex items-start gap-3",
                      isUser && "justify-end",
                    )}
                  >
                    {!isUser && (
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-oestra-purple text-xs font-semibold text-oestra-cream">
                        O
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[82%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-7 sm:text-base",
                        isUser
                          ? "bg-white/80 text-oestra-purple"
                          : "bg-oestra-mist/55 text-oestra-ink",
                      )}
                    >
                      {text}
                    </div>
                  </div>
                );
              })
            )}
          </section>
        </ScrollArea>

        {error ? (
          <p className="px-6 pb-2 text-sm text-oestra-blush">
            {error.message || "Oestra 暂时没有回应，请稍后再试。"}
          </p>
        ) : null}

        <div className="border-t border-oestra-mist/80 bg-white/35 p-4 sm:p-5">
          <div className="flex items-end gap-3 rounded-2xl border border-oestra-mist bg-oestra-cream/75 p-3">
            <textarea
              ref={textareaRef}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              rows={1}
              placeholder="写下你现在的感受..."
              className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-1 py-2 text-base leading-6 text-oestra-ink outline-none placeholder:text-oestra-purple/35 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => void sendCurrentMessage()}
              disabled={isSending}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-oestra-purple p-0 text-oestra-cream transition-colors hover:bg-oestra-purple/90 disabled:cursor-not-allowed disabled:opacity-45"
              aria-label="发送消息"
            >
              <ArrowUp className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <p className="mt-3 text-center text-xs text-oestra-purple/45">
            Oestra 不能替代医生；严重或持续的不适请咨询专业医生。
          </p>
        </div>
      </Card>
    </main>
  );
}
