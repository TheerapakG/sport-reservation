// src/pages/AssessmentPage.tsx
import React, { useState } from "react";
import StepProgressBar from "@/components/assessment/stepprogressbar";
import PhysicalAssessmentForm from "@/components/assessment/ipaq";
import PerformanceForm from "@/components/assessment/performanceform";

export default function AssessmentPage() {
  // Step 1 (IPAQ) or Step 2 (Performance)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  function handleNextStep() {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else {
      // Final submission or navigation logic
      alert("Assessment complete! Proceed to matching or next step.");
    }
  }

  function handleBackStep() {
    if (currentStep > 1) {
      setCurrentStep(1);
    }
  }

  function handleSkip() {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else {
      alert("Assessment complete (skipped)!");
    }
  }

  return (
    // Revert to max-w-3xl (~48rem wide)
    <div className="mx-auto max-w-3xl p-4">
      {/* Step Progress Bar */}
      <StepProgressBar currentStep={currentStep} />

      {/* "Skip for now" link below the progress bar */}
      <div className="mb-4 text-center">
        <button
          onClick={handleSkip}
          className="text-sm text-gray-500 underline hover:text-gray-700"
        >
          Skip for now
        </button>
      </div>

      {/* Render the appropriate form */}
      {currentStep === 1 ? (
        <PhysicalAssessmentForm
          onBack={handleBackStep}
          onNext={handleNextStep}
        />
      ) : (
        <PerformanceForm onBack={handleBackStep} onNext={handleNextStep} />
      )}
    </div>
  );
}
