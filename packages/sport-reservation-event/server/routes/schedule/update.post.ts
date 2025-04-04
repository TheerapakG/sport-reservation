import {
  EventContext,
  EventParamsContext,
  effectEventHandler,
} from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { parseCookies } from "h3";
import { getSubjectTypeFromToken } from "sport-reservation-oauth-common/subjects";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { OAuthError } from "tiara-stack/models/errors";
import { OAuthClient } from "~/layers";
import { ScheduleRepository } from "~/repositories/scheduleRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "postUpdateSchedule",
  response: response(type({}), { stream: false }),
  body: params(
    type({
      scheduleId: "string",
      startAt: "Date | undefined",
      endAt: "Date | undefined",
      repeatStartAt: "Date | undefined",
      repeatEndAt: "Date | undefined",
      repeatInterval: "number | undefined",
    }),
  ),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const { event } = yield* EventContext;
    const { access_token: accessToken } = parseCookies(event);
    const {
      params: {
        body: {
          scheduleId,
          startAt,
          endAt,
          repeatStartAt,
          repeatEndAt,
          repeatInterval,
        },
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

    const scheduleRepository = yield* ScheduleRepository;

    // Verify user has access to the schedule
    const scheduleData = yield* scheduleRepository.getSchedule({
      scheduleId,
      repeatIndex: 0,
    });

    if (!scheduleData) {
      yield* Effect.fail(new OAuthError());
    }

    // Verify user is the creator of the event
    if (
      scheduleData._tag === "Some" &&
      scheduleData.value.event.creatorId !== userId
    ) {
      yield* Effect.fail(new OAuthError());
    }

    yield* scheduleRepository.updateSchedule({
      scheduleId,
      startAt,
      endAt,
      repeatStartAt,
      repeatEndAt,
      repeatInterval,
    });

    return {};
  }),
);
