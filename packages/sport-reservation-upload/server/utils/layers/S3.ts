import { S3 as S3Client } from "@aws-sdk/client-s3";
import { Context, Effect, Layer, Redacted } from "effect";

export class S3
  extends /*@__PURE__*/ Context.Tag("S3")<S3, { s3: S3Client }>() {}

export const s3Live = /*@__PURE__*/ Layer.effect(
  S3,
  /*@__PURE__*/ Effect.gen(function* () {
    const config = yield* RuntimeConfig;
    const s3ClientConfig = {
      forcePathStyle: false,
      endpoint: yield* config.s3.originEndpoint,
      region: "us-east-1",
      credentials: {
        accessKeyId: yield* config.s3.key,
        secretAccessKey: Redacted.value(yield* config.s3.secret),
      },
    };
    const s3 = yield* Effect.tryPromise(
      async () => new S3Client(s3ClientConfig),
    );
    return { s3 };
  }),
);
