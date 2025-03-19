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
