import { useAppForm } from "@/utils/form";
import { createFileRoute, useRouter } from "@tanstack/react-router";

function RouteComponent() {
  const router = useRouter();
  const form = useAppForm({
    defaultValues: {
      distance: undefined as number | undefined,
      pace: undefined as number | undefined,
      weeklyFrequency: undefined as string | undefined,
      primaryGoal: undefined as string | undefined,
      performanceMarker: undefined as string | undefined,
    },
  });

  const frequencyOptions = [
    { label: "0 days", value: "0 days" },
    { label: "1 day", value: "1 day" },
    { label: "2 days", value: "2 days" },
    { label: "3 days", value: "3 days" },
    { label: "4 days", value: "4 days" },
    { label: "5 days", value: "5 days" },
    { label: "6 days", value: "6 days" },
    { label: "7 days", value: "7 days" },
  ];

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      {/* Q1: Typical distance */}
      <form.AppField
        name="distance"
        children={(field) => (
          <field.NumericInputField
            label="1. What is your typical running distance?"
            placeholder="e.g. 10"
            trailingText="km"
          />
        )}
      />

      {/* Q2: Pace (min/km) */}
      <form.AppField
        name="pace"
        children={(field) => (
          <field.NumericInputField
            label="2. What is your average pace?"
            placeholder="e.g. 5"
            trailingText="min/km"
          />
        )}
      />

      {/* Q3: Weekly frequency (days/week) as dropdown */}
      <form.AppField
        name="weeklyFrequency"
        children={(field) => (
          <field.SelectInputField
            label="3. How many days per week do you run?"
            options={frequencyOptions}
          />
        )}
      />

      {/* Q4: Primary goal */}
      <form.AppField
        name="primaryGoal"
        children={(field) => (
          <field.SingleChoiceField
            label="4. What is your primary goal?"
            options={[
              { label: "Casual", value: "Casual" },
              { label: "Race training", value: "Race training" },
              { label: "Social", value: "Social" },
              { label: "Speed work", value: "Speed work" },
            ]}
          />
        )}
      />

      {/* Q5: Best performance marker */}
      <form.AppField
        name="performanceMarker"
        children={(field) => (
          <field.TextInputField
            label="5. What is your best performance marker? (e.g., '10K in 50:00')"
            placeholder="e.g. 10K in 50:00"
          />
        )}
      />

      <div className="mt-6 flex justify-center space-x-4">
        <button
          onClick={() => {
            router.navigate({
              to: "/assessment/ipaq",
            });
          }}
          className="rounded border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-100"
        >
          Back
        </button>
        <button
          onClick={() => {
            router.navigate({
              to: "/assessment/matching",
            });
          }}
          className="rounded bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] px-4 py-2 text-white hover:opacity-90"
        >
          Save and continue
        </button>
      </div>
    </form>
  );
}

export const Route = createFileRoute("/_layout/assessment/performance/running")(
  {
    beforeLoad: () => {
      return { assessment: { step: 2, performance: { sport: "running" } } };
    },
    component: RouteComponent,
  },
);
