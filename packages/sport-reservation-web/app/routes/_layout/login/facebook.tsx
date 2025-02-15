import { loginQueryOptions } from "@/api/oauth";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

function IndexComponent() {
  const loginRequest = useSuspenseQuery(
    loginQueryOptions({ provider: "facebook" }),
  );

  useEffect(() => {
    window.location.replace(loginRequest.data.url);
  }, [loginRequest]);

  return (
    <div className="p-2">
      <h3>Redirecting...</h3>
    </div>
  );
}

export const Route = createFileRoute("/_layout/login/facebook")({
  loader: async ({ context: { queryClient } }) => {
    queryClient.prefetchQuery(loginQueryOptions({ provider: "facebook" }));
  },
  component: IndexComponent,
});
