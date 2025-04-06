import { EventContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect, pipe } from "effect";
import { parseCookies } from "h3";
import { getSubjectTypeFromToken } from "sport-reservation-oauth-common/subjects";
import { defineEventHandlerConfig, response } from "tiara-stack/config";
import { OAuthError } from "tiara-stack/models/errors";
import { OAuthClient } from "~/layers";
import { ObjectiveRepository } from "~/repositories/objectiveRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getUserObjectiveAssociations",
  response: response(
    type({
      associations: [
        {
          userId: "string",
          objectiveId: "string",
          objectiveType: "string",
        },
        "[]",
      ],
    }),
    {
      stream: false,
    },
  ),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const { event } = yield* EventContext;
    const objectiveRepo = yield* ObjectiveRepository;
    const oauthClient = yield* OAuthClient;

    // 1. Get User ID
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

    // 2. Get associated objectives
    const associatedObjectives = yield* objectiveRepo.getObjectivesByUserId({
      userId,
    });

    // 3. Format the response
    const associations = associatedObjectives.map((assoc) => ({
      userId: userId,
      objectiveId: assoc.objective.publicId,
      objectiveType: assoc.objective.objectiveType,
    }));

    return { associations };
  }),
);
