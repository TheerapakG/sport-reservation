import { Effect, Layer } from "effect";
import { defineFetchConfig } from "tiara-stack/config/fetchConfig";
import { Fetch, typedFetch } from "tiara-stack/utils/fetch";
import { unknownType } from "tiara-stack/utils/type";
import { DownloadRepository } from "./downloadRepository";
import { response } from "tiara-stack/config/effectConfig";

export const downloadRepositoryImpl = /*@__PURE__*/ Layer.effect(
  DownloadRepository,
  /*@__PURE__*/ Effect.gen(function* () {
    const { fetch } = yield* Fetch;

    return DownloadRepository.of({
      downloadUrl: ({ url }) => {
        return Effect.provideService(
          Effect.gen(function* () {
            return yield* typedFetch(
              defineFetchConfig({
                response: response(unknownType),
              }),
              url,
              {
                responseType: "stream",
              },
            );
          }),
          Fetch,
          { fetch },
        ).pipe(Effect.withSpan("downloadRepositoryImpl.downloadUrl"));
      },
    });
  }),
);
