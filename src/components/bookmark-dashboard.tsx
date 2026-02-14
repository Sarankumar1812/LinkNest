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
};

type ListBookmarksResponse = {
  bookmarks: LnkBookmarkRow[];
};

type CreateBookmarkResponse = {
  bookmark: LnkBookmarkRow;
};

export function BookmarkDashboard({ userId, userEmail }: Props) {
  const [bookmarks, setBookmarks] = useState<LnkBookmarkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
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
    try {
      const response = await fetch("/api/LNK1203DeleteBookmark", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookmarkId }),
      });
      await parseLnkResponse<{ deletedBookmarkId: string }>(response);
      setBookmarks((current) =>
        current.filter(
          (bookmark) => bookmark[LNK_BOOKMARK_COLUMN.ID] !== bookmarkId,
        ),
      );
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

  const bookmarkCountLabel = useMemo(
    () => `${bookmarks.length} bookmark${bookmarks.length === 1 ? "" : "s"}`,
    [bookmarks.length],
  );

  return (
    <div className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500">
            LINK NEST
          </p>
          <h1 className="text-2xl font-bold text-zinc-900">My Bookmarks</h1>
          <p className="text-sm text-zinc-600">
            {userEmail} | {bookmarkCountLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100"
        >
          Sign Out
        </button>
      </header>

      <form
        onSubmit={onCreateBookmark}
        className="mb-6 grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
      >
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Bookmark title"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
        />
        <input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://example.com"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Add Bookmark"}
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading bookmarks...</p>
      ) : bookmarks.length === 0 ? (
        <p className="text-sm text-zinc-500">No bookmarks yet.</p>
      ) : (
        <ul className="space-y-3">
          {bookmarks.map((bookmark) => (
            <li
              key={bookmark[LNK_BOOKMARK_COLUMN.ID]}
              className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-zinc-900">
                    {bookmark[LNK_BOOKMARK_COLUMN.TITLE]}
                  </p>
                  <a
                    href={bookmark[LNK_BOOKMARK_COLUMN.URL]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-700 hover:underline"
                  >
                    {bookmark[LNK_BOOKMARK_COLUMN.URL]}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteBookmark(bookmark[LNK_BOOKMARK_COLUMN.ID])}
                  className="rounded-md border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
