import { RuntimeConfig } from "$/layers";
import { type } from "arktype";
import { Context, Effect, Layer, Redacted } from "effect";
import { ofetch } from "ofetch";
import { ArktypeError, FetchError } from "tiara-stack/models/errors";
import { effectType } from "tiara-stack/utils/effectType";
import { Fetch, typedFetch } from "tiara-stack/utils/fetch";
import { unknownType } from "tiara-stack/utils/type";
import type { Mock } from "vitest";

export const lineFetch = /*@__PURE__*/ ofetch.create({
  baseURL: "https://api.line.me/oauth2/v2.1",
});

export const linePostIssueAccessTokenResponse = /*@__PURE__*/ type({
  access_token: "string",
  expires_in: "number",
  id_token: "string",
  refresh_token: "string",
  scope: "string",
  token_type: "string",
  "[string]": "unknown",
});

export const linePostGetUserProfileResponse = /*@__PURE__*/ type({
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

export class LineService
  extends /*@__PURE__*/ Context.Tag("LineService")<
    LineService,
    {
      postIssueAccessToken: (data: {
        code: string;
        codeVerifier: string;
      }) => Effect.Effect<
        typeof linePostIssueAccessTokenResponse.infer,
        ArktypeError | FetchError
      >;
      postGetUserProfile: (data: {
        idToken: string;
        nonce: string;
      }) => Effect.Effect<
        typeof linePostGetUserProfileResponse.infer,
        ArktypeError | FetchError
      >;
    }
  >() {}

export const lineService = /*@__PURE__*/ Layer.effect(
  LineService,
  /*@__PURE__*/ Effect.gen(function* () {
    const config = yield* yield* RuntimeConfig;
    return {
      postIssueAccessToken: ({
        code,
        codeVerifier,
      }: {
        code: string;
        codeVerifier: string;
      }) =>
        Effect.provideService(
          Effect.gen(function* () {
            return yield* typedFetch(
              {
                responseType: linePostIssueAccessTokenResponse,
                bodyType: unknownType,
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
        ).pipe(Effect.withSpan("lineService.postIssueAccessToken")),
      postGetUserProfile: ({
        idToken,
        nonce,
      }: {
        idToken: string;
        nonce: string;
      }) =>
        Effect.provideService(
          Effect.gen(function* () {
            return yield* typedFetch(
              {
                responseType: linePostGetUserProfileResponse,
                bodyType: unknownType,
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
        ).pipe(Effect.withSpan("lineService.postGetUserProfile")),
    };
  }),
);

export const mockLineService = async () => {
  const { vi } = await import("vitest");

  const mocks = {
    postIssueAccessToken: vi.fn() as Mock<
      Context.Tag.Service<LineService>["postIssueAccessToken"]
    >,
    postGetUserProfile: vi.fn() as Mock<
      Context.Tag.Service<LineService>["postGetUserProfile"]
    >,
  };

  return {
    mocks,
    layer: Layer.succeed(LineService, {
      postIssueAccessToken: (data) =>
        Effect.gen(function* () {
          return yield* effectType(
            linePostIssueAccessTokenResponse,
            yield* mocks.postIssueAccessToken(data),
          );
        }),
      postGetUserProfile: (data) =>
        Effect.gen(function* () {
          return yield* effectType(
            linePostGetUserProfileResponse,
            yield* mocks.postGetUserProfile(data),
          );
        }),
    }),
  };
};
