import { effectEventHandler, EventAbort } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect, Stream } from "effect";
import { defineEventHandlerConfig, response } from "tiara-stack/config";

export const handlerConfig = defineEventHandlerConfig({
  name: "getTest",
  response: response(type({ test: "string" }), { stream: true }),
});

export default effectEventHandler({
  config: handlerConfig,
  handler: () =>
    /*@__PURE__*/ Stream.tick("1 seconds").pipe(
      Stream.haltWhen(
        Effect.gen(function* () {
          const { abort } = yield* EventAbort;
          yield* abort.await;
        }),
      ),
      Stream.flatMap(() => Stream.succeed({ test: "test" })),
    ),
});
