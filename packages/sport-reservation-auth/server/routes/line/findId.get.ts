import {
  EventContext,
  EventParamsContext,
  effectEventHandler,
} from "$/effectEventHandler";
import { type } from "arktype";
import { Effect, Option } from "effect";
import { getHeader } from "h3";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { AuthRepository } from "~/repositories/authRepository";
import { LineLoginDbRepository } from "~/repositories/lineLoginDbRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getIdByLineId",
  response: response(
    type({
      id: "string?",
    }),
    { stream: false },
  ),
  query: params(
    type({
      lineId: "string",
    }),
  ),
});
export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const { event } = yield* EventContext;
    const {
      params: { query },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const authRepository = yield* AuthRepository;
    yield* authRepository.checkSecret({
      secret: getHeader(event, "authorization")?.split(" ", 2)[1] ?? "",
    });

    const lineLoginDbRepository = yield* LineLoginDbRepository;
    const { userId } = Option.getOrUndefined(
      yield* lineLoginDbRepository.findUserIdByLineId({
        lineId: query.lineId,
      }),
    ) ?? { userId: undefined };

    return {
      id: userId,
    };
  }),
);
