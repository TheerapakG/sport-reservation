import { Effect, Layer, Redacted } from "effect";
import {
  UploadFetch,
  uploadClient as _uploadClient,
  createUploadFetch,
} from "sport-reservation-upload";
import { RuntimeConfig } from "~/layers/config";

export const uploadClient = _uploadClient.pipe(
  Layer.provide(
    Layer.effect(
      UploadFetch,
      Effect.gen(function* () {
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
