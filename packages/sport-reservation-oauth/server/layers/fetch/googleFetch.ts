import { type } from "arktype";
import { Context, Effect, Layer } from "effect";
import { UnknownException } from "effect/Cause";
import { OAuth2Client } from "google-auth-library";
import { ArktypeError } from "tiara-stack/models/errors";
import { effectType } from "tiara-stack/utils/effectType";
import type { Mock } from "vitest";

export class GoogleClient
  extends /*@__PURE__*/ Context.Tag("GoogleClient")<
    GoogleClient,
    { client: OAuth2Client }
  >() {}

export const googleVerifyIdTokenResponse = /*@__PURE__*/ type({
  iss: "string",
  "at_hash?": "string",
  "email_verified?": "boolean",
  sub: "string",
  "azp?": "string",
  "email?": "string",
  "profile?": "string",
  "picture?": "string",
  "name?": "string",
  "given_name?": "string",
  "family_name?": "string",
  aud: "string",
  iat: "number",
  exp: "number",
  "nonce?": "string",
  "hd?": "string",
  "locale?": "string",
  "[string]": "unknown",
});

export const googleClient = new OAuth2Client();

export class GoogleService
  extends /*@__PURE__*/ Context.Tag("GoogleService")<
    GoogleService,
    {
      verifyIdToken: (data: {
        idToken: string;
      }) => Effect.Effect<
        typeof googleVerifyIdTokenResponse.infer,
        UnknownException | ArktypeError
      >;
    }
  >() {}

export const googleService = /*@__PURE__*/ Layer.effect(
  GoogleService,
  /*@__PURE__*/ Effect.succeed({
    verifyIdToken: ({ idToken }: { idToken: string }) =>
      Effect.provideService(
        Effect.gen(function* () {
          const { client } = yield* GoogleClient;
          const ticket = yield* Effect.tryPromise(
            async () => await client.verifyIdToken({ idToken }),
          );
          return yield* effectType(
            googleVerifyIdTokenResponse,
            ticket.getPayload(),
          );
        }),
        GoogleClient,
        { client: googleClient },
      ).pipe(Effect.withSpan("googleService.verifyIdToken")),
  }),
);

export const mockGoogleService = async () => {
  const { vi } = await import("vitest");

  const mocks = {
    verifyIdToken: vi.fn() as Mock<
      Context.Tag.Service<GoogleService>["verifyIdToken"]
    >,
  };

  return {
    mocks,
    layer: Layer.succeed(GoogleService, {
      verifyIdToken: (data) =>
        Effect.gen(function* () {
          return yield* effectType(
            googleVerifyIdTokenResponse,
            yield* mocks.verifyIdToken(data),
          );
        }),
    }),
  };
};
