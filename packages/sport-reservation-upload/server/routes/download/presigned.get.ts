import {
  EventContext,
  EventParamsContext,
  effectEventHandler,
} from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { getHeader } from "h3";
import { defineEventHandlerConfig } from "tiara-stack/config";
import { noInferOut } from "tiara-stack/utils/noInfer";
import { AuthRepository } from "~/repositories/authRepository";
import { UploadRepository } from "~/repositories/uploadRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getDownloadPresignedUrl",
  response: type({
    url: "string",
  }),
  query: noInferOut(
    type({
      key: "string",
    }),
  ),
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

    const uploadRepository = yield* UploadRepository;
    const { url: resultUrl } = yield* uploadRepository.getPresignedUrl({
      key: query.key,
    });

    return { url: resultUrl };
  }),
});
