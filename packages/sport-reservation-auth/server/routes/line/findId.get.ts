import {
  EventContext,
  EventParamsContext,
  effectEventHandler,
} from "$/effectEventHandler";
import { type } from "arktype";
import { Effect, Option } from "effect";
import { getHeader } from "h3";
import { defineEventHandlerConfig } from "tiara-stack/config";
import { noInferOut } from "tiara-stack/utils/noInfer";
import { AuthRepository } from "~/repositories/authRepository";
import { LineLoginDbRepository } from "~/repositories/lineLoginDbRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getIdByLineId",
  response: type({
    id: "string?",
  }),
  query: noInferOut(
    type({
      lineId: "string",
    }),
  ),
});
export default effectEventHandler({
  config: handlerConfig,
  handler: /*@__PURE__*/ Effect.gen(function* () {
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
});
