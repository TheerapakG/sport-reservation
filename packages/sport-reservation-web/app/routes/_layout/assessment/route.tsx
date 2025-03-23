import StepProgressbarComponent from "@/components/assessment/StepProgressbarComponent";
import {
  createFileRoute,
  Link,
  linkOptions,
  Outlet,
  useChildMatches,
} from "@tanstack/react-router";

const StepProgressbarComponents = [
  {
    step: 1,
    title: "Physical assessment",
    link: linkOptions({ to: "/assessment/ipaq" }),
  },
  {
    step: 2,
    title: "Performance evaluation",
    link: linkOptions({ to: "/assessment/performance/badminton" }),
  },
  {
    step: 3,
    title: "Enjoy your matching!",
    link: linkOptions({ to: "/assessment/matching" }),
  },
];

export default function AssessmentComponent() {
  const currentStep =
    useChildMatches({
      select: (matches) =>
        matches.reverse().find((d) => d.context?.assessment?.step)?.context
          ?.assessment?.step,
    }) ?? 1;

  const skipLink = StepProgressbarComponents.find(
    (d) => d.step === currentStep + 1,
  )?.link;

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

      {skipLink && (
        <div className="mb-4 text-center">
          <Link
            {...skipLink}
            className="text-sm text-gray-500 underline hover:text-gray-700"
          >
            Skip for now
          </Link>
        </div>
      )}

      <Outlet />
    </div>
  );
}

export const Route = createFileRoute("/_layout/assessment")({
  component: AssessmentComponent,
});
