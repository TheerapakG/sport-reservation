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
import { GoogleLoginDbRepository } from "~/repositories/googleLoginDbRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getIdByGoogleId",
  response: response(
    type({
      "id?": "string",
    }),
    { stream: false },
  ),
  query: params(
    type({
      googleId: "string",
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

    const googleLoginDbRepository = yield* GoogleLoginDbRepository;
    const { userId } = Option.getOrUndefined(
      yield* googleLoginDbRepository.findUserIdByPlatformId({
        platformId: query.googleId,
      }),
    ) ?? { userId: undefined };

    return {
      id: userId,
    };
  }),
);
