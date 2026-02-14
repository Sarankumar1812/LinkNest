import { createLnkError } from "@/lib/lnk/error-catalog";
import { LNK_TABLE, LNK_USER_COLUMN } from "@/lib/lnk/db-schema";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/?auth_error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/?auth_error=exchange_failed`);
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(`${origin}/?auth_error=user_lookup_failed`);
  }

  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : null;
  const avatarUrl =
    typeof user.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : null;

  const { error: upsertError } = await supabase.from(LNK_TABLE.USER).upsert(
    {
      [LNK_USER_COLUMN.ID]: user.id,
      [LNK_USER_COLUMN.EMAIL]: user.email ?? "",
      [LNK_USER_COLUMN.FULL_NAME]: fullName,
      [LNK_USER_COLUMN.AVATAR_URL]: avatarUrl,
    },
    { onConflict: LNK_USER_COLUMN.ID },
  );

  if (upsertError) {
    const e = createLnkError({
      apiName: "LNK1101CreateAccount",
      sequence: "03",
      title: "UserSyncFailed",
      developerMessage: upsertError.message,
      userMessage: "Logged in, but profile sync failed. Please retry.",
    });
    return NextResponse.redirect(
      `${origin}/?auth_error=${encodeURIComponent(e.detail.code)}`,
    );
  }

  return NextResponse.redirect(`${origin}/`);
}
