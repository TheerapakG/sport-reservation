import { Effect, Layer, Redacted } from "effect";
import {
  UploadFetch,
  uploadClient as _uploadClient,
  createUploadFetch,
} from "sport-reservation-upload";
import { RuntimeConfig } from "~/layers/config";

export const uploadClient = /*@__PURE__*/ _uploadClient.pipe(
  /*@__PURE__*/ Layer.provide(
    /*@__PURE__*/ Layer.effect(
      UploadFetch,
      /*@__PURE__*/ Effect.gen(function* () {
        const config = yield* yield* RuntimeConfig;
        return {
          fetch: createUploadFetch({
            baseURL: config.upload.baseUrl,
            headers: {
              Authorization: `Bearer ${Redacted.value(config.upload.secret)}`,
            },
          }),
        };
      }),
    ),
  ),
);
