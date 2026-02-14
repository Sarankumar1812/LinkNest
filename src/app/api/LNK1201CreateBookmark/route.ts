import { createLnkError, normalizeError } from "@/lib/lnk/error-catalog";
import { LNK_BOOKMARK_COLUMN, LNK_TABLE } from "@/lib/lnk/db-schema";
import { fail, ok } from "@/lib/lnk/api-response";
import { getAuthenticatedUser } from "@/lib/supabase/auth-user";
import type { LnkBookmarkRow } from "@/lib/lnk/types";

const API_NAME = "LNK1201CreateBookmark";

type RequestBody = {
  title?: string;
  url?: string;
};

function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as RequestBody;
    const title = payload.title?.trim();
    const url = payload.url?.trim();

    if (!title || !url) {
      throw createLnkError({
        apiName: API_NAME,
        sequence: "01",
        title: "ValidationFailed",
        developerMessage: "title or url is missing in request body",
        userMessage: "Title and URL are required.",
      });
    }

    if (!isValidHttpUrl(url)) {
      throw createLnkError({
        apiName: API_NAME,
        sequence: "02",
        title: "InvalidUrl",
        developerMessage: `Invalid URL format: ${url}`,
        userMessage: "Enter a valid URL starting with http:// or https://.",
      });
    }

    const { supabase, user } = await getAuthenticatedUser(API_NAME);
    const { data, error } = await supabase
      .from(LNK_TABLE.BOOKMARK)
      .insert({
        [LNK_BOOKMARK_COLUMN.USER_ID]: user.id,
        [LNK_BOOKMARK_COLUMN.TITLE]: title,
        [LNK_BOOKMARK_COLUMN.URL]: url,
      })
      .select("*")
      .single();

    if (error) {
      throw createLnkError({
        apiName: API_NAME,
        sequence: "03",
        title: "InsertFailed",
        developerMessage: error.message,
        userMessage: "Could not save bookmark. Please try again.",
      });
    }

    return ok<{ bookmark: LnkBookmarkRow }>({ bookmark: data as LnkBookmarkRow });
  } catch (error) {
    return fail(normalizeError(API_NAME, error), 400);
  }
}
