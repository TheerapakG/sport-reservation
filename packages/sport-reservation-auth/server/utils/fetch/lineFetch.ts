import { Effect } from "effect";
import { ofetch } from "ofetch";
import { Fetch, typedFetch, withMock } from "~~/utils/fetch";
import { type } from "arktype";
import { anyObject } from "~~/utils/type";

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
const linePostIssueAccessTokenQueryParams = anyObject;
const linePostIssueAccessTokenRouterParams = anyObject;
export const linePostIssueAccessToken = withMock(
  ({ code, codeVerifier }: { code: string; codeVerifier: string }) =>
    Effect.provideService(
      Effect.gen(function* () {
        const config = useRuntimeConfig();
        return yield* typedFetch(
          linePostIssueAccessTokenResponse,
          linePostIssueAccessTokenQueryParams,
          linePostIssueAccessTokenRouterParams,
          "/token",
          {
            method: "POST",
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
