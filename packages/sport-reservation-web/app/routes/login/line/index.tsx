import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";

const renderIndex = createServerFn("GET", async () => {
  "use server";
  return;
});

function IndexComponent() {
  const result = Route.useLoaderData();

  return null;
}

export const Route = createFileRoute("/login/line/")({
  loader: async () => renderIndex(),
  component: IndexComponent,
});
