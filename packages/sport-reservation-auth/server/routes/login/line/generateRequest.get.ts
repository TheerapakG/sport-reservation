import crypto from "crypto";
import { Effect } from "effect";
import { defineEventHandlerConfig } from "sport-reservation-common/utils/eventHandlerConfig";
import { useUrl } from "sport-reservation-common/utils/useUrl";
import { RuntimeConfig } from "~/layers";
import { lineLoginRequest } from "~/models/line.ts";
import { LineLoginRepository } from "~/repositories/lineLoginRepository";
import { effectEventHandler } from "~/utils/effectEventHandler";

export const handlerConfig = defineEventHandlerConfig({
  name: "getGenerateLineLoginRequest",
  response: lineLoginRequest,
});
export default effectEventHandler({
  config: handlerConfig,
  handler: /*@__PURE__*/ Effect.gen(function* () {
    const config = yield* yield* RuntimeConfig;
    const lineloginRepository = yield* LineLoginRepository;
    const { state, nonce, codeVerifier, scope } =
      yield* lineloginRepository.generateRequest();
    return {
      url: useUrl({
        baseUrl: "https://access.line.me/oauth2/v2.1/authorize",
        searchParams: {
          response_type: "code",
          client_id: config.line.client.id,
          redirect_uri: config.line.redirectUri,
          state,
          scope,
          nonce,
          code_challenge: crypto
            .createHash("sha256")
            .update(codeVerifier)
            .digest("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=/g, ""),
          code_challenge_method: "S256",
        },
      }).toString(),
    };
  }),
});
