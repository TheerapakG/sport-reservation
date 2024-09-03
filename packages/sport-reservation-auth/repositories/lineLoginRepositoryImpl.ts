import crypto from "crypto";
import { Context, Effect, Option } from "effect";
import {
  LineLoginRepository,
  InvalidLineStateError,
} from "./lineLoginRepository";
import { lineRequestData } from "../models/line";
import { linePostIssueAccessToken } from "../server/utils/fetch";

export const lineLoginRepositoryImpl = {
  generateRequest: () =>
    Effect.gen(function* () {
      const state = crypto.randomBytes(64).toString("hex");
      const nonce = crypto.randomBytes(16).toString("hex");
      const codeVerifier = crypto.randomBytes(64).toString("hex");

      yield* Effect.tryPromise(async () => {
        await useStorage().setItem<typeof lineRequestData.infer>(
          `valkey:request:line:${state}`,
          { nonce, codeVerifier },
          { ttl: 600 },
        );
      });

      return { state, nonce, codeVerifier };
    }),
  getAuthToken: ({ code, state }) =>
    Effect.gen(function* () {
      const { codeVerifier } = yield* Option.match(
        Option.fromNullable(
          yield* Effect.tryPromise(async () => {
            return await useStorage().getItem<typeof lineRequestData.infer>(
              `valkey:request:line:${state}`,
            );
          }),
        ),
        {
          onSome: (e) => Effect.succeed(e),
          onNone: () => Effect.fail(new InvalidLineStateError()),
        },
      );

      const { access_token, id_token, refresh_token, token_type } =
        yield* linePostIssueAccessToken({ code, codeVerifier });

      return {
        access: access_token,
        id: id_token,
        refresh: refresh_token,
        type: token_type,
      };
    }),
  getProfileByAuthToken: (_data) => Effect.gen(function* () {}),
  findUserByProfile: (_data) => Effect.gen(function* () {}),
  createUserByProfile: (_data) => Effect.gen(function* () {}),
} satisfies Context.Tag.Service<LineLoginRepository>;
