import { Effect, pipe } from "effect";
import crypto from "crypto";
import { LineLoginRequest } from "sport-reservation-common/schema/auth/login/line";
import { z } from "zod";
import { LineLoginRepository } from "~~/repositories/lineLoginRepository";

export default effectEventHandler(
  pipe(
    Effect.zip(
      Effect.succeed({ config: useRuntimeConfig() }),
      pipe(
        LineLoginRepository,
        Effect.andThen((lineloginRepository) =>
          lineloginRepository.generateRequest(),
        ),
      ),
    ),
    Effect.andThen(async ([{ config }, { state, nonce, codeVerifier }]) => {
      return await LineLoginRequest.parseAsync({
        responseType: "code",
        clientId: config.line.clientId,
        redirectUri: config.line.redirectUri,
        state,
        scope: "profile openid",
        nonce,
        codeChallenge: crypto
          .createHash("sha256")
          .update(codeVerifier)
          .digest("base64")
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=/g, ""),
        codeChallengeMethod: "S256",
      } satisfies z.infer<typeof LineLoginRequest>);
    }),
  ),
);
