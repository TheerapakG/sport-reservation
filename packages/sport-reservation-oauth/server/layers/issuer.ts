import { RuntimeConfig } from "$/layers";
import { issuer } from "@openauthjs/openauth";
import { Oauth2Provider } from "@openauthjs/openauth/provider/oauth2";
import { Context, Effect, Layer, Option, Redacted } from "effect";
import { AuthClient } from "sport-reservation-auth/client";
import { subjects } from "sport-reservation-oauth-common/subjects";
import { UploadClient } from "sport-reservation-upload/client";
import { UserClient } from "sport-reservation-user/client";
import { LineService } from "./fetch";
import { StorageService } from "./storage";

export class Issuer extends Context.Tag("Issuer")<
  Issuer,
  { issuer: ReturnType<typeof issuer> }
>() {}

export const issuerLive = Layer.effect(
  Issuer,
  Effect.gen(function* () {
    const config = yield* yield* RuntimeConfig;
    const { storage } = yield* StorageService;
    const authClient = yield* AuthClient;
    const userClient = yield* UserClient;
    const uploadClient = yield* UploadClient;
    const lineService = yield* LineService;

    return {
      issuer: issuer({
        subjects,
        storage: {
          get: async (key) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (await storage.getItem<Record<string, any>>(key.join(":"))) ??
            undefined,
          set: async (key, value, expiry) =>
            await storage.setItem(key.join(":"), value, {
              ttl: expiry
                ? expiry.getSeconds() - new Date().getSeconds()
                : undefined,
            }),
          remove: async (key) => await storage.removeItem(key.join(":")),
          async *scan(prefix) {
            const keys = await storage.keys(prefix.join(":"));
            for (const key of keys) {
              yield [
                key.split(":"),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (await storage.getItem<Record<string, any>>(key)) ?? undefined,
              ];
            }
          },
        },
        providers: {
          line: Oauth2Provider({
            clientID: config.line.client.id,
            clientSecret: Redacted.value(config.line.client.secret),
            scopes: ["profile", "openid"],
            endpoint: {
              authorization: "https://access.line.me/oauth2/v2.1/authorize",
              token: "https://api.line.me/oauth2/v2.1/token",
            },
          }),
        },
        success: async (ctx, value) => {
          switch (value.provider) {
            case "line":
              return ctx.subject(
                "user",
                await Effect.runPromise(
                  Effect.gen(function* () {
                    const {
                      sub: lineId,
                      name: lineName,
                      picture: lineAvatar,
                    } = yield* lineService.postGetUserProfile({
                      idToken: value.tokenset.raw.id_token,
                    });

                    return yield* Option.match(
                      Option.fromNullable(
                        (yield* authClient.getIdByLineId({
                          query: { lineId },
                        })).id,
                      ),
                      {
                        onSome: (id) =>
                          Effect.gen(function* () {
                            return yield* userClient.getUserProfileById({
                              query: { id },
                            });
                          }),
                        onNone: () =>
                          Effect.gen(function* () {
                            const partialProfile =
                              yield* userClient.postCreateUserProfile({
                                body: { name: lineName },
                              });
                            yield* authClient.postAssociateLineId({
                              body: {
                                id: partialProfile.id,
                                lineId,
                              },
                            });

                            if (!lineAvatar) return partialProfile;

                            const { key: avatarKey } =
                              yield* uploadClient.postUploadFromUrl({
                                body: {
                                  key: `/user/avatar/${partialProfile.id}`,
                                  url: lineAvatar,
                                },
                              });
                            return yield* userClient.postUpdateUserProfile({
                              body: {
                                id: partialProfile.id,
                                avatar: avatarKey,
                              },
                            });
                          }),
                      },
                    );
                  }),
                ),
              );
            default:
              throw new Error("Invalid provider");
          }
        },
      }),
    };
  }),
);
