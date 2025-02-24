import { effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Stream } from "effect";
import { defineEventHandlerConfig, response } from "tiara-stack/config";

export const handlerConfig = defineEventHandlerConfig({
  name: "getTest",
  response: response(type("number"), { stream: true }),
});

export default effectEventHandler({
  config: handlerConfig,
  handler: () =>
    /*@__PURE__*/ Stream.tick("1 second").pipe(
      Stream.flatMap(() => Stream.succeed(1)),
    ),
});
