import { type } from "arktype";
import { Context, Effect, Layer } from "effect";
import { ofetch } from "ofetch";
import { ArktypeError, FetchError } from "tiara-stack/models/errors";
import { effectType } from "tiara-stack/utils/effectType";
import { Fetch, typedFetch } from "tiara-stack/utils/fetch";
import { noInferOut } from "tiara-stack/utils/noInfer";
import type { Mock } from "vitest";

export const facebookFetch = /*@__PURE__*/ ofetch.create({
  baseURL: "https://graph.facebook.com/v22.0",
});

export const facebookGetUserProfileResponse = /*@__PURE__*/ type({
  id: "string",
  name: "string",
  picture: {
    data: {
      url: "string",
    },
  },
});

export class FacebookService
  extends /*@__PURE__*/ Context.Tag("FacebookService")<
    FacebookService,
    {
      getUserProfile: (data: {
        accessToken: string;
      }) => Effect.Effect<
        typeof facebookGetUserProfileResponse.infer,
        ArktypeError | FetchError
      >;
    }
  >() {}

export const facebookService = /*@__PURE__*/ Layer.effect(
  FacebookService,
  /*@__PURE__*/ Effect.succeed({
    getUserProfile: ({ accessToken }: { accessToken: string }) =>
      Effect.provideService(
        Effect.gen(function* () {
          return yield* typedFetch(
            {
              responseType: facebookGetUserProfileResponse,
              queryType: noInferOut(
                type({
                  fields: "string",
                  access_token: "string",
                }),
              ),
            },
            "/me",
            {
              method: "GET",
              query: {
                fields: "id,name,picture{url}",
                access_token: accessToken,
              },
            },
          );
        }),
        Fetch,
        { fetch: facebookFetch },
      ).pipe(Effect.withSpan("facebookService.getUserProfile")),
  }),
);

export const mockFacebookService = async () => {
  const { vi } = await import("vitest");

  const mocks = {
    getUserProfile: vi.fn() as Mock<
      Context.Tag.Service<FacebookService>["getUserProfile"]
    >,
  };

  return {
    mocks,
    layer: Layer.succeed(FacebookService, {
      getUserProfile: (data) =>
        Effect.gen(function* () {
          return yield* effectType(
            facebookGetUserProfileResponse,
            yield* mocks.getUserProfile(data),
          );
        }),
    }),
  };
};
