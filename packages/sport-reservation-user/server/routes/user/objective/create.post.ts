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
  name: "postCreateUserObjectiveAssociation",
  body: params(
    type({
      objectives: [
        {
          objectiveType:
            "'casual_match' | 'for_fitness' | 'for_fun' | 'love_challenge' | 'love_competition' | 'meet_new_friends' | 'play_to_win' | 'push_limits' | 'relax_rally' | 'self_improvement' | 'serious_play' | 'stay_active'",
        },
        "[]",
      ],
    }),
  ),
  response: response(
    type({
      associations: [
        {
          userId: "string",
          objectiveId: "string",
          objectiveType:
            "'casual_match' | 'for_fitness' | 'for_fun' | 'love_challenge' | 'love_competition' | 'meet_new_friends' | 'play_to_win' | 'push_limits' | 'relax_rally' | 'self_improvement' | 'serious_play' | 'stay_active'",
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
    const {
      params: { body },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

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

    // 2. Create Objectives and Associate them
    const associations = yield* Effect.all(
      body.objectives.map((objectiveData) =>
        Effect.gen(function* () {
          const createdObjective = yield* objectiveRepo.createObjective({
            objectiveType: objectiveData.objectiveType,
          });
          const objectiveToAssociate = yield* Effect.orElseFail(
            createdObjective,
            () =>
              new Error(
                `Failed to create or find objective: ${objectiveData.objectiveType}`,
              ),
          );

          yield* objectiveRepo.associateObjectiveWithUser({
            userId,
            objectiveId: objectiveToAssociate.publicId,
          });

          return {
            userId: userId,
            objectiveId: objectiveToAssociate.publicId,
            objectiveType: objectiveToAssociate.objectiveType,
          };
        }),
      ),
      { concurrency: "inherit" },
    );

    return { associations };
  }),
);
