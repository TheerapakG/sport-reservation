import crypto from "crypto";
import { Context, Effect, Layer, Option } from "effect";
import { ValkeyError } from "sport-reservation-common/models/errors";
import { LineService, StorageService } from "~/layers";
import {
  InvalidLineNonceError,
  InvalidLineStateError,
  LineLoginApiRepository,
} from "./lineLoginApiRepository";

export const lineLoginApiRepositoryImpl = /*@__PURE__*/ Layer.effect(
  LineLoginApiRepository,
  /*@__PURE__*/ Effect.gen(function* () {
    const { storage } = yield* StorageService;
    const lineService = yield* LineService;

    return <Context.Tag.Service<LineLoginApiRepository>>{
      generateRequest: () =>
        Effect.gen(function* () {
          const state = crypto.randomBytes(64).toString("hex");
          const nonce = crypto.randomBytes(16).toString("hex");
          const codeVerifier = crypto.randomBytes(64).toString("hex");

          yield* Effect.mapError(
            Effect.tryPromise(async () => {
              await storage.setItem<{
                nonce: string;
                codeVerifier: string;
              }>(
                `request:line:${state}`,
                { nonce, codeVerifier },
                { ttl: 600 },
              );
            }),
            () => new ValkeyError(),
          );

          return { state, nonce, codeVerifier, scope: "profile openid" };
        }),
      getAuthToken: ({ code, state }) =>
        Effect.gen(function* () {
          const { nonce, codeVerifier } = yield* Option.match(
            Option.fromNullable(
              yield* Effect.orElseSucceed(
                Effect.tryPromise(async () => {
                  const requestData = await storage.getItem<{
                    nonce: string;
                    codeVerifier: string;
                  }>(`request:line:${state}`);
                  await storage.removeItem(`request:line:${state}`);
                  return requestData;
                }),
                () => null,
              ),
            ),
            {
              onSome: (e) => Effect.succeed(e),
              onNone: () => Effect.fail(new InvalidLineStateError()),
            },
          );

          const { access_token, id_token, refresh_token, token_type } =
            yield* lineService.postIssueAccessToken({ code, codeVerifier });

          return {
            nonce,
            access: access_token,
            id: id_token,
            refresh: refresh_token,
            type: token_type,
          };
        }),
      getProfileByAuthToken: ({ nonce, idToken }) =>
        Effect.gen(function* () {
          const {
            sub,
            nonce: receivedNonce,
            name,
            picture,
          } = yield* lineService.postGetUserProfile({
            nonce,
            idToken,
          });
          if (nonce !== receivedNonce)
            return yield* Effect.fail(new InvalidLineNonceError());
          return {
            id: sub,
            name: name ?? "",
            avatar: picture ?? "",
          };
        }),
    };
  }),
);
