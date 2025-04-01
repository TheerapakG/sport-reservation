import {
  EventContext,
  EventParamsContext,
  effectEventHandler,
} from "$/effectEventHandler";
import { type } from "arktype";
import { Effect, Match } from "effect";
import { parseCookies } from "h3";
import { ClubClient } from "sport-reservation-club/client";
import { clubType } from "sport-reservation-club/models";
import { getSubjectTypeFromToken } from "sport-reservation-oauth-common/subjects";
import { UploadClient } from "sport-reservation-upload/client";
import { UserClient } from "sport-reservation-user/client";
import { userProfile } from "sport-reservation-user/models";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { OAuthError } from "tiara-stack/models/errors";
import { OAuthClient } from "~/layers";
import { ScheduleRepository } from "~/repositories/scheduleRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getSchedule",
  response: response(
    type({
      schedule: {
        id: "string",
        startAt: "string",
        endAt: "string",
        repeatStartAt: "string",
        repeatEndAt: "string",
        repeatInterval: "number",
      },
      event: {
        eventId: "string",
        "image?": "string",
        eventCreatorType: "'user' | 'club'",
        creator: [[userProfile, "|", clubType], "|", "undefined"],
        "description?": "string",
        "locationDescription?": "string",
        autoAccept: "boolean",
        sizeLimit: "number",
        skillLevel: "('beginner' | 'intermediate' | 'advanced')[]",
        sportType: "('badminton' | 'tennis' | 'running')[]",
      },
      group: {
        groupId: "string",
        "name?": "string",
        type: "string",
      },
      participants: "number",
    }),
    { stream: false },
  ),
  query: params(
    type({
      id: "string",
    }),
  ),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const { event } = yield* EventContext;
    const { access_token: accessToken } = parseCookies(event);
    const {
      params: {
        query: { id },
      },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const { client: oauthClient } = yield* OAuthClient;

    // Authenticate user
    yield* Effect.flatMap(
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

    const scheduleRepository = yield* ScheduleRepository;
    const {
      schedule,
      event: eventData,
      group,
      participants,
      skillLevel,
      sportType,
    } = yield* yield* scheduleRepository.getSchedule({
      scheduleId: id,
    });

    // Get clients for image and creator info
    const uploadClient = yield* UploadClient;
    const userClient = yield* UserClient;
    const clubClient = yield* ClubClient;

    // Get image URL if it exists
    const { url: image } = eventData.image
      ? yield* uploadClient.getDownloadPresignedUrl({
          query: { key: eventData.image },
        })
      : { url: undefined };

    const creator = yield* Match.value(eventData.eventCreatorType).pipe(
      Match.when("club", () =>
        clubClient.getClub({ query: { clubId: eventData.creatorId } }),
      ),
      Match.when("user", () =>
        userClient.getUserProfile({ query: { id: eventData.creatorId } }),
      ),
      Match.exhaustive,
    );

    return {
      schedule: {
        id: schedule.publicId,
        startAt: schedule.startAt.toISOString(),
        endAt: schedule.endAt.toISOString(),
        repeatStartAt: schedule.repeatStartAt?.toISOString() || "",
        repeatEndAt: schedule.repeatEndAt?.toISOString() || "",
        repeatInterval: schedule.repeatInterval,
      },
      event: {
        eventId: eventData.groupId,
        ...(image && { image }),
        eventCreatorType: eventData.eventCreatorType,
        creatorId: eventData.creatorId,
        creator,
        ...(eventData.description && { description: eventData.description }),
        ...(eventData.locationDescription && {
          locationDescription: eventData.locationDescription,
        }),
        autoAccept: eventData.autoAccept,
        sizeLimit: eventData.sizeLimit,
        skillLevel: skillLevel.map((sl) => sl.skillLevel),
        sportType: sportType.map((st) => st.sportType),
      },
      group: {
        groupId: group.publicId,
        ...(group.name && { name: group.name }),
        type: group.type,
      },
      participants,
    };
  }),
);
