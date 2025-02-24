import {
  EventContext,
  EventParamsContext,
  effectEventHandler,
} from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { getHeader, readMultipartFormData } from "h3";
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
  query: params(
    type({
      key: "string",
    }),
  ),
  body: params(type("unknown"), { decode: false }),
});
export default effectEventHandler({
  config: handlerConfig,
  handler: () =>
    /*@__PURE__*/ Effect.gen(function* () {
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
