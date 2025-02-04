import { StreamingBlobPayloadInputTypes } from "@smithy/types";
import { Context, Effect } from "effect";
import { S3Error } from "tiara-stack/models/errors";

export class UploadRepository
  extends /*@__PURE__*/ Context.Tag("UploadRepository")<
    UploadRepository,
    {
      generateUploadToken: () => Effect.Effect<{
        token: string;
      }>;
      upload: (data: {
        key: string;
        stream: StreamingBlobPayloadInputTypes;
      }) => Effect.Effect<{ key: string }, S3Error>;
      getPresignedUrl: (data: {
        key: string;
      }) => Effect.Effect<{ url: string }, S3Error>;
      delete: () => Effect.Effect<unknown>;
    }
  >() {}
