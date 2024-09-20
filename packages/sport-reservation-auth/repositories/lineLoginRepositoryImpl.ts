import crypto from "crypto";
import { Effect, Layer, Option } from "effect";
import {
  LineLoginRepository,
  InvalidLineStateError,
  InvalidLineNonceError,
} from "./lineLoginRepository";
import {
  linePostGetUserProfile,
  linePostIssueAccessToken,
} from "~~/server/utils/fetch";
import { ValkeyError } from "sport-reservation-common/models/errors";

export const lineLoginRepositoryImpl = Layer.succeed(
  LineLoginRepository,
  LineLoginRepository.of({
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
          yield* linePostIssueAccessToken({ code, codeVerifier });

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
        } = yield* linePostGetUserProfile({
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
    findUserByProfile: (_data) => Effect.gen(function* () {}),
    createUserByProfile: (_data) => Effect.gen(function* () {}),
  }),
);
