import { EventContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { parseCookies } from "h3";
import { getSubjectTypeFromToken } from "sport-reservation-oauth-common/subjects";
import { UploadClient } from "sport-reservation-upload/client";
import { defineEventHandlerConfig, response } from "tiara-stack/config";
import { OAuthError } from "tiara-stack/models/errors";
import { OAuthClient } from "~/layers";
import { EventRepository } from "~/repositories/eventRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getUserCreatedEvents",
  response: response(
    type({
      events: [
        {
          eventId: "string",
          eventCreatorType: "string",
          creatorId: "string",
          "name?": "string",
          "image?": "string",
          "description?": "string",
          "location?": ["number", "number"],
          "locationDescription?": "string",
          autoAccept: "boolean",
          sizeLimit: "number",
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

    const eventRepository = yield* EventRepository;

    const events = yield* eventRepository.getUserCreatedEvents({ userId });

    const uploadClient = yield* UploadClient;

    const formattedEvents = yield* Effect.all(
      events.map(({ event, group }) =>
        Effect.gen(function* () {
          const { url: image } = event.image
            ? yield* uploadClient.getDownloadPresignedUrl({
                query: { key: event.image },
              })
            : { url: undefined };

          return {
            eventId: group.publicId,
            ...(group.name && { name: group.name }),
            ...(image && { image }),
            ...(event.description && { description: event.description }),
            ...(event.location && { location: event.location }),
            ...(event.locationDescription && {
              locationDescription: event.locationDescription,
            }),
            autoAccept: event.autoAccept,
            sizeLimit: event.sizeLimit,
            eventCreatorType: event.eventCreatorType,
            creatorId: event.creatorId,
          };
        }),
      ),
    );

    return { events: formattedEvents };
  }),
);
