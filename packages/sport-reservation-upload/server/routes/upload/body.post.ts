import {
  EventContext,
  EventParamsContext,
  effectEventHandler,
} from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { getHeader } from "h3";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { AuthRepository } from "~/repositories/authRepository";
import { UploadRepository } from "~/repositories/uploadRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "postUploadFromBody",
  response: response(
    type({
      key: "string",
    }),
    { stream: false },
  ),
  body: params(type({ key: "string", file: "File" })),
});
export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const { event } = yield* EventContext;
    const {
      params: { body },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const authRepository = yield* AuthRepository;
    yield* authRepository.checkSecret({
      secret: getHeader(event, "authorization")?.split(" ", 2)[1] ?? "",
    });
    const fileStream = Effect.tryPromise(async () => await body.file.stream());
    const uploadRepository = yield* UploadRepository;
    const { key: resultKey } = yield* uploadRepository.upload({
      key: body.key,
      stream: yield* fileStream,
    });

    return { key: resultKey };
  }),
);
