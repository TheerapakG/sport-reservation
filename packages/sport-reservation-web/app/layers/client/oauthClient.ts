import { Client, createClient } from "@openauthjs/openauth/client";
import { Context, Effect, Layer } from "effect";
import { RuntimeConfig } from "../config";

export class OAuthClient extends Context.Tag("OAuthClient")<
  OAuthClient,
  Client
>() {}

export const oAuthClient = Layer.effect(
  OAuthClient,
  /*@__PURE__*/ Effect.gen(function* () {
    const config = yield* yield* RuntimeConfig;
    return createClient({
      clientID: "sport-reservation-web",
      issuer: config.oauth.issuer,
    });
  }),
);
