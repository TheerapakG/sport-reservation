import crypto from "crypto";
import { Effect } from "effect";
import { lineLoginRequest } from "~~/models/line.ts";
import { LineLoginRepository } from "~~/repositories/lineLoginRepository.ts";
import { effectEventHandler } from "~~/server/utils/effectEventHandler";
import { anyObject } from "sport-reservation-common/utils/type";
import { useUrl } from "sport-reservation-common/utils/useUrl";

export const handlerName = "getGenerateLineLoginRequest";
export const handlerType = lineLoginRequest;
export const handlerQueryParams = anyObject;
export const handlerRouterParams = anyObject;
export default effectEventHandler({
  type: handlerType,
  handler: /*@__PURE__*/ Effect.gen(function* () {
    const config = useRuntimeConfig();
    const lineloginRepository = yield* LineLoginRepository;
    const { state, nonce, codeVerifier, scope } =
      yield* lineloginRepository.generateRequest();
    return {
      url: useUrl({
        baseUrl: "https://access.line.me/oauth2/v2.1/authorize",
        searchParams: {
          responseType: "code",
          clientId: config.line.clientId as string,
          redirectUri: config.line.redirectUri as string,
          state,
          scope,
          nonce,
          codeChallenge: crypto
            .createHash("sha256")
            .update(codeVerifier)
            .digest("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=/g, ""),
          codeChallengeMethod: "S256",
        },
      }).toString(),
    };
  }),
});
