import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login/line/callback")({
  component: () => <div>Hello /login/callback/line/callback!</div>,
});
