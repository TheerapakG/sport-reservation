import { EventContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect, pipe } from "effect";
import { parseCookies } from "h3";
import { getSubjectTypeFromToken } from "sport-reservation-oauth-common/subjects";
import { defineEventHandlerConfig, response } from "tiara-stack/config";
import { OAuthError } from "tiara-stack/models/errors";
import { OAuthClient } from "~/layers";
import { SportRepository } from "~/repositories/sportRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getUserSportAssociations",
  // Define response structure inline
  response: response(
    type({
      associations: [
        {
          userId: "string",
          sportId: "string",
          sportType: "string",
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

    // 2. Get associated sports from repository
    // Assuming getSportsByUserId returns an array of { sport: { publicId: string, sportType: string } }
    const associatedSports = yield* sportRepo.getSportsByUserId({ userId });

    // 3. Format the response
    const associations = associatedSports.map((assoc) => ({
      userId: userId,
      sportId: assoc.sport.publicId,
      sportType: assoc.sport.sportType,
    }));

    return { associations };
  }),
);
