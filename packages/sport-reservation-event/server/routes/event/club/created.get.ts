import { EventParamsContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { UploadClient } from "sport-reservation-upload/client";
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
