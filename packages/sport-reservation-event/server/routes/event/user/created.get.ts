import { EventContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { parseCookies } from "h3";
import { getSubjectTypeFromToken } from "sport-reservation-oauth-common/subjects";
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
          id: "string",
          eventCreatorType: "string",
          creatorId: "string",
          "name?": "string",
          "description?": "string",
          "location?": ["number", "number"],
          "locationDescription?": "string",
          startAt: "string",
          endAt: "string",
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

    const formattedEvents = events.map(({ event, group }) => {
      return {
        id: group.publicId,
        ...(group.name && { name: group.name }),
        ...(event.description && {
          description: event.description,
        }),
        ...(event.location && { location: event.location }),
        ...(event.locationDescription && {
          locationDescription: event.locationDescription,
        }),
        startAt: event.startAt.toISOString(),
        endAt: event.endAt.toISOString(),
        autoAccept: event.autoAccept,
        sizeLimit: event.sizeLimit,
        eventCreatorType: event.eventCreatorType,
        creatorId: event.creatorId,
      };
    });

    return { events: formattedEvents };
  }),
);
