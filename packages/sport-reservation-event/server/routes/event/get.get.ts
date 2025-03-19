import { EventParamsContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { EventRepository } from "~/repositories/eventRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getEvent",
  response: response(
    type({
      eventId: "string",
      "name?": "string",
      "description?": "string",
      "location?": ["number", "number"],
      "locationDescription?": "string",
      startAt: "string", // ISO string format
      endAt: "string", // ISO string format
      autoAccept: "boolean",
      sizeLimit: "number",
      eventCreatorType: "string",
      creatorId: "string",
    }),
    { stream: false },
  ),
  query: params(
    type({
      eventId: "string",
    }),
  ),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const {
      params: {
        query: { eventId },
      },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const eventRepository = yield* EventRepository;
    const { event, group } = yield* yield* eventRepository.getEvent({
      eventId,
    });

    return {
      eventId: group.publicId,
      ...(group.name && { name: group.name }),
      ...(event.description && { description: event.description }),
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
  }),
);
