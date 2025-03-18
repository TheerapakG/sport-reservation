import { EventContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { parseCookies } from "h3";
import { getSubjectTypeFromToken } from "sport-reservation-oauth-common/subjects";
import { defineEventHandlerConfig, response } from "tiara-stack/config";
import { OAuthError } from "tiara-stack/models/errors";
import { OAuthClient } from "~/layers";
import { ClubRepository } from "~/repositories/clubRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getClubList",
  response: response(
    type({
      clubs: [
        {
          club: {
            "description?": "string",
            "location?": ["number", "number"],
            "locationDescription?": "string",
          },
          group: {
            id: "string",
            creatorId: "string",
            "name?": "string",
            type: "string",
          },
        },
        "[]",
      ],
    }),
    { stream: false },
  ),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const { event } = yield* EventContext;
    const { access_token: accessToken } = parseCookies(event);

    const { client: oauthClient } = yield* OAuthClient;

    const userId = yield* Effect.flatMap(
      Effect.promise(async () =>
        getSubjectTypeFromToken({
          type: "user",
          client: oauthClient,
          accessToken,
          refreshToken: undefined,
        }),
      ),
      (user) =>
        user ? Effect.succeed(user.id) : Effect.fail(new OAuthError()),
    );

    const clubRepository = yield* ClubRepository;
    const clubs = yield* clubRepository.getUserClubs({
      userId,
    });

    return {
      clubs: clubs.map(({ club, group }) => {
        return {
          club: {
            description: club.description ?? undefined,
            location: club.location ?? undefined,
            locationDescription: club.locationDescription ?? undefined,
          },
          group: {
            id: group.publicId,
            creatorId: group.creatorId,
            name: group.name ?? undefined,
            type: group.type,
          },
        };
      }),
    };
  }),
);
