import { effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Console, Effect, Stream } from "effect";
import { defineEventHandlerConfig, response } from "tiara-stack/config";

export const handlerConfig = defineEventHandlerConfig({
  name: "getTestStream",
  response: response(type({ test: "string" }), { stream: true }),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)((streamSource) =>
  Effect.succeed(
    streamSource.pipe(
      Stream.haltAfter("1 seconds"),
      Stream.concat(Stream.drain(Stream.finalizer(Console.log("finalize")))),
      Stream.tap(() => Console.log(new Date())),
      Stream.flatMap(() => Stream.succeed({ test: "test" })),
    ),
  ),
);
