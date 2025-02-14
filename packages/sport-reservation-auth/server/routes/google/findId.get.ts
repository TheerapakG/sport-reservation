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
import { GoogleLoginDbRepository } from "~/repositories/googleLoginDbRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getIdByGoogleId",
  response: type({
    id: "string?",
  }),
  query: noInferOut(
    type({
      googleId: "string",
    }),
  ),
});
export default effectEventHandler({
  config: handlerConfig,
  handler: () =>
    /*@__PURE__*/ Effect.gen(function* () {
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
        yield* googleLoginDbRepository.findUserIdByGoogleId({
          googleId: query.googleId,
        }),
      ) ?? { userId: undefined };

      return {
        id: userId,
      };
    }),
});
