import { exchangeQueryOptions, oauthKeys } from "@/api/oauth";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { type } from "arktype";
import { Effect } from "effect";
import { useEffect } from "react";
import { effectTypeCheck } from "tiara-stack/utils/effectType";

const exchangeAndRedirect = async ({
  queryClient,
  router,
  code,
}: {
  queryClient: ReturnType<typeof useQueryClient>;
  router: ReturnType<typeof useRouter>;
  code: string;
}) => {
  await queryClient.fetchQuery(exchangeQueryOptions({ code }));
  await queryClient.invalidateQueries({
    queryKey: oauthKeys.all(),
  });
  await router.navigate({ to: "/" });
};

const CallbackComponent = () => {
  const { code } = Route.useLoaderData();

  const queryClient = useQueryClient();
  const router = useRouter();
  useEffect(() => {
    exchangeAndRedirect({ queryClient, router, code });
  });

  return (
    <div className="p-2">
      <h3>Redirecting...</h3>
    </div>
  );
};

const validateSearch = type({ code: "string" });

export const Route = createFileRoute("/_layout/login/callback")({
  validateSearch,
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    return Effect.runSync(effectTypeCheck(deps));
  },
  component: CallbackComponent,
});
