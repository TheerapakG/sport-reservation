import { useCreateRunningAssessmentMutation } from "@/api/matching";
import { StandaloneFieldLabel } from "@/components/form/StandaloneFieldLabel";
import { useAppForm } from "@/utils/form";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Effect } from "effect";
import { getMatchingClientBodyType } from "sport-reservation-matching/models";
import { effectType } from "tiara-stack/utils/effectType";
function RouteComponent() {
  const router = useRouter();

  const createRunningAssessmentMutation = useCreateRunningAssessmentMutation();

  const form = useAppForm({
    defaultValues: {
      distance: undefined as undefined | number,
      pace: undefined as undefined | number,
      frequency: undefined as undefined | string,
      goal: [] as ("casual" | "race_training" | "speed_training" | "social")[],
      bestPerformance: {
        distance: undefined as undefined | number,
        time: undefined as undefined | number,
      },
    },
    validators: {
      onSubmit: getMatchingClientBodyType("createRunningAssessmentV1"),
    },
    onSubmit: async ({ value }) => {
      const data = await Effect.runPromise(
        effectType(
          getMatchingClientBodyType("createRunningAssessmentV1"),
          value,
        ),
      );
      await createRunningAssessmentMutation.mutateAsync({ data });
      await router.navigate({
        to: "/assessment/matching",
      });
    },
  });

  const frequencyOptions = [
    { label: "0 day", value: 0 },
    { label: "1 day", value: 1 },
    { label: "2 days", value: 2 },
    { label: "3 days", value: 3 },
    { label: "4 days", value: 4 },
    { label: "5 days", value: 5 },
    { label: "6 days", value: 6 },
    { label: "7 days", value: 7 },
  ];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      {/* Q1: Typical distance */}
      <form.AppField
        name="distance"
        children={(field) => (
          <field.NumericInputField
            label="1. What is your typical running distance?"
            placeholder="e.g. 10"
            trailingText="km"
            classNames={{
              input: "w-44",
            }}
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
            classNames={{
              input: "w-44",
            }}
          />
        )}
      />

      {/* Q3: Weekly frequency (days/week) as dropdown */}
      <form.AppField
        name="frequency"
        children={(field) => (
          <field.SelectInputField
            label="3. How many days per week do you run?"
            options={frequencyOptions}
          />
        )}
      />

      {/* Q4: Primary goal */}
      <form.AppField
        name="goal"
        children={(field) => (
          <field.MultipleChoiceField
            label="4. What is your primary goal?"
            options={[
              {
                label: "Casual",
                value: "casual",
              },
              {
                label: "Race training",
                value: "race_training",
              },
              {
                label: "Speed work",
                value: "speed_training",
              },
              { label: "Social", value: "social" },
            ]}
          />
        )}
      />

      {/* Q5: Best performance marker */}
      <div className="space-y-2">
        <StandaloneFieldLabel label="5. What is your best performance marker?" />
        <div className="flex gap-2">
          <form.AppField
            name="bestPerformance.distance"
            children={(field) => (
              <field.StandaloneNumericInputField
                placeholder="10"
                trailingText="K"
                classNames={{
                  input: "w-16",
                }}
              />
            )}
          />
          {"in"}
          <form.AppField
            name="bestPerformance.time"
            children={(field) => (
              <field.StandaloneNumericInputField
                placeholder="50"
                trailingText="minutes"
                classNames={{
                  input: "w-16",
                }}
              />
            )}
          />
        </div>
      </div>

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
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] px-4 py-2 text-white hover:opacity-90"
            >
              {isSubmitting ? "Saving..." : "Save and continue"}
            </button>
          )}
        />
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
