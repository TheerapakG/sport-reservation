import AssessmentHeaderComponent from "./AssessmentHeaderComponent";
import AssessmentContainerComponent from "./AssesssmentContainerComponent";

export default function LoadingFormComponent() {
  return (
    <AssessmentContainerComponent>
      <div className="mt-4">
        <AssessmentHeaderComponent
          title="Loading..."
          description="We are loading your assessment. Please wait a moment."
          className="mb-6"
        />
      </div>
    </AssessmentContainerComponent>
  );
}
