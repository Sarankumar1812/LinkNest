"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LNK_BOOKMARK_COLUMN, LNK_TABLE } from "@/lib/lnk/db-schema";
import { useToast } from "./toast-provider";
import { LnkHttpError, parseLnkResponse } from "@/lib/lnk/http";
import type { LnkBookmarkRow } from "@/lib/lnk/types";

type Props = {
  userId: string;
  userEmail: string;
  userName?: string | null;
};

type ListBookmarksResponse = {
  bookmarks: LnkBookmarkRow[];
};

type CreateBookmarkResponse = {
  bookmark: LnkBookmarkRow;
};

type ViewMode = "grid" | "list";
type PreviewState = 0 | 1 | 2;
type SortOption = "newest" | "oldest" | "title_asc" | "title_desc" | "domain_asc";

function getHost(url: string) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

function getFaviconUrl(url: string) {
  const host = getHost(url);
  return `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(host)}`;
}

function getPreviewImageUrl(url: string) {
  return `https://image.thum.io/get/width/1000/crop/560/noanimate/${encodeURIComponent(url)}`;
}

function getRelevantFallbackImageUrl(url: string, title: string) {
  const host = getHost(url).split(".")[0] ?? "website";
  const query = encodeURIComponent(`${host} ${title}`);
  return `https://source.unsplash.com/1200x700/?${query}`;
}

function BrandSparkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function BookmarkDashboard({ userId, userEmail, userName }: Props) {
  const [bookmarks, setBookmarks] = useState<LnkBookmarkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [pendingDelete, setPendingDelete] = useState<LnkBookmarkRow | null>(null);
  const [previewStateById, setPreviewStateById] = useState<Record<string, PreviewState>>({});
  const { pushToast } = useToast();
  const router = useRouter();

  const fetchBookmarks = useCallback(async () => {
    try {
      const response = await fetch("/api/LNK1202ListBookmarks", {
        method: "GET",
        cache: "no-store",
      });

      const data = await parseLnkResponse<ListBookmarksResponse>(response);
      setBookmarks(data.bookmarks);
    } catch (error) {
      if (error instanceof LnkHttpError) {
        pushToast({
          kind: "error",
          title: error.payload.errorTitle,
          code: error.payload.errorCode,
          description: error.payload.userMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  useEffect(() => {
    void fetchBookmarks();
  }, [fetchBookmarks]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("lnk-bookmarks")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: LNK_TABLE.BOOKMARK,
          filter: `${LNK_BOOKMARK_COLUMN.USER_ID}=eq.${userId}`,
        },
        () => {
          void fetchBookmarks();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [fetchBookmarks, userId]);

  const onCreateBookmark = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch("/api/LNK1201CreateBookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url }),
      });
      const data = await parseLnkResponse<CreateBookmarkResponse>(response);
      setTitle("");
      setUrl("");
      setBookmarks((current) => [data.bookmark, ...current]);
      pushToast({
        kind: "success",
        title: "BookmarkCreated",
        code: "LNK120100",
        description: "Bookmark saved successfully.",
      });
    } catch (error) {
      if (error instanceof LnkHttpError) {
        pushToast({
          kind: "error",
          title: error.payload.errorTitle,
          code: error.payload.errorCode,
          description: error.payload.userMessage,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const onDeleteBookmark = async (bookmarkId: string) => {
    setDeleteBusy(true);
    try {
      const response = await fetch("/api/LNK1203DeleteBookmark", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookmarkId }),
      });
      await parseLnkResponse<{ deletedBookmarkId: string }>(response);
      setBookmarks((current) =>
        current.filter((bookmark) => bookmark[LNK_BOOKMARK_COLUMN.ID] !== bookmarkId),
      );
      setPendingDelete(null);
      pushToast({
        kind: "success",
        title: "BookmarkDeleted",
        code: "LNK120300",
        description: "Bookmark deleted successfully.",
      });
    } catch (error) {
      if (error instanceof LnkHttpError) {
        pushToast({
          kind: "error",
          title: error.payload.errorTitle,
          code: error.payload.errorCode,
          description: error.payload.userMessage,
        });
      }
    } finally {
      setDeleteBusy(false);
    }
  };

  const onSignOut = async () => {
    try {
      const response = await fetch("/api/LNK1102SignOut", {
        method: "POST",
      });
      await parseLnkResponse<{ signedOut: boolean }>(response);
      router.refresh();
      pushToast({
        kind: "info",
        title: "SignedOut",
        code: "LNK110200",
        description: "You are signed out now.",
      });
    } catch (error) {
      if (error instanceof LnkHttpError) {
        pushToast({
          kind: "error",
          title: error.payload.errorTitle,
          code: error.payload.errorCode,
          description: error.payload.userMessage,
        });
      }
    }
  };

  const displayName = useMemo(() => {
    if (userName?.trim()) return userName;
    return userEmail.split("@")[0] ?? "User";
  }, [userEmail, userName]);

  const monthLabel = useMemo(() => {
    return new Date().toLocaleString("en-US", { month: "long" });
  }, []);

  const domainOptions = useMemo(() => {
    const unique = new Set(bookmarks.map((bookmark) => getHost(bookmark[LNK_BOOKMARK_COLUMN.URL])));
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [bookmarks]);

  const visibleBookmarks = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const next = bookmarks.filter((bookmark) => {
      const titleValue = bookmark[LNK_BOOKMARK_COLUMN.TITLE].toLowerCase();
      const urlValue = bookmark[LNK_BOOKMARK_COLUMN.URL].toLowerCase();
      const host = getHost(bookmark[LNK_BOOKMARK_COLUMN.URL]).toLowerCase();
      const matchesQuery =
        normalizedQuery.length === 0 ||
        titleValue.includes(normalizedQuery) ||
        urlValue.includes(normalizedQuery) ||
        host.includes(normalizedQuery);
      const matchesDomain = domainFilter === "all" || host === domainFilter.toLowerCase();
      return matchesQuery && matchesDomain;
    });

    next.sort((a, b) => {
      if (sortOption === "newest") {
        return (
          new Date(b[LNK_BOOKMARK_COLUMN.CREATED_AT]).getTime() -
          new Date(a[LNK_BOOKMARK_COLUMN.CREATED_AT]).getTime()
        );
      }
      if (sortOption === "oldest") {
        return (
          new Date(a[LNK_BOOKMARK_COLUMN.CREATED_AT]).getTime() -
          new Date(b[LNK_BOOKMARK_COLUMN.CREATED_AT]).getTime()
        );
      }
      if (sortOption === "title_asc") {
        return a[LNK_BOOKMARK_COLUMN.TITLE].localeCompare(b[LNK_BOOKMARK_COLUMN.TITLE]);
      }
      if (sortOption === "title_desc") {
        return b[LNK_BOOKMARK_COLUMN.TITLE].localeCompare(a[LNK_BOOKMARK_COLUMN.TITLE]);
      }
      return getHost(a[LNK_BOOKMARK_COLUMN.URL]).localeCompare(getHost(b[LNK_BOOKMARK_COLUMN.URL]));
    });

    return next;
  }, [bookmarks, domainFilter, searchQuery, sortOption]);

  return (
    <div className="min-h-screen bg-background-light text-slate-900">
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
              <BrandSparkIcon className="size-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">Link Nest</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden flex-col items-end sm:flex">
              <span className="text-sm font-semibold text-slate-900">{displayName}</span>
              <span className="text-xs text-slate-500">{userEmail}</span>
            </div>
            <div className="mx-2 h-8 w-px bg-slate-200" />
            <button
              type="button"
              onClick={onSignOut}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="mb-6">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">My Bookmarks</h1>
            <p className="mt-1 text-slate-500">Organize your digital world, one link at a time.</p>
          </div>

          <form onSubmit={onCreateBookmark} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3 text-primary">
              <span className="material-symbols-outlined">add_circle</span>
              <h2 className="text-lg font-bold text-slate-900">Add New Bookmark</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              <div className="md:col-span-4">
                <label className="ml-1 mb-1.5 block text-xs font-bold tracking-wider text-slate-400 uppercase">
                  Title
                </label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Portfolio Inspiration"
                  className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary focus:ring-primary"
                />
              </div>
              <div className="md:col-span-6">
                <label className="ml-1 mb-1.5 block text-xs font-bold tracking-wider text-slate-400 uppercase">
                  URL
                </label>
                <input
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://dribbble.com/tags/minimal"
                  type="url"
                  className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary focus:ring-primary"
                />
              </div>
              <div className="flex items-end md:col-span-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-primary font-bold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-xl">add</span>
                  {submitting ? "Adding..." : "Add"}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-semibold text-primary">
              {visibleBookmarks.length} of {bookmarks.length} Bookmarks
            </span>
            <span className="text-sm text-slate-400">Saved this {monthLabel}</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`rounded-full p-2 transition-colors ${viewMode === "grid" ? "bg-primary/10 text-primary" : "text-slate-400 hover:text-primary"}`}
            >
              <span className="material-symbols-outlined">grid_view</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`rounded-full p-2 transition-colors ${viewMode === "list" ? "bg-primary/10 text-primary" : "text-slate-400 hover:text-primary"}`}
            >
              <span className="material-symbols-outlined">view_list</span>
            </button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="md:col-span-6">
            <label className="ml-1 mb-1.5 block text-xs font-bold tracking-wider text-slate-400 uppercase">
              Search
            </label>
            <div className="relative">
              <span className="material-symbols-outlined pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by title, URL, or domain"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-3 pl-10 text-sm focus:border-primary focus:ring-primary"
              />
            </div>
          </div>
          <div className="md:col-span-3">
            <label className="ml-1 mb-1.5 block text-xs font-bold tracking-wider text-slate-400 uppercase">
              Filter Domain
            </label>
            <select
              value={domainFilter}
              onChange={(event) => setDomainFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-primary focus:ring-primary"
            >
              <option value="all">All domains</option>
              {domainOptions.map((domain) => (
                <option key={domain} value={domain}>
                  {domain}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="ml-1 mb-1.5 block text-xs font-bold tracking-wider text-slate-400 uppercase">
              Sort
            </label>
            <select
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value as SortOption)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-primary focus:ring-primary"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title_asc">Title A-Z</option>
              <option value="title_desc">Title Z-A</option>
              <option value="domain_asc">Domain A-Z</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading bookmarks...</p>
        ) : visibleBookmarks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-sm text-slate-500">
              {bookmarks.length === 0
                ? "No bookmarks yet. Add your first one above."
                : "No bookmarks match your search/filter."}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleBookmarks.map((bookmark) => {
              const bookmarkId = bookmark[LNK_BOOKMARK_COLUMN.ID];
              const bookmarkTitle = bookmark[LNK_BOOKMARK_COLUMN.TITLE];
              const bookmarkUrl = bookmark[LNK_BOOKMARK_COLUMN.URL];
              const host = getHost(bookmarkUrl);
              const previewState = previewStateById[bookmarkId] ?? 0;

              return (
                <article
                  key={bookmarkId}
                  className="bookmark-card group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                    {previewState === 2 ? (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                        <span className="material-symbols-outlined text-5xl text-white/40">link</span>
                      </div>
                    ) : previewState === 1 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getRelevantFallbackImageUrl(bookmarkUrl, bookmarkTitle)}
                        alt={bookmarkTitle}
                        className="h-full w-full object-cover"
                        onError={() =>
                          setPreviewStateById((current) => ({
                            ...current,
                            [bookmarkId]: 2,
                          }))
                        }
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getPreviewImageUrl(bookmarkUrl)}
                        alt={bookmarkTitle}
                        className="h-full w-full object-cover"
                        onError={() =>
                          setPreviewStateById((current) => ({
                            ...current,
                            [bookmarkId]: 1,
                          }))
                        }
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="mb-1 flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt="favicon" className="h-4 w-4 rounded" src={getFaviconUrl(bookmarkUrl)} />
                      <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Saved</span>
                    </div>
                    <h3 className="mb-1 line-clamp-1 text-base font-bold text-slate-900">{bookmarkTitle}</h3>
                    <a
                      className="flex truncate text-sm font-medium text-primary hover:underline"
                      href={bookmarkUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {host}
                    </a>
                    <div className="mt-3 flex items-center justify-end border-t border-slate-100 pt-3">
                      <button
                        type="button"
                        onClick={() => setPendingDelete(bookmark)}
                        className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-600 transition-colors hover:bg-red-100"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {visibleBookmarks.map((bookmark) => {
              const bookmarkId = bookmark[LNK_BOOKMARK_COLUMN.ID];
              const bookmarkTitle = bookmark[LNK_BOOKMARK_COLUMN.TITLE];
              const bookmarkUrl = bookmark[LNK_BOOKMARK_COLUMN.URL];
              const host = getHost(bookmarkUrl);
              const previewState = previewStateById[bookmarkId] ?? 0;

              return (
                <article
                  key={bookmarkId}
                  className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="h-24 w-36 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    {previewState === 2 ? (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                        <span className="material-symbols-outlined text-4xl text-white/40">link</span>
                      </div>
                    ) : previewState === 1 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getRelevantFallbackImageUrl(bookmarkUrl, bookmarkTitle)}
                        alt={bookmarkTitle}
                        className="h-full w-full object-cover"
                        onError={() =>
                          setPreviewStateById((current) => ({
                            ...current,
                            [bookmarkId]: 2,
                          }))
                        }
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getPreviewImageUrl(bookmarkUrl)}
                        alt={bookmarkTitle}
                        className="h-full w-full object-cover"
                        onError={() =>
                          setPreviewStateById((current) => ({
                            ...current,
                            [bookmarkId]: 1,
                          }))
                        }
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt="favicon" className="h-4 w-4 rounded" src={getFaviconUrl(bookmarkUrl)} />
                      <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Saved</span>
                    </div>
                    <h3 className="line-clamp-1 text-base font-bold text-slate-900">{bookmarkTitle}</h3>
                    <a
                      className="mt-1 block truncate text-sm font-medium text-primary hover:underline"
                      href={bookmarkUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {host}
                    </a>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => setPendingDelete(bookmark)}
                      className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-100"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <footer className="mt-20 border-t border-slate-100 py-10">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <div className="mb-4 flex cursor-default items-center justify-center gap-2 opacity-70 transition-all">
            <BrandSparkIcon className="size-5 text-primary" />
            <span className="text-lg font-bold tracking-tight text-slate-900">Link Nest</span>
          </div>
          <p className="text-sm text-slate-400">© 2024 Link Nest Bookmark Manager. All your links in one safe place.</p>
        </div>
      </footer>

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
          <div className="relative flex w-full max-w-[480px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#f0f0f4] px-6 py-4">
              <div className="flex items-center gap-2 text-primary">
                <div className="size-5">
                  <BrandSparkIcon className="h-full w-full" />
                </div>
                <span className="text-sm font-bold tracking-tight uppercase">Link Nest</span>
              </div>
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="flex size-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100"
                aria-label="Close delete dialog"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                  close
                </span>
              </button>
            </div>

            <div className="p-8">
              <div className="mb-6 flex flex-col gap-3">
                <h3 className="text-[24px] leading-tight font-bold text-[#111118]">Delete Bookmark?</h3>
                <p className="text-base leading-relaxed font-normal text-[#616189]">
                  Are you sure you want to delete this bookmark? This action is permanent and cannot be undone.
                </p>
              </div>

              <div className="mb-8 flex items-center gap-4 rounded-lg border border-gray-100 bg-background-light p-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getPreviewImageUrl(pendingDelete[LNK_BOOKMARK_COLUMN.URL])}
                    alt="Preview of the bookmark being deleted"
                    className="h-full w-full bg-white object-cover"
                    onError={(event) => {
                      const target = event.currentTarget;
                      target.src = getRelevantFallbackImageUrl(
                        pendingDelete[LNK_BOOKMARK_COLUMN.URL],
                        pendingDelete[LNK_BOOKMARK_COLUMN.TITLE],
                      );
                    }}
                  />
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-semibold text-[#111118]">
                    {pendingDelete[LNK_BOOKMARK_COLUMN.TITLE]}
                  </span>
                  <span className="truncate text-xs text-[#616189]">
                    {getHost(pendingDelete[LNK_BOOKMARK_COLUMN.URL])}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setPendingDelete(null)}
                  disabled={deleteBusy}
                  className="flex h-12 flex-1 items-center justify-center rounded-lg border-2 border-[#f0f0f4] bg-white px-5 text-base font-bold text-[#111118] transition-colors hover:bg-[#f0f0f4] disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteBookmark(pendingDelete[LNK_BOOKMARK_COLUMN.ID])}
                  disabled={deleteBusy}
                  className="flex h-12 flex-1 items-center justify-center rounded-lg bg-red-500 px-5 text-base font-bold text-white shadow-lg shadow-red-500/20 transition-colors hover:bg-red-600 disabled:opacity-60"
                >
                  {deleteBusy ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>

            <div className="h-1.5 w-full bg-red-500/10">
              <div className="h-full w-1/3 bg-red-500" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
