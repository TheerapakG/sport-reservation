import { EventContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { sendWebResponse, toWebRequest } from "h3";
import { defineEventHandlerConfig } from "tiara-stack/config";
import { Issuer } from "../layers/issuer";

export const handlerConfig = defineEventHandlerConfig({
  name: "oauth",
  response: type("unknown"),
});
export default effectEventHandler({
  config: handlerConfig,
  handler: () =>
    /*@__PURE__*/ Effect.gen(function* () {
      const { event } = yield* EventContext;
      const request = toWebRequest(event);
      const { issuer } = yield* Issuer;
      const response = yield* Effect.promise(
        async () => await issuer.fetch(request),
      );
      yield* Effect.promise(async () => await sendWebResponse(event, response));
    }),
});
