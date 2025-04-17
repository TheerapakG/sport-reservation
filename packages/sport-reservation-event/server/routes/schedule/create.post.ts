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
import { scheduleInstanceType } from "~/models";
import { EventRepository } from "~/repositories/eventRepository";
import { ScheduleRepository } from "~/repositories/scheduleRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "postCreateSchedule",
  response: response(scheduleInstanceType, { stream: false }),
  body: params(
    type({
      eventId: "string",
      startAt: "string.date.parse",
      endAt: "string.date.parse",
      repeat: "number",
      repeatInterval: "number",
    }),
  ),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const { event } = yield* EventContext;
    const { access_token: accessToken } = parseCookies(event);
    const {
      params: {
        body: { eventId, startAt, endAt, repeat, repeatInterval },
      },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const { client: oauthClient } = yield* OAuthClient;

    const userId = yield* Effect.flatMap(
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

    // Verify user has access to the event
    const eventRepository = yield* EventRepository;
    const eventData = yield* eventRepository.getEvent({ eventId });

    if (!eventData) {
      yield* Effect.fail(new OAuthError());
    }

    // Verify the user is the creator of the event
    if (
      eventData._tag === "Some" &&
      eventData.value.group.creatorId !== userId
    ) {
      yield* Effect.fail(new OAuthError());
    }

    const scheduleRepository = yield* ScheduleRepository;
    const result = yield* scheduleRepository.createSchedule({
      eventId,
      startAt,
      endAt,
      repeat,
      repeatInterval,
    });

    const {
      schedule,
      event: scheduleEventData,
      group,
      participants,
      skillLevel,
      sportType,
    } = yield* yield* scheduleRepository.getSchedule({
      scheduleId: result.scheduleId,
      repeatIndex: 0,
    });

    // Get clients for image and creator info
    const uploadClient = yield* UploadClient;
    const userClient = yield* UserClient;
    const clubClient = yield* ClubClient;

    // Get image URL if it exists
    const { url: image } = scheduleEventData.image
      ? yield* uploadClient.getDownloadPresignedUrl({
          query: { key: scheduleEventData.image },
        })
      : { url: undefined };

    const creator = yield* Match.value(scheduleEventData.eventCreatorType).pipe(
      Match.when("club", () =>
        Effect.gen(function* () {
          const club = yield* clubClient.getClub({
            query: { clubId: scheduleEventData.creatorId },
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
            query: { id: scheduleEventData.creatorId },
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
          repeat: schedule.repeat,
          repeatInterval: schedule.repeatInterval,
        },
        event: {
          eventId: scheduleEventData.groupId,
          ...creator,
          ...(group.name && { name: group.name }),
          ...(image && { image }),
          ...(scheduleEventData.description && {
            description: scheduleEventData.description,
          }),
          ...(scheduleEventData.locationDescription && {
            locationDescription: scheduleEventData.locationDescription,
          }),
          autoAccept: scheduleEventData.autoAccept,
          sizeLimit: scheduleEventData.sizeLimit,
          skillLevel: skillLevel.map((sl) => sl.skillLevel),
          sportType: sportType.map((st) => st.sportType),
        },
      },
      participants,
    };
  }),
);
