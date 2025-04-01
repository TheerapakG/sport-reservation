import { useCreateGeneralAssessmentMutation } from "@/api/matching";
import AssessmentContainerComponent from "@/components/assessment/AssessmentContainerComponent";
import AssessmentHeaderComponent from "@/components/form/FormHeaderComponent";
import { useAppForm } from "@/utils/form";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { type } from "arktype";
import { Effect } from "effect";
import { Info } from "lucide-react";
import { getMatchingClientBodyType } from "sport-reservation-matching/models";
import { effectType } from "tiara-stack/utils/effectType";

export default function AssessmentComponent() {
  const router = useRouter();

  const createGeneralAssessmentMutation = useCreateGeneralAssessmentMutation();

  const form = useAppForm({
    defaultValues: {
      vigorousDays: "" as "" | number,
      vigorousMinutes: "" as "" | number,
      moderateDays: "" as "" | number,
      moderateMinutes: "" as "" | number,
      walkDays: "" as "" | number,
      walkMinutes: "" as "" | number,
    },
    validators: {
      onSubmit: getMatchingClientBodyType("createGeneralAssessmentV1"),
    },
    onSubmit: async ({ value }) => {
      const data = await Effect.runPromise(
        effectType(
          getMatchingClientBodyType("createGeneralAssessmentV1"),
          value,
        ),
      );
      await createGeneralAssessmentMutation.mutateAsync({ data });
      await router.navigate({
        to: "/assessment/performance/badminton",
      });
    },
  });

  const dayOptions = [
    { label: "0 days", value: 0 },
    { label: "1 day", value: 1 },
    { label: "2 days", value: 2 },
    { label: "3 days", value: 3 },
    { label: "4 days", value: 4 },
    { label: "5 days", value: 5 },
    { label: "6 days", value: 6 },
    { label: "7 days", value: 7 },
  ];

  return (
    <AssessmentContainerComponent>
      <div className="mt-4">
        <AssessmentHeaderComponent
          title="Physical assessment"
          description="We use the International Physical Activity Questionnaire (IPAQ) to
          measure your overall activity level. This helps us find a suitable
          partner in terms of fitness and conditions."
          className="mb-6"
        />
      </div>

      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        {/* ====== VIGOROUS ACTIVITY ====== */}
        <div className="mb-6">
          <div className="mb-1 flex items-center space-x-2">
            <label className="text-sm font-semibold text-gray-700">
              Vigorous activity
            </label>
            {/* Tooltip icon */}
            <div className="group relative inline-block">
              <Info className="h-4 w-4 cursor-pointer text-gray-400 group-hover:text-gray-600" />
              <div className="absolute bottom-full left-0 mb-2 hidden w-64 rounded bg-gray-700 p-2 text-xs text-white group-hover:block">
                <p className="font-semibold">What is Vigorous Activity?</p>
                <p>
                  Activities that make you breathe much harder than normal,
                  e.g., running, fast cycling, heavy lifting.
                </p>
              </div>
            </div>
          </div>
          <form.AppField
            name="vigorousDays"
            validators={{ onBlur: type("number") }}
            children={(field) => (
              <field.SelectInputField
                label="During the last 7 days, how many days did you do vigorous
                physical activities for at least 10 minutes at a time?"
                options={dayOptions}
                classNames={{ label: "text-xs font-normal text-gray-500" }}
              />
            )}
          />
          <form.AppField
            name="vigorousMinutes"
            validators={{ onBlur: type("number") }}
            children={(field) => (
              <field.NumericInputField
                label="On these days, how much time did you usually spend on vigorous
                activities?"
                placeholder="e.g. 120"
                trailingText="minutes"
                classNames={{
                  label: "text-xs font-normal text-gray-500",
                  input: "w-44",
                }}
              />
            )}
          />
        </div>

        {/* ====== MODERATE ACTIVITY ====== */}
        <div className="mb-6">
          <div className="mb-1 flex items-center space-x-2">
            <label className="text-sm font-semibold text-gray-700">
              Moderate activity
            </label>
            {/* Tooltip icon */}
            <div className="group relative inline-block">
              <Info className="h-4 w-4 cursor-pointer text-gray-400 group-hover:text-gray-600" />
              <div className="absolute bottom-full left-0 mb-2 hidden w-64 rounded bg-gray-700 p-2 text-xs text-white group-hover:block">
                <p className="font-semibold">What is Moderate Activity?</p>
                <p>
                  Activities that make you breathe somewhat harder than normal,
                  e.g., brisk walking, light cycling, easy swimming.
                </p>
              </div>
            </div>
          </div>
          <form.AppField
            name="moderateDays"
            validators={{ onBlur: type("number") }}
            children={(field) => (
              <field.SelectInputField
                label="During the last 7 days, how many days did you do moderate
                physical activities for at least 10 minutes at a time?"
                options={dayOptions}
                classNames={{ label: "text-xs font-normal text-gray-500" }}
              />
            )}
          />
          <form.AppField
            name="moderateMinutes"
            validators={{ onBlur: type("number") }}
            children={(field) => (
              <field.NumericInputField
                label="On these days, how much time did you usually spend on moderate
                activities?"
                placeholder="e.g. 120"
                trailingText="minutes"
                classNames={{
                  label: "text-xs font-normal text-gray-500",
                  input: "w-44",
                }}
              />
            )}
          />
        </div>

        {/* ====== WALKING ====== */}
        <div className="mb-6">
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            Walking
          </label>
          <form.AppField
            name="walkDays"
            validators={{ onBlur: type("number") }}
            children={(field) => (
              <field.SelectInputField
                label="During the last 7 days, how many days did you walk at least 10
                minutes at a time?"
                options={dayOptions}
                classNames={{ label: "text-xs font-normal text-gray-500" }}
              />
            )}
          />
          <form.AppField
            name="walkMinutes"
            validators={{ onBlur: type("number") }}
            children={(field) => (
              <field.NumericInputField
                label="On these days, how much time did you usually spend on walking?"
                placeholder="e.g. 120"
                trailingText="minutes"
                classNames={{
                  label: "text-xs font-normal text-gray-500",
                  input: "w-44",
                }}
              />
            )}
          />
        </div>

        {/* Navigation Buttons inside the card, centered */}
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <div className="mt-6 flex justify-center space-x-4">
              <button
                type="submit"
                disabled={!canSubmit}
                className="rounded bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] px-4 py-2 text-white hover:opacity-90"
              >
                {isSubmitting ? "Saving..." : "Save and continue"}
              </button>
            </div>
          )}
        />
      </form>
    </AssessmentContainerComponent>
  );
}

export const Route = createFileRoute("/_layout/assessment/ipaq")({
  beforeLoad: () => {
    return { assessment: { step: 1, performance: undefined } };
  },
  component: AssessmentComponent,
});
