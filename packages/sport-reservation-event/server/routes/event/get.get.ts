import { EventParamsContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect, Match } from "effect";
import { ClubClient } from "sport-reservation-club/client";
import { UploadClient } from "sport-reservation-upload/client";
import { UserClient } from "sport-reservation-user/client";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { eventType } from "~/models/event";
import { EventRepository } from "~/repositories/eventRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getEvent",
  response: response(eventType, { stream: false }),
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
    const { event, group, skillLevel, sportType } =
      yield* yield* eventRepository.getEvent({
        eventId,
      });

    const uploadClient = yield* UploadClient;
    const { url: image } = event.image
      ? yield* uploadClient.getDownloadPresignedUrl({
          query: { key: event.image },
        })
      : { url: undefined };

    const clubClient = yield* ClubClient;
    const userClient = yield* UserClient;

    const creator = yield* Match.value(event.eventCreatorType).pipe(
      Match.when("club", () =>
        Effect.gen(function* () {
          const club = yield* clubClient.getClub({
            query: { clubId: event.creatorId },
          });
          return {
            eventCreatorType: "club" as const,
            creator: club,
          };
        }),
      ),
      Match.when("user", () =>
        Effect.gen(function* () {
          const user = yield* userClient.getUserProfile({
            query: { id: event.creatorId },
          });
          return {
            eventCreatorType: "user" as const,
            creator: user,
          };
        }),
      ),
      Match.exhaustive,
    );

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
      ...creator,
      skillLevel: skillLevel.map((sl) => sl.skillLevel),
      sportType: sportType.map((st) => st.sportType),
    };
  }),
);
