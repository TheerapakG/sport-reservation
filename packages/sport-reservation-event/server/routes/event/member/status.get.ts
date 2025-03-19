import { EventParamsContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { EventRepository } from "~/repositories/eventRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getEventMemberStatus",
  response: response(
    type({
      status: "'pending' | 'member'",
    }),
    { stream: false },
  ),
  query: params(
    type({
      eventId: "string",
      userId: "string",
    }),
  ),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const {
      params: {
        query: { eventId, userId: userId },
      },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const eventRepository = yield* EventRepository;

    return yield* yield* eventRepository.getEventMemberStatus({
      eventId,
      userId,
    });
  }),
);
