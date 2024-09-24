import { S3 as S3Client } from "@aws-sdk/client-s3";
import { Context, Effect, Layer } from "effect";

export class S3 extends Context.Tag("S3")<S3, { s3: S3Client }>() {}

export const s3Live = Layer.effect(
  S3,
  Effect.gen(function* () {
    const config = useRuntimeConfig();
    return yield* Effect.tryPromise(async () => {
      return {
        s3: new S3Client({
          forcePathStyle: false,
          endpoint: config.s3.originEndpoint,
          region: "us-east-1",
          credentials: {
            accessKeyId: config.s3.key,
            secretAccessKey: config.s3.secret,
          },
        }),
      };
    });
  }),
);
