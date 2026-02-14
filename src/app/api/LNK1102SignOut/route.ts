import { createLnkError, normalizeError } from "@/lib/lnk/error-catalog";
import { fail, ok } from "@/lib/lnk/api-response";
import { createClient } from "@/lib/supabase/server";

const API_NAME = "LNK1102SignOut";

export async function POST() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw createLnkError({
        apiName: API_NAME,
        sequence: "01",
        title: "SignOutFailed",
        developerMessage: error.message,
        userMessage: "Could not sign out. Please try again.",
      });
    }

    return ok({ signedOut: true });
  } catch (error) {
    return fail(normalizeError(API_NAME, error), 400);
  }
}
