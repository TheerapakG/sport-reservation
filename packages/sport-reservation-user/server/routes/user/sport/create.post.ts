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
import { SportRepository } from "~/repositories/sportRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "postCreateUserSportAssociation",
  body: params(
    type({
      sports: [
        {
          sportType: "'badminton' | 'tennis' | 'running'",
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
          sportId: "string",
          sportType: "'badminton' | 'tennis' | 'running'",
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

    const sportRepo = yield* SportRepository;
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

    // 2. Create Sports and Associate them
    const associations = yield* Effect.all(
      body.sports.map((sportData) =>
        Effect.gen(function* () {
          const createdSport = yield* sportRepo.createSport({
            sportType: sportData.sportType,
          });
          const sportToAssociate = yield* Effect.orElseFail(
            createdSport,
            () =>
              new Error(
                `Failed to create or find sport: ${sportData.sportType}`,
              ),
          );

          yield* sportRepo.associateSportWithUser({
            userId,
            sportId: sportToAssociate.publicId,
          });

          return {
            userId: userId,
            sportId: sportToAssociate.publicId,
            sportType: sportToAssociate.sportType,
          };
        }),
      ),
      { concurrency: "inherit" },
    );

    return { associations };
  }),
);
