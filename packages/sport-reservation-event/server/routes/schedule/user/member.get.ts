import { EventContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect, Match } from "effect";
import { parseCookies } from "h3";
import { ClubClient } from "sport-reservation-club/client";
import { clubType } from "sport-reservation-club/models";
import { getSubjectTypeFromToken } from "sport-reservation-oauth-common/subjects";
import { UploadClient } from "sport-reservation-upload/client";
import { UserClient } from "sport-reservation-user/client";
import { userProfile } from "sport-reservation-user/models";
import { defineEventHandlerConfig, response } from "tiara-stack/config";
import { OAuthError } from "tiara-stack/models/errors";
import { OAuthClient } from "~/layers";
import { ScheduleRepository } from "~/repositories/scheduleRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getUserMemberSchedules",
  response: response(
    type({
      schedules: [
        {
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
        },
        "[]",
      ],
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
    const schedules = yield* scheduleRepository.getUserMemberSchedules({
      userId,
    });

    const uploadClient = yield* UploadClient;
    const userClient = yield* UserClient;
    const clubClient = yield* ClubClient;

    const formattedSchedules = yield* Effect.all(
      schedules.map(
        ({ schedule, event, group, participants, skillLevel, sportType }) =>
          Effect.gen(function* () {
            const { url: image } = event.image
              ? yield* uploadClient.getDownloadPresignedUrl({
                  query: { key: event.image },
                })
              : { url: undefined };

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
                ...(image && { image }),
                eventCreatorType: event.eventCreatorType,
                creator,
                ...(event.description && { description: event.description }),
                ...(event.locationDescription && {
                  locationDescription: event.locationDescription,
                }),
                autoAccept: event.autoAccept,
                sizeLimit: event.sizeLimit,
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
      ),
    );

    return { schedules: formattedSchedules };
  }),
);
