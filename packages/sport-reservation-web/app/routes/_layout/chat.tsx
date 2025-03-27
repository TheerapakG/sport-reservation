// src/routes/assessment.tsx
import { createFileRoute } from "@tanstack/react-router";
import ChatPage from "@/components/chatpage";

export const Route = createFileRoute("/_layout/chat")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ChatPage />;
}
