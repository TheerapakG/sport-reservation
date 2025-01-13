import { type } from "arktype";
import { Effect } from "effect";
import jwt from "jsonwebtoken";
import { EventParamsContext } from "sport-reservation-common/utils/effectEventHandler";
import { effectType } from "sport-reservation-common/utils/effectType";
import { defineEventHandlerConfig } from "sport-reservation-common/utils/eventHandlerConfig";
import { noInferOut } from "sport-reservation-common/utils/noInfer";
import { userProfile } from "sport-reservation-user/models";
import { AuthKey } from "~/layers";
import { effectEventHandler } from "~/utils/effectEventHandler";

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

    const authKey = yield* AuthKey;
    const jwtPayload = yield* Effect.try(() =>
      jwt.verify(query.token, authKey.public, {
        algorithms: ["RS256"],
        complete: true,
      }),
    );

    const profile = yield* effectType(userProfile, jwtPayload.payload);

    return profile;
  }),
});
