import { Effect, Layer } from "effect";
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
        const config = yield* RuntimeConfig;
        return {
          fetch: createUploadFetch({
            baseURL: yield* config.upload.baseUrl,
            headers: { Authorization: `Bearer ${config.upload.secret}` },
          }),
        };
      }),
    ),
  ),
);
