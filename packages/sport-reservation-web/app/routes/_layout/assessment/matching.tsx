import AssessmentHeaderComponent from "@/components/assessment/AssessmentHeaderComponent";
import AssessmentContainerComponent from "@/components/assessment/AssesssmentContainerComponent";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

export default function MatchingAssessmentComponent() {
  const router = useRouter();

  useEffect(() => {
    const navigateToMatching = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await router.navigate({ to: "/matching", replace: true });
    };
    navigateToMatching();
  });

  return (
    <AssessmentContainerComponent>
      <div className="mt-4">
        <AssessmentHeaderComponent
          title="You are done!"
          description="We are now ready to find you your best buddy. Please wait a moment while we are taking you to the matching page."
          className="mb-6"
        />
      </div>
    </AssessmentContainerComponent>
  );
}

export const Route = createFileRoute("/_layout/assessment/matching")({
  beforeLoad: () => {
    return { assessment: { step: 3, performance: undefined } };
  },
  component: MatchingAssessmentComponent,
});
