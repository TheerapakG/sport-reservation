import { type } from "arktype";

export const lineRequestState = /*@__PURE__*/ type({ state: "string" });
export const lineRequestData = /*@__PURE__*/ type({
  nonce: "string",
  codeVerifier: "string",
});
export const lineRequest = /*@__PURE__*/ type([
  lineRequestState,
  "&",
  lineRequestData,
]);

export const lineLoginRequest = /*@__PURE__*/ type({
  responseType: "string",
  clientId: "string",
  redirectUri: "string",
  state: "string",
  scope: "string",
  nonce: "string",
  codeChallenge: "string",
  codeChallengeMethod: "string",
});

export const lineAuthToken = /*@__PURE__*/ type({
  access: "string",
  id: "string",
  refresh: "string",
  type: "string",
});
