import { EventParamsContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { UserClient } from "sport-reservation-user/client";
import { userProfile } from "sport-reservation-user/models";
import { defineEventHandlerConfig } from "tiara-stack/config";
import { noInferOut } from "tiara-stack/utils/noInfer";
import { AuthKey } from "~/layers";

export const handlerConfig = defineEventHandlerConfig({
  name: "getUserProfile",
  response: userProfile,
  query: noInferOut(
    type({
      token: "string",
    }),
  ),
});
export default effectEventHandler({
  config: handlerConfig,
  handler: /*@__PURE__*/ Effect.gen(function* () {
    const {
      params: { query },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const userClient = yield* UserClient;

    const authKey = yield* AuthKey;

    return yield* userClient.getUserProfile({ token: query.token, authKey });
  }),
});
