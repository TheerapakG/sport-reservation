import { z } from "zod";

export const LineLoginRequest = z.object({
  responseType: z.string(),
  clientId: z.string(),
  redirectUri: z.string().url(),
  state: z.string(),
  scope: z.string(),
  nonce: z.string(),
  codeChallenge: z.string(),
  codeChallengeMethod: z.string(),
});
