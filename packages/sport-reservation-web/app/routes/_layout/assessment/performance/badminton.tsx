import { useAppForm } from "@/utils/form";
import { createFileRoute, useRouter } from "@tanstack/react-router";

function RouteComponent() {
  const router = useRouter();

  const form = useAppForm({
    defaultValues: {
      skillRating: undefined as number | undefined,
      years: undefined as number | undefined,
      style: undefined as string | undefined,
      format: undefined as string | undefined,
      hours: undefined as number | undefined,
    },
  });

  return (
    <form className="space-y-6">
      {/* Q1: Overall badminton skill (1 to 5) */}
      <form.AppField
        name="skillRating"
        children={(field) => (
          <field.SingleChoiceField
            label="1. How would you rate your overall badminton skill?"
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

      {/* Q2: Years playing badminton */}
      <form.AppField
        name="years"
        children={(field) => (
          <field.NumericInputField
            label="2. How many years have you been playing badminton?"
            placeholder="e.g. 5"
            trailingText="years"
          />
        )}
      />

      {/* Q3: Playing style */}
      <form.AppField
        name="style"
        children={(field) => (
          <field.SingleChoiceField
            label="3. Which best describes your typical playing style?"
            options={[
              { label: "Offensive", value: "Offensive" },
              { label: "Defensive", value: "Defensive" },
              { label: "Balanced", value: "Balanced" },
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
              { label: "Singles", value: "Singles" },
              { label: "Doubles", value: "Doubles" },
              { label: "Both", value: "Both" },
            ]}
          />
        )}
      />

      {/* Q5: Hours per week */}
      <form.AppField
        name="hours"
        children={(field) => (
          <field.NumericInputField
            label="5. On average, how many hours per week do you play or practice badminton?"
            placeholder="e.g. 5"
            trailingText="hours"
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

export const Route = createFileRoute(
  "/_layout/assessment/performance/badminton",
)({
  beforeLoad: () => {
    return { assessment: { step: 2, performance: { sport: "badminton" } } };
  },
  component: RouteComponent,
});
