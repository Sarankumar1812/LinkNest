import { createLnkError, normalizeError } from "@/lib/lnk/error-catalog";
import { LNK_BOOKMARK_COLUMN, LNK_TABLE } from "@/lib/lnk/db-schema";
import { fail, ok } from "@/lib/lnk/api-response";
import { getAuthenticatedUser } from "@/lib/supabase/auth-user";

const API_NAME = "LNK1203DeleteBookmark";

type RequestBody = {
  bookmarkId?: string;
};

export async function DELETE(request: Request) {
  try {
    const payload = (await request.json()) as RequestBody;
    const bookmarkId = payload.bookmarkId?.trim();

    if (!bookmarkId) {
      throw createLnkError({
        apiName: API_NAME,
        sequence: "01",
        title: "ValidationFailed",
        developerMessage: "bookmarkId is missing",
        userMessage: "Could not identify which bookmark to delete.",
      });
    }

    const { supabase, user } = await getAuthenticatedUser(API_NAME);
    const { error, count } = await supabase
      .from(LNK_TABLE.BOOKMARK)
      .delete({ count: "exact" })
      .eq(LNK_BOOKMARK_COLUMN.ID, bookmarkId)
      .eq(LNK_BOOKMARK_COLUMN.USER_ID, user.id);

    if (error) {
      throw createLnkError({
        apiName: API_NAME,
        sequence: "02",
        title: "DeleteFailed",
        developerMessage: error.message,
        userMessage: "Bookmark deletion failed. Please retry.",
      });
    }

    if (!count) {
      throw createLnkError({
        apiName: API_NAME,
        sequence: "03",
        title: "NotFound",
        developerMessage: `Bookmark not found for id=${bookmarkId}, user=${user.id}`,
        userMessage: "Bookmark was not found or is already deleted.",
      });
    }

    return ok<{ deletedBookmarkId: string }>({
      deletedBookmarkId: bookmarkId,
    });
  } catch (error) {
    return fail(normalizeError(API_NAME, error), 400);
  }
}
