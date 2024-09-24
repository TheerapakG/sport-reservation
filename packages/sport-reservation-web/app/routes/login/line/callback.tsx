import { authClient } from "@/utils/client/authClient";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { arkTypeSearchValidator } from "@tanstack/router-arktype-adapter";
import { type } from "arktype";
import { Effect } from "effect";
import { setCookie } from "vinxi/http";
import { AuthClient } from "sport-reservation-auth";
import { decode, JwtPayload } from "jsonwebtoken";

const renderCallback = createServerFn(
  "POST",
  async ({ code, state }: { code: string; state: string }) => {
    "use server";

    const { token } = await Effect.runPromise(
      Effect.provide(
        Effect.gen(function* () {
          return yield* (yield* AuthClient).postGetLineLoginAuthToken({
            body: { code, state },
          });
        }),
        authClient,
      ),
    );

    setCookie("token", token, {
      expires: new Date(
        ((decode(token, { complete: true })?.payload as JwtPayload)?.exp ?? 0) *
          1000,
      ),
      secure: true,
    });

    throw redirect({ to: "/" });
  },
);

const callbackQueryParams = type({
  code: "string",
  state: "string",
});

export const Route = createFileRoute("/login/line/callback")({
  validateSearch: arkTypeSearchValidator(callbackQueryParams),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => renderCallback(deps),
});
