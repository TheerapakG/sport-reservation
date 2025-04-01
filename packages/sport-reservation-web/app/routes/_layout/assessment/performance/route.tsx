import AssessmentContainerComponent from "@/components/assessment/AssessmentContainerComponent";
import AssessmentHeaderComponent from "@/components/form/FormHeaderComponent";
import {
  createFileRoute,
  Outlet,
  useChildMatches,
  useRouter,
} from "@tanstack/react-router";

const ActiveSportTabComponents = [
  { sport: "badminton", title: "Badminton" },
  { sport: "tennis", title: "Tennis" },
  { sport: "running", title: "Running" },
] as const;

export default function AssessmentComponent() {
  const router = useRouter();
  const currentSport = useChildMatches({
    select: (matches) =>
      matches.reverse().find((d) => d.context?.assessment?.performance?.sport)
        ?.context?.assessment?.performance?.sport,
  });

  return (
    <AssessmentContainerComponent>
      <div className="mt-4">
        {/* Tabs inside the card */}
        <div className="mb-6 flex space-x-2 text-sm font-medium">
          {ActiveSportTabComponents.map((sport) => {
            return (
              <button
                key={sport.sport}
                onClick={() => {
                  router.navigate({
                    to: `/assessment/performance/${sport.sport}`,
                  });
                }}
                className={`rounded-full border px-4 py-1 ${
                  sport.sport === currentSport
                    ? "border-[#65D1F8] bg-[#E1F8FE] text-[#65D1F8]"
                    : "border-gray-300 text-gray-500 hover:bg-gray-100"
                }`}
              >
                {sport.title}
              </button>
            );
          })}
        </div>

        <AssessmentHeaderComponent
          title="Rate your performance!"
          description="Describe your skills, experience, and style so we can fine-tune your matches and ensure you find the best partner."
          className="mb-6"
        />

        <Outlet />
      </div>
    </AssessmentContainerComponent>
  );
}

export const Route = createFileRoute("/_layout/assessment/performance")({
  beforeLoad: () => {
    return { assessment: { step: 2, performance: undefined } };
  },
  component: AssessmentComponent,
});
