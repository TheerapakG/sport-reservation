import { RuntimeConfig } from "$/layers";
import { Client, createClient } from "@openauthjs/openauth/client";
import { Context, Effect, Layer } from "effect";

export class OAuthClient
  extends /*@__PURE__*/ Context.Tag("OAuthClient")<
    OAuthClient,
    {
      client: Client;
    }
  >() {}

export const oAuthClient = /*@__PURE__*/ Layer.effect(
  OAuthClient,
  /*@__PURE__*/ Effect.gen(function* () {
    const config = yield* yield* RuntimeConfig;
    return {
      client: createClient({
        clientID: config.oauth.clientId,
        issuer: config.oauth.issuer,
      }),
    };
  }),
);
