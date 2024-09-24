import { Effect, Layer } from "effect";
import { UploadRepository } from "./uploadRepository";
import { S3Error } from "sport-reservation-common/models/errors";
import { Upload } from "@aws-sdk/lib-storage";
import { S3 } from "~~/server/utils/S3";

export const uploadRepositoryImpl = /*@__PURE__*/ Layer.effect(
  UploadRepository,
  /*@__PURE__*/ Effect.gen(function* () {
    const { s3 } = yield* S3;

    return {
      generateUploadToken: () => Effect.succeed({ token: "" }),
      upload: ({ key, stream }) =>
        Effect.gen(function* () {
          const config = useRuntimeConfig();
          const upload = new Upload({
            client: s3,
            params: {
              Bucket: config.s3.bucket,
              Key: `reservation${key}`,
              Body: stream,
            },
          });
          yield* Effect.mapError(
            Effect.tryPromise(async () => await upload.done()),
            (error) => new S3Error(error.error as Error),
          );
          return { url: `${config.s3.domainEndpoint}/reservation${key}` };
        }),
      delete: () => Effect.gen(function* () {}),
    };
  }),
);
