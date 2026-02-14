import { LNK_BOOKMARK_COLUMN, LNK_TABLE } from "@/lib/lnk/db-schema";
import { ok, failFromUnknown } from "@/lib/lnk/api-response";
import { getAuthenticatedUser } from "@/lib/supabase/auth-user";
import type { LnkBookmarkRow } from "@/lib/lnk/types";

const API_NAME = "LNK1202ListBookmarks";

export async function GET() {
  try {
    const { supabase, user } = await getAuthenticatedUser(API_NAME);
    const { data, error } = await supabase
      .from(LNK_TABLE.BOOKMARK)
      .select("*")
      .eq(LNK_BOOKMARK_COLUMN.USER_ID, user.id)
      .order(LNK_BOOKMARK_COLUMN.CREATED_AT, { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return ok<{ bookmarks: LnkBookmarkRow[] }>({
      bookmarks: (data ?? []) as LnkBookmarkRow[],
    });
  } catch (error) {
    return failFromUnknown(API_NAME, error, 500);
  }
}
