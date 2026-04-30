"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("正在确认你的邮箱...");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const code = searchParams.get("code");

    async function confirmEmail() {
      const { data, error } = code
        ? await supabase.auth.exchangeCodeForSession(code)
        : await supabase.auth.getSession();

      if (error || !data.session) {
        setMessage("登录链接已失效或无法确认，请回到首页重新发送。");
        return;
      }

      await fetch("/api/profile", { method: "POST" });
      router.replace("/auth/set-password");
    }

    void confirmEmail();
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-oestra-cream px-4 text-oestra-ink">
      <div className="max-w-sm rounded-3xl border border-oestra-mist bg-white/45 p-8 text-center">
        <h1 className="font-serif text-4xl text-oestra-purple">Oestra</h1>
        <p className="mt-4 text-sm leading-7 text-oestra-purple/70">{message}</p>
        <Link
          href="/"
          className="mt-6 inline-flex text-sm font-medium text-oestra-blush underline-offset-4 hover:underline"
        >
          回到首页
        </Link>
      </div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-oestra-cream px-4 text-oestra-ink">
          <div className="max-w-sm rounded-3xl border border-oestra-mist bg-white/45 p-8 text-center">
            <h1 className="font-serif text-4xl text-oestra-purple">Oestra</h1>
            <p className="mt-4 text-sm leading-7 text-oestra-purple/70">
              正在确认你的邮箱...
            </p>
          </div>
        </main>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
