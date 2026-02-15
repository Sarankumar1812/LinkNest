import { BookmarkDashboard } from "@/components/bookmark-dashboard";
import { LoginPanel } from "@/components/login-panel";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <LoginPanel />;
  }

  const userName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : null;

  return <BookmarkDashboard userId={user.id} userEmail={user.email ?? ""} userName={userName} />;
}
