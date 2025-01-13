import { authKeys, lineLoginAuthTokenQueryOptions } from "@/api/auth";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { type } from "arktype";
import { Effect } from "effect";
import { effectTypeCheck } from "sport-reservation-common/utils/effectType";

const CallbackComponent = () => {
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
  loader: async ({ deps, context: { queryClient } }) => {
    const { code, state } = Effect.runSync(effectTypeCheck(deps));
    await queryClient.ensureQueryData(
      lineLoginAuthTokenQueryOptions({ code, state }),
    );
    await queryClient.invalidateQueries({
      queryKey: authKeys.token.all(),
    });
    throw redirect({
      to: "/",
    });
  },
  component: CallbackComponent,
});
