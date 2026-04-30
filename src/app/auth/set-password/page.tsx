"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("设置一个密码，以后就可以用邮箱和密码登录。");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < 8) {
      setMessage("密码至少需要 8 位。");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("两次输入的密码不一致。");
      return;
    }

    setIsSaving(true);
    setMessage("正在保存密码...");

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(error.message);
      setIsSaving(false);
      return;
    }

    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passwordSet: true }),
    });

    setMessage("账号创建成功，正在带你回到 Oestra...");
    router.replace("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-oestra-cream px-4 text-oestra-ink">
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="w-full max-w-sm space-y-4 rounded-3xl border border-oestra-mist bg-white/45 p-8"
      >
        <div className="text-center">
          <h1 className="font-serif text-4xl text-oestra-purple">Oestra</h1>
          <p className="mt-3 text-sm leading-7 text-oestra-purple/70">
            {message}
          </p>
        </div>

        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.currentTarget.value)}
          placeholder="设置密码"
          className="w-full rounded-xl border border-oestra-mist bg-oestra-cream/80 px-3 py-3 text-sm text-oestra-ink outline-none placeholder:text-oestra-purple/35"
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.currentTarget.value)}
          placeholder="再次输入密码"
          className="w-full rounded-xl border border-oestra-mist bg-oestra-cream/80 px-3 py-3 text-sm text-oestra-ink outline-none placeholder:text-oestra-purple/35"
        />

        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded-xl bg-oestra-purple px-4 py-3 text-sm font-medium text-oestra-cream transition-colors hover:bg-oestra-purple/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "保存中..." : "完成注册"}
        </button>

        <Link
          href="/"
          className="block text-center text-sm font-medium text-oestra-blush underline-offset-4 hover:underline"
        >
          回到首页
        </Link>
      </form>
    </main>
  );
}
