import {
  EventContext,
  EventParamsContext,
  effectEventHandler,
} from "$/effectEventHandler";
import { type } from "arktype";
import { Effect, Match } from "effect";
import { parseCookies } from "h3";
import { ClubClient } from "sport-reservation-club/client";
import { getSubjectTypeFromToken } from "sport-reservation-oauth-common/subjects";
import { UploadClient } from "sport-reservation-upload/client";
import { UserClient } from "sport-reservation-user/client";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { OAuthError } from "tiara-stack/models/errors";
import { OAuthClient } from "~/layers";
import { scheduleInstanceType } from "~/models/schedule";
import { ScheduleRepository } from "~/repositories/scheduleRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getSchedule",
  response: response(scheduleInstanceType, { stream: false }),
  query: params(
    type({
      id: "string",
      repeatIndex: "number",
    }),
  ),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const { event } = yield* EventContext;
    const { access_token: accessToken } = parseCookies(event);
    const {
      params: {
        query: { id, repeatIndex },
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
      repeatIndex,
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
        Effect.gen(function* () {
          const club = yield* clubClient.getClub({
            query: { clubId: eventData.creatorId },
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
            query: { id: eventData.creatorId },
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
      schedule: {
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
          ...creator,
          ...(group.name && { name: group.name }),
          ...(image && { image }),
          ...(eventData.description && { description: eventData.description }),
          ...(eventData.locationDescription && {
            locationDescription: eventData.locationDescription,
          }),
          autoAccept: eventData.autoAccept,
          sizeLimit: eventData.sizeLimit,
          skillLevel: skillLevel.map((sl) => sl.skillLevel),
          sportType: sportType.map((st) => st.sportType),
        },
      },
      participants,
    };
  }),
);
