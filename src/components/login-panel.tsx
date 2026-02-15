"use client";

import Image from "next/image";
import { useState } from "react";
import { createLnkError, normalizeError } from "@/lib/lnk/error-catalog";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "./toast-provider";

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
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-x-hidden bg-background-light text-[#111118] selection:bg-primary/20 selection:text-primary">
      <div className="animate-float pointer-events-none absolute top-24 -left-24 size-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="animate-float-slow pointer-events-none absolute top-[38rem] -right-24 size-80 rounded-full bg-indigo-200/40 blur-3xl" />
      <nav className="glass-nav fixed top-0 right-0 left-0 z-50 border-b border-primary/5">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="animate-fade-in rounded-lg bg-primary p-1.5 shadow-lg shadow-primary/20">
              <svg
                className="size-6 text-white"
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span className="text-xl font-extrabold tracking-tight">Link Nest</span>
          </div>
          <div className="hidden items-center gap-10 md:flex">
            <a className="text-sm font-semibold transition-colors hover:text-primary" href="#features">
              Features
            </a>
            <a className="text-sm font-semibold transition-colors hover:text-primary" href="#">
              Pricing
            </a>
            <a className="text-sm font-semibold transition-colors hover:text-primary" href="#">
              Resources
            </a>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onLogin}
              disabled={loading}
              className="hidden rounded-lg px-4 py-2 text-sm font-bold transition-colors hover:bg-primary/5 disabled:opacity-60 sm:block"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={onLogin}
              disabled={loading}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Redirecting..." : "Get Started"}
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        <section className="relative overflow-hidden px-6 pt-20 pb-16 md:pt-32 md:pb-32">
          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <div className="animate-fade-up mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold tracking-widest text-primary uppercase">
              <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2l1.6 4.4L18 8l-4.4 1.6L12 14l-1.6-4.4L6 8l4.4-1.6L12 2zm6 10l.9 2.6L21.5 16l-2.6.9L18 19.5l-.9-2.6L14.5 16l2.6-.9L18 12zm-12 1l.7 2L8.8 16l-2.1.7L6 18.8l-.7-2L3.2 16l2.1-.7L6 13z" />
              </svg>
              Smart Bookmarking for Modern Minds
            </div>
            <h1 className="animate-fade-up delay-100 mb-8 text-5xl leading-[1.1] font-black tracking-[-0.04em] text-[#111118] md:text-7xl">
              Save what matters.
              <br />
              <span className="text-primary">Organized in one place.</span>
            </h1>
            <p className="animate-fade-up delay-200 mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[#616189] md:text-xl">
              The simplest way to manage your private bookmarks with Google Sign-in. Curate your digital
              library with zero friction.
            </p>
            <div className="animate-fade-up delay-300 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                type="button"
                onClick={onLogin}
                disabled={loading}
                className="group flex w-full items-center justify-center gap-3 rounded-xl border border-[#dbdbe6] bg-white px-8 py-4 font-bold text-[#111118] shadow-sm transition-all hover:border-primary/50 disabled:opacity-60 sm:w-auto"
              >
                <svg className="size-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>{loading ? "Redirecting..." : "Continue with Google"}</span>
              </button>
              <button
                type="button"
                className="w-full px-8 py-4 font-bold text-[#616189] transition-colors hover:text-[#111118] sm:w-auto"
              >
                View Demo
              </button>
            </div>
            <div className="animate-fade-up delay-400 mt-8 flex items-center justify-center gap-2 text-sm font-medium text-[#616189]">
              <span className="flex -space-x-2">
                <span className="size-6 rounded-full border-2 border-white bg-blue-100" />
                <span className="size-6 rounded-full border-2 border-white bg-indigo-100" />
                <span className="size-6 rounded-full border-2 border-white bg-purple-100" />
              </span>
              Join 10,000+ early adopters
            </div>
          </div>

          <div className="animate-fade-up delay-500 relative mx-auto mt-20 max-w-6xl px-4 md:mt-32">
            <div className="from-background-light pointer-events-none absolute inset-x-0 -top-20 bottom-0 z-10 bg-gradient-to-t via-transparent to-transparent" />
            <div className="rounded-2xl border border-primary/10 bg-white/50 p-3 shadow-2xl backdrop-blur-sm">
              <div className="overflow-hidden rounded-xl border border-[#dbdbe6] bg-white shadow-inner">
                <div className="flex items-center justify-between border-b border-[#dbdbe6] bg-[#f8f8fa] p-4">
                  <div className="flex gap-1.5">
                    <div className="size-3 rounded-full bg-red-400" />
                    <div className="size-3 rounded-full bg-yellow-400" />
                    <div className="size-3 rounded-full bg-green-400" />
                  </div>
                  <div className="h-6 w-48 rounded-lg bg-[#dbdbe6]/40" />
                  <div className="size-6 rounded-full bg-[#dbdbe6]/40" />
                </div>
                <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3 md:p-10">
                  <div className="group hover-lift relative overflow-hidden rounded-xl border border-[#dbdbe6] bg-white shadow-sm transition-all hover:shadow-md">
                    <div className="aspect-video overflow-hidden bg-[#f0f0f5]">
                      <Image
                        alt="Design Portfolio"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        src="https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=800"
                        width={800}
                        height={450}
                      />
                    </div>
                    <div className="p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <div className="size-4 rounded bg-pink-500" />
                        <span className="text-[10px] font-bold tracking-wider text-[#616189] uppercase">
                          Design
                        </span>
                      </div>
                      <h4 className="mb-1 text-sm font-bold text-[#111118]">Modern UI/UX Trends 2024</h4>
                      <p className="line-clamp-1 text-xs text-[#616189]">dribbble.com/portfolio-inspiration</p>
                    </div>
                  </div>

                  <div className="group hover-lift relative overflow-hidden rounded-xl border border-[#dbdbe6] bg-white shadow-sm transition-all hover:shadow-md">
                    <div className="flex aspect-video items-center justify-center bg-[#0f172a] p-4">
                      <div className="flex h-full w-full flex-col gap-1.5 overflow-hidden rounded border border-white/10 bg-white/5 p-2">
                        <div className="h-1.5 w-1/2 rounded bg-blue-400/30" />
                        <div className="h-1.5 w-3/4 rounded bg-white/10" />
                        <div className="h-1.5 w-2/3 rounded bg-white/10" />
                        <div className="mt-auto h-4 w-full rounded border border-primary/30 bg-primary/20" />
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <div className="size-4 rounded bg-indigo-500" />
                        <span className="text-[10px] font-bold tracking-wider text-[#616189] uppercase">
                          Dev Tools
                        </span>
                      </div>
                      <h4 className="mb-1 text-sm font-bold text-[#111118]">API Documentation Kit</h4>
                      <p className="line-clamp-1 text-xs text-[#616189]">github.com/dev-resources</p>
                    </div>
                  </div>

                  <div className="group hover-lift relative overflow-hidden rounded-xl border border-[#dbdbe6] bg-white shadow-sm transition-all hover:shadow-md">
                    <div className="aspect-video overflow-hidden bg-[#f0f0f5]">
                      <Image
                        alt="Productivity"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=800"
                        width={800}
                        height={450}
                      />
                    </div>
                    <div className="p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <div className="size-4 rounded bg-emerald-500" />
                        <span className="text-[10px] font-bold tracking-wider text-[#616189] uppercase">
                          Article
                        </span>
                      </div>
                      <h4 className="mb-1 text-sm font-bold text-[#111118]">The Deep Work Method</h4>
                      <p className="line-clamp-1 text-xs text-[#616189]">medium.com/productivity-lab</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="animate-fade-up bg-white px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-20 text-center">
              <h2 className="mb-4 text-3xl font-black tracking-tight md:text-5xl">Simplify your digital life</h2>
              <p className="mx-auto max-w-2xl text-lg text-[#616189]">
                Designed for speed and privacy, Link Nest helps you curate your own corner of the internet without
                the clutter.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
              <div className="group hover-lift">
                <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-transform group-hover:scale-110">
                  <svg className="size-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2l7 3v6c0 4.5-3 8.7-7 10-4-1.3-7-5.5-7-10V5l7-3zm0 4a3 3 0 100 6 3 3 0 000-6z" />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-bold">Private by Design</h3>
                <p className="leading-relaxed text-[#616189]">
                  Your data is encrypted and yours alone. No tracking, no ads, no algorithms-just your links stored
                  securely in your private cloud.
                </p>
              </div>

              <div className="group hover-lift">
                <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-transform group-hover:scale-110">
                  <svg className="size-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M13 2L5 14h5l-1 8 8-12h-5l1-8z" />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-bold">One-Click Save</h3>
                <p className="leading-relaxed text-[#616189]">
                  Save any page instantly with our browser extension or mobile share sheet. Organize into nests with
                  just a single tap.
                </p>
              </div>

              <div className="group hover-lift">
                <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-transform group-hover:scale-110">
                  <svg className="size-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M7 7h10l-2.5-2.5L16 3l5 5-5 5-1.5-1.5L17 9H7V7zm10 10H7l2.5 2.5L8 21l-5-5 5-5 1.5 1.5L7 15h10v2z" />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-bold">Cloud Sync</h3>
                <p className="leading-relaxed text-[#616189]">
                  Access your entire library from any device, anytime. Whether on your laptop or phone, everything
                  stays perfectly in sync.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="animate-fade-up px-6 py-24">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-primary p-12 text-center shadow-2xl shadow-primary/30 md:p-20">
            <div
              className="pointer-events-none absolute inset-0 opacity-10"
              aria-label="Subtle white dot pattern on primary blue background"
              style={{
                backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
            <h2 className="relative z-10 mb-8 text-3xl font-black text-white md:text-5xl">
              Experience the better way
              <br />
              to bookmark
            </h2>
            <div className="relative z-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                type="button"
                onClick={onLogin}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-10 py-4 font-bold text-primary shadow-lg transition-all hover:scale-105 disabled:opacity-60 sm:w-auto"
              >
                <svg className="size-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>{loading ? "Redirecting..." : "Join with Google"}</span>
              </button>
              <p className="text-sm font-medium text-white/80">Free forever for personal use.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#dbdbe6] bg-white px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1 text-white">
              <svg className="size-4" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span className="text-lg font-extrabold tracking-tight">Link Nest</span>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-sm font-semibold text-[#616189]">
            <a className="transition-colors hover:text-primary" href="#">
              Privacy Policy
            </a>
            <a className="transition-colors hover:text-primary" href="#">
              Terms of Service
            </a>
            <a className="transition-colors hover:text-primary" href="#">
              Twitter
            </a>
            <a className="transition-colors hover:text-primary" href="#">
              Support
            </a>
          </div>
          <p className="text-sm text-[#616189]">© 2024 Link Nest. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}


