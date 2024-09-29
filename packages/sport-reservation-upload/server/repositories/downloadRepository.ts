import { Context, Effect } from "effect";
import {
  ArktypeError,
  FetchError,
} from "sport-reservation-common/models/errors";

export class DownloadRepository
  extends /*@__PURE__*/ Context.Tag("DownloadRepository")<
    DownloadRepository,
    {
      downloadUrl: (data: {
        url: string;
      }) => Effect.Effect<
        ReadableStream<Uint8Array>,
        ArktypeError | FetchError
      >;
    }
  >() {}
