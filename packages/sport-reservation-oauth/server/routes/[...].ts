import { EventContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { toWebRequest } from "h3";
import { defineEventHandlerConfig, response } from "tiara-stack/config";
import { Issuer } from "../layers/issuer";

export const handlerConfig = defineEventHandlerConfig({
  name: "oauth",
  response: response(type("Response"), { stream: false }),
});
export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const { event } = yield* EventContext;
    const request = toWebRequest(event);
    const { issuer } = yield* Issuer;
    return yield* Effect.promise(async () => await issuer.fetch(request));
  }),
);
