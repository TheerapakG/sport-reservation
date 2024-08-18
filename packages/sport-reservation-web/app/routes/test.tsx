import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { Effect } from "effect";

import { authGet } from "@/utils/fetch/authFetch";

const renderTest = createServerFn("GET", async () => {
  "use server";
  return await Effect.runPromise(authGet());
});

function TestComponent() {
  const result = Route.useLoaderData();

  return (
    <div className="p-2">
      <h3>Result: {result}</h3>
    </div>
  );
}

export const Route = createFileRoute("/test")({
  loader: async () => renderTest(),
  component: TestComponent,
});
