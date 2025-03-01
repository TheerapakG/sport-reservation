import { effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { defineEventHandlerConfig, response } from "tiara-stack/config";

export const handlerConfig = defineEventHandlerConfig({
  name: "getTest",
  response: response(type({ test: "string" })),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.succeed({ test: "test" }),
);
