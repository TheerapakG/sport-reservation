import crypto from "crypto";
import { Context, Effect, pipe } from "effect";
import { LineLoginRepository } from "./lineLoginRepository";
import { lineRequestData } from "~~/models/line";
import { z } from "zod";

export const lineLoginRepositoryImpl = {
  generateRequest: () => {
    return pipe(
      Effect.succeed({
        state: crypto.randomBytes(64).toString("hex"),
        nonce: crypto.randomBytes(16).toString("hex"),
        codeVerifier: crypto.randomBytes(64).toString("hex"),
      }),
      Effect.tap(async ({ state, nonce, codeVerifier }) => {
        await useStorage().setItem<z.infer<typeof lineRequestData>>(
          `valkey:request:line:${state}`,
          { nonce, codeVerifier },
          { ttl: 600 },
        );
      }),
    );
  },
} satisfies Context.Tag.Service<LineLoginRepository>;
