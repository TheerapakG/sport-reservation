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
      Effect.try(() => {
        const config = useRuntimeConfig();
        return {
          fetch: createUploadFetch({ baseURL: config.upload.BaseUrl }),
        };
      }),
    ),
  ),
);
