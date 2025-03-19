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
  name: "getUserPendingEvents",
  response: response(
    type({
      events: [
        {
          id: "string",
          eventCreatorType: "string",
          creatorId: "string",
          "name?": "string",
          "description?": "string",
          "location?": "string",
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

    const events = yield* eventRepository.getUserPendingEvents({ userId });

    const formattedEvents = events.map((eventData) => {
      return {
        id: eventData.event.groupId,
        eventCreatorType: eventData.event.eventCreatorType,
        creatorId: eventData.event.creatorId,
        name: eventData.group.name || undefined,
        description: eventData.event.description || undefined,
        location: eventData.event.location || undefined,
        startAt: eventData.event.startAt.toISOString(),
        endAt: eventData.event.endAt.toISOString(),
        autoAccept: eventData.event.autoAccept,
        sizeLimit: eventData.event.sizeLimit,
      };
    });

    return { events: formattedEvents };
  }),
);
