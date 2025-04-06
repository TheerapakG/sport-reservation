import { useLogoutMutation } from "@/api/oauth";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

function RouteComponent() {
  const router = useRouter();

  const logoutMutation = useLogoutMutation();

  useEffect(() => {
    (async () => {
      await logoutMutation.mutateAsync({});
      await router.navigate({ to: "/" });
    })();
  }, [router, logoutMutation]);

  return (
    <div className="p-2">
      <h3>Logging out...</h3>
    </div>
  );
}

export const Route = createFileRoute("/_layout/logout/")({
  component: RouteComponent,
});
