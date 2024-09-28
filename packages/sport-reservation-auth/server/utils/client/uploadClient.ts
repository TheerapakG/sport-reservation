import {
  UploadFetch,
  createUploadFetch,
  uploadClient as _uploadClient,
} from "sport-reservation-upload";
import { Effect, Layer } from "effect";

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
