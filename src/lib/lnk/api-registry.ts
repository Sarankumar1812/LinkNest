export const LNK_PRODUCT_CODE = "LNK";

export const LNK_API = {
  LNK1101CreateAccount: "1101",
  LNK1102SignOut: "1102",
  LNK1201CreateBookmark: "1201",
  LNK1202ListBookmarks: "1202",
  LNK1203DeleteBookmark: "1203",
} as const;

export type LnkApiName = keyof typeof LNK_API;

export function getApiPrefix(apiName: LnkApiName): string {
  return `${LNK_PRODUCT_CODE}${LNK_API[apiName]}`;
}

export function getErrorCode(apiName: LnkApiName, sequence: string): string {
  return `${getApiPrefix(apiName)}${sequence.padStart(2, "0")}`;
}
