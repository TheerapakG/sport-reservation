import { type } from "arktype";
import { Effect } from "effect";
import { effectEventHandler } from "~~/server/utils/effectEventHandler";
import { AuthRepository } from "~~/repositories/authRepository";
import { effectType } from "sport-reservation-common/utils/effectType";
import { DownloadRepository } from "~~/repositories/downloadRepository";
import { UploadRepository } from "~~/repositories/uploadRepository";
import { defineEventHandlerConfig } from "sport-reservation-common/utils/eventHandlerConfig";
import { EventContext } from "sport-reservation-common/utils/effectEventHandler";
import { noInferOut } from "sport-reservation-common/utils/noInfer";

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
    const authRepository = yield* AuthRepository;
    yield* authRepository.checkSecret({
      secret: getHeader(event, "authorization")?.split(" ", 2)[1] ?? "",
    });

    const { key, url: receivedUrl } = yield* effectType(
      handlerConfig.body,
      yield* Effect.tryPromise(async () => await readBody(event)),
    );

    const downloadRepository = yield* DownloadRepository;
    const stream = yield* downloadRepository.downloadUrl({ url: receivedUrl });
    const uploadRepository = yield* UploadRepository;
    const { url: resultUrl } = yield* uploadRepository.upload({ key, stream });

    return { url: resultUrl };
  }),
});
