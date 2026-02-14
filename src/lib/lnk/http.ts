import type { LnkApiResponse, LnkErrorPayload } from "./api-response";

export class LnkHttpError extends Error {
  payload: LnkErrorPayload;

  constructor(payload: LnkErrorPayload) {
    super(payload.developerMessage);
    this.payload = payload;
  }
}

export async function parseLnkResponse<T>(
  response: Response,
): Promise<T> {
  const payload = (await response.json()) as LnkApiResponse<T>;
  if (!payload.success) {
    throw new LnkHttpError(payload.error);
  }
  return payload.data;
}
