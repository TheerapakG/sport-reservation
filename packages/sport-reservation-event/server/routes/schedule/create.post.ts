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
import { EventRepository } from "~/repositories/eventRepository";
import { ScheduleRepository } from "~/repositories/scheduleRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "postCreateSchedule",
  response: response(
    type({
      scheduleId: "string",
    }),
    { stream: false },
  ),
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

    return {
      scheduleId: result.scheduleId,
    };
  }),
);
