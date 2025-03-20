// src/routes/assessment.tsx
import { createFileRoute } from "@tanstack/react-router";
import AssessmentPage from "@/components/assessment/assessmentpage";

export const Route = createFileRoute("/_layout/assessment")({
  component: RouteComponent,
});

function RouteComponent() {
  return <AssessmentPage />;
}
