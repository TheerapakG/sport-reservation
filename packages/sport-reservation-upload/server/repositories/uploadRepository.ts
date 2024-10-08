import { StreamingBlobPayloadInputTypes } from "@smithy/types";
import { Context, Effect } from "effect";
import { S3Error } from "sport-reservation-common/models/errors";

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
      }) => Effect.Effect<{ url: string }, S3Error>;
      delete: () => Effect.Effect<unknown>;
    }
  >() {}
