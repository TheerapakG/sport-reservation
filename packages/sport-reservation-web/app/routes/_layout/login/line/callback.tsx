import { authKeys, lineLoginAuthTokenQueryOptions } from "@/api/auth";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { type } from "arktype";
import { Effect } from "effect";
import { useEffect } from "react";
import { effectTypeCheck } from "sport-reservation-common/utils/effectType";

const authAndRedirect = async ({
  queryClient,
  router,
  code,
  state,
}: {
  queryClient: ReturnType<typeof useQueryClient>;
  router: ReturnType<typeof useRouter>;
  code: string;
  state: string;
}) => {
  await queryClient.fetchQuery(lineLoginAuthTokenQueryOptions({ code, state }));
  await queryClient.invalidateQueries({
    queryKey: authKeys.token.all(),
  });
  await router.navigate({ to: "/" });
};

const CallbackComponent = () => {
  const { code, state } = Route.useLoaderData();

  const queryClient = useQueryClient();
  const router = useRouter();
  useEffect(() => {
    authAndRedirect({ queryClient, router, code, state });
  });

  return (
    <div className="p-2">
      <h3>Redirecting...</h3>
    </div>
  );
};

const validateSearch = type({ code: "string", state: "string" });

export const Route = createFileRoute("/_layout/login/line/callback")({
  validateSearch,
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    return Effect.runSync(effectTypeCheck(deps));
  },
  component: CallbackComponent,
});
