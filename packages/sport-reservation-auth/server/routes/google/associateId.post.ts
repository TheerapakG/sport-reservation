import {
  EventContext,
  EventParamsContext,
  effectEventHandler,
} from "$/effectEventHandler";
import { type } from "arktype";
import { Effect, Option, pipe } from "effect";
import { getHeader, parseCookies } from "h3";
import { getSubjectTypeFromToken } from "sport-reservation-oauth-common/subjects";
import { defineEventHandlerConfig } from "tiara-stack/config";
import { OAuthError } from "tiara-stack/models/errors";
import { noInferOut } from "tiara-stack/utils/noInfer";
import { OAuthClient } from "~/layers";
import { AuthRepository } from "~/repositories/authRepository";
import { GoogleLoginDbRepository } from "~/repositories/googleLoginDbRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "postAssociateGoogleId",
  response: type({}),
  body: noInferOut(
    type({
      "id?": "string",
      googleId: "string",
    }),
  ),
});
export default effectEventHandler({
  config: handlerConfig,
  handler: () =>
    /*@__PURE__*/ Effect.gen(function* () {
      const { event } = yield* EventContext;
      const {
        params: { body },
      } = yield* EventParamsContext.typed<typeof handlerConfig>();

      const id = yield* pipe(
        Option.fromNullable(body.id),
        Option.match({
          onSome: (id) =>
            Effect.gen(function* () {
              const authRepository = yield* AuthRepository;
              yield* authRepository.checkSecret({
                secret:
                  getHeader(event, "authorization")?.split(" ", 2)[1] ?? "",
              });
              return id;
            }),
          onNone: () =>
            pipe(
              Effect.gen(function* () {
                const { client: oauthClient } = yield* OAuthClient;
                const { access_token: accessToken } = parseCookies(event);
                return yield* Effect.promise(() =>
                  getSubjectTypeFromToken({
                    type: "user",
                    client: oauthClient,
                    accessToken,
                    refreshToken: undefined,
                  }),
                );
              }),
              Effect.flatMap((user) =>
                user ? Effect.succeed(user.id) : Effect.fail(new OAuthError()),
              ),
            ),
        }),
      );

      const googleLoginDbRepository = yield* GoogleLoginDbRepository;
      yield* googleLoginDbRepository.associateUserIdWithGoogleId({
        userId: id,
        googleId: body.googleId,
      });

      return {};
    }),
});
