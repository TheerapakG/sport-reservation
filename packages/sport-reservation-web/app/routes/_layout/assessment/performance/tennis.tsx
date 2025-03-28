import { useCreateTennisAssessmentMutation } from "@/api/matching";
import { useAppForm } from "@/utils/form";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Effect } from "effect";
import { getMatchingClientBodyType } from "sport-reservation-matching/models";
import { effectType } from "tiara-stack/utils/effectType";

function RouteComponent() {
  const router = useRouter();

  const createTennisAssessmentMutation = useCreateTennisAssessmentMutation();

  const form = useAppForm({
    defaultValues: {
      skillRating: "" as "" | number,
      years: "" as "" | number,
      stroke: "" as string,
      format: "" as string,
      hours: "" as "" | number,
    },
    validators: {
      onSubmit: getMatchingClientBodyType("createTennisAssessmentV1"),
    },
    onSubmit: async ({ value }) => {
      const data = await Effect.runPromise(
        effectType(
          getMatchingClientBodyType("createTennisAssessmentV1"),
          value,
        ),
      );
      await createTennisAssessmentMutation.mutateAsync({ data });
      await router.navigate({
        to: "/assessment/matching",
      });
    },
  });

  return (
    <form className="space-y-6">
      {/* Q1: Overall tennis skill */}
      <form.AppField
        name="skillRating"
        children={(field) => (
          <field.SingleChoiceField
            label="1. How would you rate your overall tennis skill?"
            options={[
              { label: "1: Beginner", value: 1 },
              { label: "2: Novice", value: 2 },
              { label: "3: Intermediate", value: 3 },
              { label: "4: Advanced", value: 4 },
              { label: "5: Expert", value: 5 },
            ]}
            spread
          />
        )}
      />

      {/* Q2: Years playing tennis */}
      <form.AppField
        name="years"
        children={(field) => (
          <field.NumericInputField
            label="2. How many years have you been playing tennis?"
            trailingText="years"
            classNames={{
              input: "w-44",
            }}
          />
        )}
      />

      {/* Q3: Stroke proficiency */}
      <form.AppField
        name="stroke"
        children={(field) => (
          <field.SingleChoiceField
            label="3. Which stroke do you excel at?"
            options={[
              { label: "Forehand", value: "forehand" },
              { label: "Backhand", value: "backhand" },
              { label: "Net volleys", value: "volley" },
              { label: "Serve returns", value: "serve" },
            ]}
          />
        )}
      />

      {/* Q4: Preferred format */}
      <form.AppField
        name="format"
        children={(field) => (
          <field.SingleChoiceField
            label="4. Which best describes your preferred format of playing?"
            options={[
              { label: "Singles", value: "singles" },
              { label: "Doubles", value: "doubles" },
              { label: "Both", value: "mixed" },
            ]}
          />
        )}
      />

      {/* Q5: Hours per week */}
      <form.AppField
        name="hours"
        children={(field) => (
          <field.NumericInputField
            label="5. On average, how many hours per week do you play or practice tennis?"
            trailingText="hours"
            classNames={{
              input: "w-44",
            }}
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
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <button
              type="submit"
              disabled={!canSubmit}
              onClick={() => {
                router.navigate({
                  to: "/assessment/matching",
                });
              }}
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

export const Route = createFileRoute("/_layout/assessment/performance/tennis")({
  beforeLoad: () => {
    return { assessment: { step: 2, performance: { sport: "tennis" } } };
  },
  component: RouteComponent,
});
