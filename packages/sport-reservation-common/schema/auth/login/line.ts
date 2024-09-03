import { type } from "arktype";

export const LineLoginRequest = type({
  responseType: "string",
  clientId: "string",
  redirectUri: "string",
  state: "string",
  scope: "string",
  nonce: "string",
  codeChallenge: "string",
  codeChallengeMethod: "string",
});

export const LineAuthToken = type({
  access: "string",
  id: "string",
  refresh: "string",
  type: "string",
});
