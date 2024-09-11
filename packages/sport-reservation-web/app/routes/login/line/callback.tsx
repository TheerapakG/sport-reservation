import { authClient } from "@/utils/client/authClient";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { arkTypeSearchValidator } from "@tanstack/router-arktype-adapter";
import { type } from "arktype";
import { Effect } from "effect";

const renderCallback = createServerFn(
  "POST",
  async ({ code, state }: { code: string; state: string }) => {
    "use server";

    await Effect.runPromise(
      Effect.gen(function* () {
        return yield* (yield* authClient).postGetLineLoginAuthToken({
          query: { code, state },
        });
      }),
    );

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
