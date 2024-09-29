import { type } from "arktype";
import { Effect, Redacted } from "effect";
import { ofetch } from "ofetch";
import {
  Fetch,
  typedFetch,
  withMock,
} from "sport-reservation-common/utils/fetch";
import { unknownType } from "sport-reservation-common/utils/type";
import { RuntimeConfig } from "~/layers/config";

export const lineFetch = /*@__PURE__*/ ofetch.create({
  baseURL: "https://api.line.me/oauth2/v2.1",
});

const linePostIssueAccessTokenResponse = /*@__PURE__*/ type({
  access_token: "string",
  expires_in: "number",
  id_token: "string",
  refresh_token: "string",
  scope: "string",
  token_type: "string",
  "[string]": "unknown",
});
export const linePostIssueAccessToken = /*@__PURE__*/ withMock(
  ({ code, codeVerifier }: { code: string; codeVerifier: string }) =>
    Effect.provideService(
      Effect.gen(function* () {
        const config = yield* yield* RuntimeConfig;
        return yield* typedFetch(
          {
            response: linePostIssueAccessTokenResponse,
            bodyParams: unknownType,
          },
          "/token",
          {
            method: "POST",
            body: new URLSearchParams({
              grant_type: "authorization_code",
              code: code,
              redirect_uri: config.line.redirectUri,
              client_id: config.line.client.id,
              client_secret: Redacted.value(config.line.client.secret),
              code_verifier: codeVerifier,
            }),
          },
        );
      }),
      Fetch,
      { fetch: lineFetch },
    ),
);

const lineGetUserProfileResponse = /*@__PURE__*/ type({
  iss: "string",
  sub: "string",
  aud: "string",
  exp: "number",
  iat: "number",
  "auth_time?": "number",
  "nonce?": "string",
  "amr?": "string[]",
  "name?": "string",
  "picture?": "string",
  "email?": "string",
  "[string]": "unknown",
});
export const linePostGetUserProfile = /*@__PURE__*/ withMock(
  ({ idToken, nonce }: { idToken: string; nonce: string }) =>
    Effect.provideService(
      Effect.gen(function* () {
        const config = yield* yield* RuntimeConfig;
        return yield* typedFetch(
          {
            response: lineGetUserProfileResponse,
            bodyParams: unknownType,
          },
          "/verify",
          {
            method: "POST",
            body: new URLSearchParams({
              id_token: idToken,
              client_id: config.line.client.id,
              nonce,
            }),
          },
        );
      }),
      Fetch,
      { fetch: lineFetch },
    ),
);
