import { EventParamsContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { UploadClient } from "sport-reservation-upload/client";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { EventRepository } from "~/repositories/eventRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getClubCreatedEvents",
  response: response(
    type([
      {
        eventId: "string",
        "name?": "string",
        "image?": "string",
        "description?": "string",
        "locationDescription?": "string",
        autoAccept: "boolean",
        sizeLimit: "number",
        skillLevel: "('beginner' | 'intermediate' | 'advanced')[]",
        sportType: "('badminton' | 'tennis' | 'running')[]",
      },
      "[]",
    ]),
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

    return yield* Effect.forEach(
      events,
      ({ event, group, skillLevel, sportType }) =>
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
            ...(event.locationDescription && {
              locationDescription: event.locationDescription,
            }),
            autoAccept: event.autoAccept,
            sizeLimit: event.sizeLimit,
            skillLevel: skillLevel.map((sl) => sl.skillLevel),
            sportType: sportType.map((st) => st.sportType),
          };
        }),
    );
  }),
);
