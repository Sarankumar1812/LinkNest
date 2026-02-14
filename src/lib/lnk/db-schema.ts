export const LNK_TABLE = {
  USER: "lnk_user_table",
  BOOKMARK: "lnk_bookmark_table",
} as const;

export const LNK_USER_COLUMN = {
  ID: "lnk_ut_id",
  EMAIL: "lnk_ut_email",
  FULL_NAME: "lnk_ut_full_name",
  AVATAR_URL: "lnk_ut_avatar_url",
  CREATED_AT: "lnk_ut_created_at",
} as const;

export const LNK_BOOKMARK_COLUMN = {
  ID: "lnk_bt_id",
  USER_ID: "lnk_bt_user_id",
  TITLE: "lnk_bt_title",
  URL: "lnk_bt_url",
  CREATED_AT: "lnk_bt_created_at",
} as const;
