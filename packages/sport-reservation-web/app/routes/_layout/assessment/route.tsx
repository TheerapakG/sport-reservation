import StepProgressbarComponent from '@/components/assessment/StepProgressbarComponent'
import {
  createFileRoute,
  Link,
  Outlet,
  useChildMatches,
} from '@tanstack/react-router'

const StepProgressbarComponents = [
  { step: 1, title: 'Physical assessment' },
  { step: 2, title: 'Performance evaluation' },
  { step: 3, title: 'Enjoy your matching!' },
]

export default function AssessmentComponent() {
  const currentStep =
    useChildMatches({
      select: (matches) =>
        matches.reverse().find((d) => d.context?.assessment?.step)?.context
          ?.assessment?.step,
    }) ?? 1

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

      <Outlet />
    </div>
  )
}

export const Route = createFileRoute('/_layout/assessment')({
  component: AssessmentComponent,
})
