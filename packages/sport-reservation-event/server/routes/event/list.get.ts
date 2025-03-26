import { EventParamsContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { EventRepository } from "~/repositories/eventRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getEventList",
  response: response(
    type([
      {
        eventId: "string",
        eventCreatorType: "string",
        creatorId: "string",
        "name?": "string",
        "description?": "string",
        "location?": ["number", "number"],
        "locationDescription?": "string",
        startAt: "string", // ISO string format
        endAt: "string", // ISO string format
        autoAccept: "boolean",
        sizeLimit: "number",
        participants: "number",
      },
      "[]",
    ]),
    { stream: false },
  ),
  query: params(
    type({
      date: "string.date.parse",
      limit: "1 < number <= 10",
      offset: "number",
    }),
  ),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const {
      params: {
        query: { date, limit, offset },
      },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const eventRepository = yield* EventRepository;
    const events = yield* eventRepository.getEventsByDate({
      date,
      limit,
      offset,
    });

    return events.map(({ event, group, participants }) => ({
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
      participants,
    }));
  }),
);
