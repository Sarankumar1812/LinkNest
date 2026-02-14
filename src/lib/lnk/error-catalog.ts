import { getApiPrefix, getErrorCode, type LnkApiName } from "./api-registry";

export type LnkErrorDetail = {
  apiName: LnkApiName;
  apiPrefix: string;
  code: string;
  title: string;
  developerMessage: string;
  userMessage: string;
};

export class LnkError extends Error {
  detail: LnkErrorDetail;

  constructor(detail: LnkErrorDetail) {
    super(detail.developerMessage);
    this.detail = detail;
  }
}

type ErrorInput = {
  apiName: LnkApiName;
  sequence: string;
  title: string;
  developerMessage: string;
  userMessage: string;
};

export function createLnkError(input: ErrorInput): LnkError {
  return new LnkError({
    apiName: input.apiName,
    apiPrefix: getApiPrefix(input.apiName),
    code: getErrorCode(input.apiName, input.sequence),
    title: input.title,
    developerMessage: input.developerMessage,
    userMessage: input.userMessage,
  });
}

export function normalizeError(apiName: LnkApiName, error: unknown): LnkError {
  if (error instanceof LnkError) {
    return error;
  }

  const fallbackMessage =
    error instanceof Error ? error.message : "Unknown runtime error";

  return createLnkError({
    apiName,
    sequence: "99",
    title: "UnhandledError",
    developerMessage: fallbackMessage,
    userMessage: "Unexpected error occurred. Please try again.",
  });
}
