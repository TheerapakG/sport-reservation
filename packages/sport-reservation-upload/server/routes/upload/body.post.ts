import {
  EventContext,
  EventParamsContext,
  effectEventHandler,
} from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { getHeader, readMultipartFormData } from "h3";
import {
  defineEventHandlerConfig,
  defineExtendedTypeConfig,
} from "tiara-stack/config";
import { noInferOut } from "tiara-stack/utils/noInfer";
import { AuthRepository } from "~/repositories/authRepository";
import { UploadRepository } from "~/repositories/uploadRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "postUploadFromBody",
  response: type({
    key: "string",
  }),
  query: noInferOut(
    type({
      key: "string",
    }),
  ),
  body: defineExtendedTypeConfig({
    type: type("unknown"),
    decode: false as const,
  }),
});
export default effectEventHandler({
  config: handlerConfig,
  handler: /*@__PURE__*/ Effect.gen(function* () {
    const { event } = yield* EventContext;
    const {
      params: { query },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const authRepository = yield* AuthRepository;
    yield* authRepository.checkSecret({
      secret: getHeader(event, "authorization")?.split(" ", 2)[1] ?? "",
    });
    const fileData = Effect.tryPromise(
      async () => (await readMultipartFormData(event))?.[0].data,
    );
    const uploadRepository = yield* UploadRepository;
    const { key: resultKey } = yield* uploadRepository.upload({
      key: query.key,
      stream: (yield* fileData) ?? "",
    });

    return { key: resultKey };
  }),
});
