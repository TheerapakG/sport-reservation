import { authGetGenerateLineLoginRequest } from "@/utils/fetch/authFetch";
import { useUrl } from "@/utils/useUrl";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { Effect } from "effect";
import { useEffect } from "react";

const renderIndex = createServerFn("GET", async () => {
  "use server";
  return await Effect.runPromise(authGetGenerateLineLoginRequest({}));
});

function IndexComponent() {
  const {
    responseType,
    clientId,
    redirectUri,
    state,
    scope,
    nonce,
    codeChallenge,
    codeChallengeMethod,
  } = Route.useLoaderData();

  const url = useUrl({
    baseUrl: "https://access.line.me/oauth2/v2.1/authorize",
    searchParams: {
      response_type: responseType,
      client_id: clientId,
      redirect_uri: redirectUri,
      state: state,
      scope: scope,
      nonce: nonce,
      code_challenge: codeChallenge,
      code_challenge_method: codeChallengeMethod,
    },
  });

  useEffect(() => {
    window.location.replace(url);
  }, []);

  return null;
}

export const Route = createFileRoute("/login/line/")({
  loader: async () => renderIndex(),
  component: IndexComponent,
});
