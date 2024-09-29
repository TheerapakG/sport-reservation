import { type } from "arktype";
import { Effect } from "effect";
import {
  EventContext,
  EventParamsContext,
} from "sport-reservation-common/utils/effectEventHandler";
import { defineEventHandlerConfig } from "sport-reservation-common/utils/eventHandlerConfig";
import { noInferOut } from "sport-reservation-common/utils/noInfer";
import { AuthRepository } from "~/repositories/authRepository";
import { DownloadRepository } from "~/repositories/downloadRepository";
import { UploadRepository } from "~/repositories/uploadRepository";
import { effectEventHandler } from "~/utils/effectEventHandler";

export const handlerConfig = defineEventHandlerConfig({
  name: "postUploadFromUrl",
  response: type({
    url: "string",
  }),
  body: noInferOut(
    type({
      key: "string",
      url: "string",
    }),
  ),
});
export default effectEventHandler({
  config: handlerConfig,
  handler: /*@__PURE__*/ Effect.gen(function* () {
    const { event } = yield* EventContext;
    const {
      params: { body },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const authRepository = yield* AuthRepository;
    yield* authRepository.checkSecret({
      secret: getHeader(event, "authorization")?.split(" ", 2)[1] ?? "",
    });

    const downloadRepository = yield* DownloadRepository;
    const stream = yield* downloadRepository.downloadUrl({ url: body.url });
    const uploadRepository = yield* UploadRepository;
    const { url: resultUrl } = yield* uploadRepository.upload({
      key: body.key,
      stream,
    });

    return { url: resultUrl };
  }),
});
