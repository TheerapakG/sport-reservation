import { useExchangeMutation } from "@/api/oauth";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { type } from "arktype";
import { useEffect } from "react";

const CallbackComponent = () => {
  const { code } = Route.useLoaderData();

  const router = useRouter();

  const exchangeMutation = useExchangeMutation();

  useEffect(() => {
    (async () => {
      await exchangeMutation.mutateAsync({ code });
      await router.navigate({ to: "/" });
    })();
  }, [code, router, exchangeMutation]);

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
  loader: async ({ deps: { code } }) => {
    return { code };
  },
  component: CallbackComponent,
});
