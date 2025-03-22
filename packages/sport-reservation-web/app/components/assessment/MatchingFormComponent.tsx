import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import AssessmentHeaderComponent from "./AssessmentHeaderComponent";
import AssessmentContainerComponent from "./AssesssmentContainerComponent";

export default function MatchingFormComponent() {
  const router = useRouter();

  useEffect(() => {
    const navigateToMatching = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await router.navigate({ to: "/matching" });
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
