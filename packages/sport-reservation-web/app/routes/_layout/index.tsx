import { createFileRoute } from "@tanstack/react-router";

function IndexComponent() {
  return (
    <div className="p-2">
      <h3>"Sweat together... Spark together..."</h3>
    </div>
  );
}

export const Route = createFileRoute("/_layout/")({
  component: IndexComponent,
});
