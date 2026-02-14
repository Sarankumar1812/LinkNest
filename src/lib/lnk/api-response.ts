import { NextResponse } from "next/server";
import { normalizeError, type LnkError } from "./error-catalog";
import type { LnkApiName } from "./api-registry";

export type LnkErrorPayload = {
  apiName: string;
  apiPrefix: string;
  errorCode: string;
  errorTitle: string;
  developerMessage: string;
  userMessage: string;
};

export type LnkSuccessResponse<T> = {
  success: true;
  data: T;
};

export type LnkErrorResponse = {
  success: false;
  error: LnkErrorPayload;
};

export type LnkApiResponse<T> = LnkSuccessResponse<T> | LnkErrorResponse;

export function ok<T>(data: T) {
  return NextResponse.json<LnkSuccessResponse<T>>({
    success: true,
    data,
  });
}

export function fail(error: LnkError, status = 400) {
  return NextResponse.json<LnkErrorResponse>(
    {
      success: false,
      error: {
        apiName: error.detail.apiName,
        apiPrefix: error.detail.apiPrefix,
        errorCode: error.detail.code,
        errorTitle: error.detail.title,
        developerMessage: error.detail.developerMessage,
        userMessage: error.detail.userMessage,
      },
    },
    { status },
  );
}

export function failFromUnknown(apiName: LnkApiName, error: unknown, status = 500) {
  return fail(normalizeError(apiName, error), status);
}
