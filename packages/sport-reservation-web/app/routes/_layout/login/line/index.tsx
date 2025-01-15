import { authKeys, lineLoginRequestQueryOptions } from "@/api/auth";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

function IndexComponent() {
  const loginRequest = useSuspenseQuery(lineLoginRequestQueryOptions());

  useEffect(() => {
    window.location.replace(loginRequest.data.request.url);
  }, [loginRequest]);

  return (
    <div className="p-2">
      <h3>Redirecting...</h3>
    </div>
  );
}

export const Route = createFileRoute("/_layout/login/line/")({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.invalidateQueries({ queryKey: authKeys.line.all() });
    queryClient.prefetchQuery(lineLoginRequestQueryOptions());
  },
  component: IndexComponent,
});
