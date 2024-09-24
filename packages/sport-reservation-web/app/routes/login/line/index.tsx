import { authClient } from "@/utils/client/authClient";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { Effect } from "effect";
import { useEffect } from "react";
import { AuthClient } from "sport-reservation-auth";

const renderIndex = createServerFn("GET", async () => {
  "use server";
  return await Effect.runPromise(
    Effect.provide(
      Effect.gen(function* () {
        return yield* (yield* AuthClient).getGenerateLineLoginRequest({});
      }),
      authClient,
    ),
  );
});

function IndexComponent() {
  const { url } = Route.useLoaderData();

  useEffect(() => {
    window.location.replace(url);
  }, [url]);

  return null;
}

export const Route = createFileRoute("/login/line/")({
  loader: async () => renderIndex(),
  component: IndexComponent,
});
