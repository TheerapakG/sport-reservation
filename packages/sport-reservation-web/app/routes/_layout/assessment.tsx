import LoadingFormComponent from "@/components/assessment/LoadingFormComponent";
import StepProgressbarComponent from "@/components/assessment/StepProgressbarComponent";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { type } from "arktype";
import { Effect } from "effect";
import { lazy, Suspense } from "react";
import { effectTypeCheck } from "tiara-stack/utils/effectType";

const StepProgressbarComponents = [
  { step: 1, title: "Physical assessment" },
  { step: 2, title: "Performance evaluation" },
  { step: 3, title: "Enjoy your matching!" },
];

const AssessmentFormComponents = [
  {
    step: 1,
    component: lazy(() => import("@/components/assessment/ipaqFormComponent")),
  },
  {
    step: 2,
    component: lazy(
      () => import("@/components/assessment/performanceFormComponent"),
    ),
  },
  {
    step: 3,
    component: lazy(
      () => import("@/components/assessment/MatchingFormComponent"),
    ),
  },
];

export default function AssessmentComponent() {
  const { step: currentStep } = Route.useLoaderData();
  const router = useRouter();
  const CurrentFormComponent = AssessmentFormComponents.find(
    (component) => component.step === currentStep,
  )?.component;

  return (
    <div className="mx-auto max-w-3xl p-4">
      <div className="mb-6 flex items-center justify-center space-x-8">
        {StepProgressbarComponents.map((component) => (
          <StepProgressbarComponent
            key={component.step}
            step={component.step}
            title={component.title}
            currentStep={currentStep}
          />
        ))}
      </div>

      <div className="mb-4 text-center">
        <Link
          to="/assessment"
          search={{ step: currentStep + 1 }}
          className="text-sm text-gray-500 underline hover:text-gray-700"
        >
          Skip for now
        </Link>
      </div>

      {CurrentFormComponent && (
        <Suspense fallback={<LoadingFormComponent />}>
          <CurrentFormComponent
            onBack={() => {
              router.navigate({
                to: "/assessment",
                search: { step: currentStep - 1 },
              });
            }}
            onNext={() => {
              router.navigate({
                to: "/assessment",
                search: { step: currentStep + 1 },
              });
            }}
          />
        </Suspense>
      )}
    </div>
  );
}

const validateSearch = type({ step: "number" });

export const Route = createFileRoute("/_layout/assessment")({
  validateSearch,
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    return Effect.runSync(effectTypeCheck(deps));
  },
  component: AssessmentComponent,
});
