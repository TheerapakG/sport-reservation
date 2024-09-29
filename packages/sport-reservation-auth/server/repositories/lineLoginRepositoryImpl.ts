import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { Context, Effect, Layer, Option, pipe } from "effect";
import { authUserAuthConnection } from "sport-reservation-common/db/schema";
import { ValkeyError } from "sport-reservation-common/models/errors";
import { RuntimeConfig } from "~/layers";
import {
  linePostGetUserProfile,
  linePostIssueAccessToken,
} from "~/layers/fetch";
import {
  InvalidLineNonceError,
  InvalidLineStateError,
  LineLoginRepository,
} from "./lineLoginRepository";

export const lineLoginRepositoryImpl = /*@__PURE__*/ Layer.effect(
  LineLoginRepository,
  /*@__PURE__*/ Effect.gen(function* () {
    const config = yield* RuntimeConfig;
    const db = yield* PgDrizzle;
    return <Context.Tag.Service<LineLoginRepository>>{
      generateRequest: () =>
        Effect.gen(function* () {
          const state = crypto.randomBytes(64).toString("hex");
          const nonce = crypto.randomBytes(16).toString("hex");
          const codeVerifier = crypto.randomBytes(64).toString("hex");

          yield* Effect.mapError(
            Effect.tryPromise(async () => {
              await useStorage().setItem<{
                nonce: string;
                codeVerifier: string;
              }>(
                `valkey:request:line:${state}`,
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
                  const requestData = await useStorage().getItem<{
                    nonce: string;
                    codeVerifier: string;
                  }>(`valkey:request:line:${state}`);
                  await useStorage().removeItem(`valkey:request:line:${state}`);
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
            yield* pipe(
              linePostIssueAccessToken({ code, codeVerifier }),
              Effect.provideService(RuntimeConfig, config),
            );

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
          } = yield* pipe(
            linePostGetUserProfile({
              nonce,
              idToken,
            }),
            Effect.provideService(RuntimeConfig, config),
          );
          if (nonce !== receivedNonce)
            return yield* Effect.fail(new InvalidLineNonceError());
          return {
            id: sub,
            name: name ?? "",
            avatar: picture ?? "",
          };
        }),
      findUserIdByLineId: ({ lineId }) =>
        Effect.gen(function* () {
          const users = yield* db
            .select()
            .from(authUserAuthConnection)
            .where(eq(authUserAuthConnection.lineId, lineId))
            .limit(1);

          if (users.length === 0) return Option.none();

          return Option.some({ userId: users[0].userId });
        }),
      associateUserIdWithLineId: ({ userId, lineId }) =>
        Effect.gen(function* () {
          yield* db
            .insert(authUserAuthConnection)
            .values({ userId, lineId })
            .onConflictDoUpdate({
              target: authUserAuthConnection.userId,
              set: { lineId },
              setWhere: eq(authUserAuthConnection.userId, userId),
            });
        }),
    };
  }),
);
