import { Effect } from "effect";
import { ofetch } from "ofetch";
import {
  Fetch,
  typedFetch,
  withMock,
} from "sport-reservation-common/utils/fetch";
import { type } from "arktype";

export const lineFetch = /*@__PURE__*/ ofetch.create({
  baseURL: "https://api.line.me/oauth2/v2.1",
});

const linePostIssueAccessTokenResponse = /*@__PURE__*/ type({
  access_token: "string",
  expires_in: "string",
  id_token: "string",
  refresh_token: "string",
  scope: "string",
  token_type: "string",
});
export const linePostIssueAccessToken = /*@__PURE__*/ withMock(
  ({ code, codeVerifier }: { code: string; codeVerifier: string }) =>
    Effect.provideService(
      Effect.gen(function* () {
        const config = useRuntimeConfig();
        return yield* typedFetch(
          {
            response: linePostIssueAccessTokenResponse,
          },
          "/token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              grant_type: "authorization_code",
              code: code,
              redirect_uri: config.line.redirectUri,
              client_id: config.line.clientId,
              client_secret: config.line.clientSecret,
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
});
export const linePostGetUserProfile = /*@__PURE__*/ withMock(
  ({ idToken, nonce }: { idToken: string; nonce: string }) =>
    Effect.provideService(
      Effect.gen(function* () {
        const config = useRuntimeConfig();
        return yield* typedFetch(
          {
            response: lineGetUserProfileResponse,
          },
          "/verify",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              id_token: idToken,
              client_id: config.line.clientId,
              nonce,
            }),
          },
        );
      }),
      Fetch,
      { fetch: lineFetch },
    ),
);
