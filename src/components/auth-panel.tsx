"use client";

import { FormEvent, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthPanelProps = {
  onUserChange: (user: User | null) => void;
};

export function AuthPanel({ onUserChange }: AuthPanelProps) {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      return;
    }

    const supabase = createSupabaseBrowserClient();

    if (mode === "sign-up") {
      setStatus("正在发送邮箱验证链接...");
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: true,
        },
      });

      if (error) {
        setStatus(error.message);
        return;
      }

      setStatus("验证链接已发送。请打开邮箱，回到 Oestra 设置密码。");
      setEmail("");
      return;
    }

    if (!password) {
      setStatus("请输入密码。");
      return;
    }

    setStatus("正在登录...");
    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (error) {
      setStatus(error.message);
      return;
    }

    setStatus(null);
    setEmail("");
    setPassword("");
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
      onSubmit={(event) => void handleAuth(event)}
      className="space-y-2 rounded-2xl border border-oestra-mist bg-white/35 p-3"
    >
      <p className="text-center text-xs text-oestra-purple/55">
        现在可匿名聊天；注册/登录后会保存你的对话与健康记录。
      </p>
      <div className="grid grid-cols-2 rounded-xl border border-oestra-mist bg-oestra-cream/80 p-1 text-xs">
        <button
          type="button"
          onClick={() => {
            setMode("sign-in");
            setStatus(null);
          }}
          className={`rounded-lg px-3 py-2 ${
            mode === "sign-in"
              ? "bg-white text-oestra-purple"
              : "text-oestra-purple/55"
          }`}
        >
          登录
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("sign-up");
            setStatus(null);
          }}
          className={`rounded-lg px-3 py-2 ${
            mode === "sign-up"
              ? "bg-white text-oestra-purple"
              : "text-oestra-purple/55"
          }`}
        >
          注册
        </button>
      </div>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.currentTarget.value)}
          placeholder="you@example.com"
          className="min-w-0 flex-1 rounded-xl border border-oestra-mist bg-oestra-cream/80 px-3 py-2 text-sm text-oestra-ink outline-none placeholder:text-oestra-purple/35"
        />
        {mode === "sign-in" ? (
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
            placeholder="密码"
            className="min-w-0 flex-1 rounded-xl border border-oestra-mist bg-oestra-cream/80 px-3 py-2 text-sm text-oestra-ink outline-none placeholder:text-oestra-purple/35"
          />
        ) : null}
        <button
          type="submit"
          className="rounded-xl bg-oestra-purple px-4 py-2 text-sm font-medium text-oestra-cream transition-colors hover:bg-oestra-purple/90"
        >
          {mode === "sign-up" ? "发送验证" : "登录"}
        </button>
      </div>
      {mode === "sign-up" ? (
        <p className="text-center text-xs text-oestra-purple/45">
          新用户会先收到邮箱验证链接，点开后再设置密码。
        </p>
      ) : null}
      {status ? (
        <p className="text-center text-xs text-oestra-purple/45">{status}</p>
      ) : null}
    </form>
  );
}
