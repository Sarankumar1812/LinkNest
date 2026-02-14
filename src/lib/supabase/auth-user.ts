import { createLnkError } from "@/lib/lnk/error-catalog";
import type { LnkApiName } from "@/lib/lnk/api-registry";
import { createClient } from "./server";

export async function getAuthenticatedUser(apiName: LnkApiName) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw createLnkError({
      apiName,
      sequence: "01",
      title: "AuthLookupFailed",
      developerMessage: error.message,
      userMessage: "Could not verify your account. Please log in again.",
    });
  }

  if (!user) {
    throw createLnkError({
      apiName,
      sequence: "02",
      title: "Unauthorized",
      developerMessage: "No active authenticated user found",
      userMessage: "Please log in to continue.",
    });
  }

  return { user, supabase };
}
