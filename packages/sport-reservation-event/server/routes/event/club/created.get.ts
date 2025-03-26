import { EventParamsContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { EventRepository } from "~/repositories/eventRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getClubCreatedEvents",
  response: response(
    type({
      events: [
        {
          eventId: "string",
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
          participants: "number",
        },
        "[]",
      ],
    }),
    { stream: false },
  ),
  query: params(
    type({
      clubId: "string",
    }),
  ),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const {
      params: {
        query: { clubId },
      },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const eventRepository = yield* EventRepository;

    const events = yield* eventRepository.getClubEvents({ clubId });

    const formattedEvents = events.map(({ event, group, participants }) => {
      return {
        eventId: group.publicId,
        ...(group.name && { name: group.name }),
        ...(event.description && {
          description: event.description,
        }),
        ...(event.location && {
          location: event.location,
        }),
        ...(event.locationDescription && {
          locationDescription: event.locationDescription,
        }),
        startAt: event.startAt.toISOString(),
        endAt: event.endAt.toISOString(),
        autoAccept: event.autoAccept,
        sizeLimit: event.sizeLimit,
        eventCreatorType: event.eventCreatorType,
        creatorId: event.creatorId,
        participants,
      };
    });

    return { events: formattedEvents };
  }),
);
