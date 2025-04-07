import { EventParamsContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { ScheduleRepository } from "~/repositories/scheduleRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getUserMemberSchedulesCount",
  query: params(
    type({
      userId: "string",
    }),
  ),
  response: response(
    type({
      count: "number",
    }),
    { stream: false },
  ),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const {
      params: {
        query: { userId },
      },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const scheduleRepository = yield* ScheduleRepository;
    const count = yield* scheduleRepository.getUserMemberSchedulesCount({
      userId,
    });

    return { count };
  }),
);
