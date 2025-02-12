import { Client, createClient } from "@openauthjs/openauth/client";
import { Context, Layer } from "effect";
import { config } from "../config";

export class OAuthClient extends Context.Tag("OAuthClient")<
  OAuthClient,
  Client
>() {}

export const oAuthClient = Layer.succeed(
  OAuthClient,
  createClient({
    clientID: "sport-reservation-web",
    issuer: config.oauth.issuer,
  }),
);
