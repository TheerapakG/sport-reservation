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
import { DownloadRepository } from "~/repositories/downloadRepository";
import { UploadRepository } from "~/repositories/uploadRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "postUploadFromUrl",
  response: response(
    type({
      key: "string",
    }),
    { stream: false },
  ),
  body: params(
    type({
      key: "string",
      url: "string",
    }),
  ),
});
export default effectEventHandler({
  config: handlerConfig,
  handler: () =>
    /*@__PURE__*/ Effect.gen(function* () {
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
      const { key: resultKey } = yield* uploadRepository.upload({
        key: body.key,
        stream,
      });

      return { key: resultKey };
    }),
});
