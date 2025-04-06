import {
  EventContext,
  EventParamsContext,
  effectEventHandler,
} from "$/effectEventHandler";
import { type } from "arktype";
import { Effect, pipe } from "effect";
import { parseCookies } from "h3";
import { getSubjectTypeFromToken } from "sport-reservation-oauth-common/subjects";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { OAuthError } from "tiara-stack/models/errors";
import { OAuthClient } from "~/layers";
import { ObjectiveRepository } from "~/repositories/objectiveRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "postDeleteUserObjectiveAssociations",
  body: params(type({ objectiveIds: type("string[]") })),
  response: response(type({})),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const { event } = yield* EventContext;
    const {
      params: { body },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const objectiveRepo = yield* ObjectiveRepository;
    const oauthClient = yield* OAuthClient;

    const userId = yield* pipe(
      Effect.gen(function* () {
        const { access_token: accessToken } = parseCookies(event);
        if (!accessToken) {
          return yield* Effect.fail(
            new OAuthError(new Error("Missing access token cookie")),
          );
        }
        return yield* Effect.promise(() =>
          getSubjectTypeFromToken({
            type: "user",
            client: oauthClient.client,
            accessToken,
            refreshToken: undefined,
          }),
        );
      }),
      Effect.flatMap((user) =>
        user ? Effect.succeed(user.id) : Effect.fail(new OAuthError()),
      ),
    );

    yield* Effect.all(
      body.objectiveIds.map((objectiveId) =>
        objectiveRepo.dissociateObjectiveFromUser({ userId, objectiveId }),
      ),
      { concurrency: "inherit", discard: true },
    );
    return {};
  }),
);
