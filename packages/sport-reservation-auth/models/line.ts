import { z } from "zod";

export const lineRequestState = z.object({ state: z.string() });
export const lineRequestData = z.object({
  nonce: z.string(),
  codeVerifier: z.string(),
});
export const lineRequest = lineRequestState.merge(lineRequestData);
