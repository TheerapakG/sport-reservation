import { EventParamsContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect, Match } from "effect";
import { ClubClient } from "sport-reservation-club/client";
import { clubType } from "sport-reservation-club/models";
import { UploadClient } from "sport-reservation-upload/client";
import { UserClient } from "sport-reservation-user/client";
import { userProfile } from "sport-reservation-user/models";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { EventRepository } from "~/repositories/eventRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getEvent",
  response: response(
    type({
      eventId: "string",
      eventCreatorType: "string",
      creator: [[userProfile, "|", clubType], "|", "undefined"],
      "name?": "string",
      "image?": "string",
      "description?": "string",
      "location?": ["number", "number"],
      "locationDescription?": "string",
      autoAccept: "boolean",
      sizeLimit: "number",
      skillLevel: "('beginner' | 'intermediate' | 'advanced')[]",
      sportType: "('badminton' | 'tennis' | 'running')[]",
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
        clubClient.getClub({ query: { clubId: event.creatorId } }),
      ),
      Match.when("user", () =>
        userClient.getUserProfile({ query: { id: event.creatorId } }),
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
      eventCreatorType: event.eventCreatorType,
      creator,
      skillLevel: skillLevel.map((sl) => sl.skillLevel),
      sportType: sportType.map((st) => st.sportType),
    };
  }),
);
