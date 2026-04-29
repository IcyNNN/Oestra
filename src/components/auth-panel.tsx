"use client";

import { FormEvent, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthPanelProps = {
  onUserChange: (user: User | null) => void;
};

export function AuthPanel({ onUserChange }: AuthPanelProps) {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getUser().then(({ data }) => {
      if (!isMounted) {
        return;
      }

      setUser(data.user);
      onUserChange(data.user);
      setIsLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      onUserChange(session?.user ?? null);
    });
    const { subscription } = data;

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [onUserChange]);

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      return;
    }

    setStatus("正在发送登录链接...");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setStatus(error.message);
      return;
    }

    setStatus("登录链接已发送，请检查邮箱。");
    setEmail("");
  }

  async function handleSignOut() {
    setStatus("正在退出...");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      setStatus(error.message);
      return;
    }

    setStatus(null);
  }

  if (isLoading) {
    return (
      <p className="text-center text-xs text-oestra-purple/45">
        正在检查登录状态...
      </p>
    );
  }

  if (user) {
    return (
      <div className="space-y-2 rounded-2xl border border-oestra-mist bg-white/35 p-3 text-center">
        <p className="text-xs text-oestra-purple/60">
          已登录：{user.email ?? "Oestra user"}。你的对话会保存到 Supabase。
        </p>
        <button
          type="button"
          onClick={() => void handleSignOut()}
          className="text-xs font-medium text-oestra-blush underline-offset-4 hover:underline"
        >
          退出登录
        </button>
        {status ? <p className="text-xs text-oestra-purple/45">{status}</p> : null}
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => void handleSignIn(event)}
      className="space-y-2 rounded-2xl border border-oestra-mist bg-white/35 p-3"
    >
      <p className="text-center text-xs text-oestra-purple/55">
        现在可匿名聊天；登录后会保存你的对话与健康记录。
      </p>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.currentTarget.value)}
          placeholder="you@example.com"
          className="min-w-0 flex-1 rounded-xl border border-oestra-mist bg-oestra-cream/80 px-3 py-2 text-sm text-oestra-ink outline-none placeholder:text-oestra-purple/35"
        />
        <button
          type="submit"
          className="rounded-xl bg-oestra-purple px-4 py-2 text-sm font-medium text-oestra-cream transition-colors hover:bg-oestra-purple/90"
        >
          登录
        </button>
      </div>
      {status ? <p className="text-center text-xs text-oestra-purple/45">{status}</p> : null}
    </form>
  );
}
