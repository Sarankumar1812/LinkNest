import {
  LNK_BOOKMARK_COLUMN,
  LNK_USER_COLUMN,
} from "./db-schema";

export type LnkBookmarkRow = {
  [LNK_BOOKMARK_COLUMN.ID]: string;
  [LNK_BOOKMARK_COLUMN.USER_ID]: string;
  [LNK_BOOKMARK_COLUMN.TITLE]: string;
  [LNK_BOOKMARK_COLUMN.URL]: string;
  [LNK_BOOKMARK_COLUMN.CREATED_AT]: string;
};

export type LnkUserRow = {
  [LNK_USER_COLUMN.ID]: string;
  [LNK_USER_COLUMN.EMAIL]: string;
  [LNK_USER_COLUMN.FULL_NAME]: string | null;
  [LNK_USER_COLUMN.AVATAR_URL]: string | null;
  [LNK_USER_COLUMN.CREATED_AT]: string;
};
