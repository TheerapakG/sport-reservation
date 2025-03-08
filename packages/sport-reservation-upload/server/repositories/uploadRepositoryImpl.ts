import { RuntimeConfig } from "$/layers";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Effect, Layer } from "effect";
import { S3Error } from "tiara-stack/models/errors";
import { S3 } from "~/layers/S3";
import { UploadRepository } from "./uploadRepository";

export const uploadRepositoryImpl = /*@__PURE__*/ Layer.effect(
  UploadRepository,
  /*@__PURE__*/ Effect.gen(function* () {
    const config = yield* yield* RuntimeConfig;
    const { s3 } = yield* S3;

    return UploadRepository.of({
      generateUploadToken: () =>
        Effect.succeed({ token: "" }).pipe(
          Effect.withSpan("uploadRepositoryImpl.generateUploadToken"),
        ),
      upload: ({ key, stream }) =>
        Effect.gen(function* () {
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
          return { key };
        }).pipe(Effect.withSpan("uploadRepositoryImpl.upload")),
      getPresignedUrl: ({ key }) =>
        Effect.gen(function* () {
          const command = new GetObjectCommand({
            Bucket: config.s3.bucket,
            Key: `reservation${key}`,
          });
          const url = yield* Effect.mapError(
            Effect.tryPromise(
              async () =>
                await getSignedUrl(s3, command, { expiresIn: 60 * 60 * 24 }),
            ),
            (error) => new S3Error(error.error as Error),
          );
          return { url };
        }).pipe(Effect.withSpan("uploadRepositoryImpl.getPresignedUrl")),
      delete: () =>
        Effect.gen(function* () {}).pipe(
          Effect.withSpan("uploadRepositoryImpl.delete"),
        ),
    });
  }),
);
