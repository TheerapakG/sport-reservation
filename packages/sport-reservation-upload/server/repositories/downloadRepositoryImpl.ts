import { Effect, Layer } from "effect";
import { Fetch, typedFetch } from "sport-reservation-common/utils/fetch";
import { unknownType } from "sport-reservation-common/utils/type";
import { DownloadRepository } from "./downloadRepository";

export const downloadRepositoryImpl = /*@__PURE__*/ Layer.effect(
  DownloadRepository,
  /*@__PURE__*/ Effect.gen(function* () {
    const { fetch } = yield* Fetch;

    return {
      downloadUrl: ({ url }) => {
        return Effect.provideService(
          Effect.gen(function* () {
            return yield* typedFetch({ response: unknownType }, url, {
              responseType: "stream",
            });
          }),
          Fetch,
          { fetch },
        ).pipe(Effect.withSpan("downloadRepositoryImpl.downloadUrl"));
      },
    };
  }),
);
