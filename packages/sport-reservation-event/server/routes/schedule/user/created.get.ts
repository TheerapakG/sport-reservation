import { EventContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect, Match } from "effect";
import { parseCookies } from "h3";
import { ClubClient } from "sport-reservation-club/client";
import { getSubjectTypeFromToken } from "sport-reservation-oauth-common/subjects";
import { UploadClient } from "sport-reservation-upload/client";
import { UserClient } from "sport-reservation-user/client";
import { defineEventHandlerConfig, response } from "tiara-stack/config";
import { OAuthError } from "tiara-stack/models/errors";
import { OAuthClient } from "~/layers";
import { scheduleInstanceType } from "~/models/schedule";
import { ScheduleRepository } from "~/repositories/scheduleRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getUserCreatedSchedules",
  response: response(
    type({
      schedules: [scheduleInstanceType, "[]"],
    }),
    { stream: false },
  ),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const { event } = yield* EventContext;
    const { access_token: accessToken } = parseCookies(event);

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

    const scheduleRepository = yield* ScheduleRepository;
    const schedules = yield* scheduleRepository.getUserCreatedSchedules({
      userId,
    });

    const uploadClient = yield* UploadClient;
    const userClient = yield* UserClient;
    const clubClient = yield* ClubClient;

    const formattedSchedules = yield* Effect.all(
      schedules.map(
        ({ schedule, event, group, participants, skillLevel, sportType }) =>
          Effect.gen(function* () {
            // Get image URL if exists
            const { url: image } = event.image
              ? yield* uploadClient.getDownloadPresignedUrl({
                  query: { key: event.image },
                })
              : { url: undefined };

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
                  eventId: event.groupId,
                  ...creator,
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
                },
              },
              participants,
            };
          }),
      ),
    );

    return { schedules: formattedSchedules };
  }),
);
