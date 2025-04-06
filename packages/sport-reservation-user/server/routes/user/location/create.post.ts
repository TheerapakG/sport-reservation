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
import { LocationRepository } from "~/repositories/locationRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "postCreateUserLocationAssociation",
  body: params(
    type({
      locations: [
        {
          "location?": ["number", "number"],
          "locationDescription?": "string|null",
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
          locationId: "string",
          "location?": ["number", "number"],
          "locationDescription?": "string|null",
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

    const locationRepo = yield* LocationRepository;
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

    // 2. Create Locations and Associate them
    const associations = yield* Effect.all(
      body.locations.map(({ location, locationDescription }) =>
        Effect.gen(function* () {
          const createdLocation = yield* locationRepo.createLocation({
            location,
            locationDescription,
          });
          const locationToAssociate = yield* Effect.orElseFail(
            createdLocation,
            () => new Error(`Failed to create or find location: ${location}`),
          );

          yield* locationRepo.associateLocationWithUser({
            userId,
            locationId: locationToAssociate.publicId,
          });

          return {
            userId: userId,
            locationId: locationToAssociate.publicId,
            // Stringify the location tuple for the response
            ...(locationToAssociate.location
              ? { location: locationToAssociate.location }
              : {}),
            ...(locationToAssociate.locationDescription
              ? { locationDescription: locationToAssociate.locationDescription }
              : {}),
          };
        }),
      ),
      { concurrency: "inherit" },
    );

    return { associations };
  }),
);
