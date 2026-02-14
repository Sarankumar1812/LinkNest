"use client";

import { createClient } from "@/lib/supabase/client";
import { useToast } from "./toast-provider";
import { createLnkError, normalizeError } from "@/lib/lnk/error-catalog";
import { useState } from "react";

export function LoginPanel() {
  const [loading, setLoading] = useState(false);
  const { pushToast } = useToast();

  const onLogin = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const origin = window.location.origin;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) {
        throw createLnkError({
          apiName: "LNK1101CreateAccount",
          sequence: "01",
          title: "OAuthRedirectFailed",
          developerMessage: error.message,
          userMessage: "Could not redirect to Google login. Please retry.",
        });
      }
    } catch (error) {
      const normalized = normalizeError("LNK1101CreateAccount", error);
      pushToast({
        kind: "error",
        title: normalized.detail.title,
        code: normalized.detail.code,
        description: normalized.detail.userMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-4">
      <div className="w-full rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500">
          LINK NEST
        </p>
        <h1 className="mt-2 text-3xl font-bold text-zinc-900">
          Smart Bookmark App
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Sign in using Google to manage private bookmarks with realtime updates.
        </p>
        <button
          type="button"
          onClick={onLogin}
          disabled={loading}
          className="mt-6 w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-60"
        >
          {loading ? "Redirecting..." : "Continue with Google"}
        </button>
      </div>
    </div>
  );
}
