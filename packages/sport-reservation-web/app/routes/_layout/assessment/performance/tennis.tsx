import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";

function RouteComponent() {
  const router = useRouter();
  // Common states for Badminton & Tennis
  const [skillRating, setSkillRating] = useState<number>(1); // from 1 to 5
  const [years, setYears] = useState<number>(1);
  // For Badminton: playing style; for Tennis: stroke proficiency
  const [option, setOption] = useState<string>("Offensive");
  const [format, setFormat] = useState("Singles");
  const [hours, setHours] = useState<number>(0);

  return (
    <div className="space-y-6">
      {/* Q1: Overall tennis skill */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          1. How would you rate your overall tennis skill? (1 = Beginner, 5 =
          Expert)
        </label>
        <div className="grid grid-cols-5 gap-2 text-sm">
          {[1, 2, 3, 4, 5].map((r) => (
            <label key={r} className="flex items-center space-x-1">
              <input
                type="radio"
                name="tennisSkill"
                value={r}
                checked={skillRating === r}
                onChange={() => setSkillRating(r)}
                className="text-[#65D1F8] focus:ring-[#65D1F8]"
              />
              <span>{r}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Q2: Years playing tennis */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          2. How many years have you been playing tennis?
        </label>
        <input
          type="number"
          value={years}
          onChange={(e) => setYears(parseInt(e.target.value) || 0)}
          className="w-36 border-0 border-l-4 border-l-[#65D1F8] bg-white px-2 py-1 text-sm shadow focus:outline-none"
          placeholder="Years"
        />
      </div>

      {/* Q3: Stroke proficiency */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          3. Which stroke do you excel at?
        </label>
        <div className="grid grid-cols-4 gap-2 text-sm">
          {["Forehand", "Backhand", "Net volleys", "Serve returns"].map(
            (stroke) => (
              <label key={stroke} className="flex items-center space-x-1">
                <input
                  type="radio"
                  name="tennisStroke"
                  value={stroke}
                  checked={option === stroke}
                  onChange={() => setOption(stroke)}
                  className="text-[#65D1F8] focus:ring-[#65D1F8]"
                />
                <span>{stroke}</span>
              </label>
            ),
          )}
        </div>
      </div>

      {/* Q4: Preferred format */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          4. Which best describes your preferred format of playing?
        </label>
        <div className="grid grid-cols-3 gap-2 text-sm">
          {["Singles", "Doubles", "Both"].map((fmt) => (
            <label key={fmt} className="flex items-center space-x-1">
              <input
                type="radio"
                name="tennisFormat"
                value={fmt}
                checked={format === fmt}
                onChange={() => setFormat(fmt)}
                className="text-[#65D1F8] focus:ring-[#65D1F8]"
              />
              <span>{fmt}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Q5: Hours per week */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          5. On average, how many hours per week do you play or practice tennis?
        </label>
        <div className="flex items-center">
          <input
            type="number"
            value={hours}
            onChange={(e) => setHours(parseInt(e.target.value) || 0)}
            className="w-44 border-0 bg-white px-2 py-1 text-sm shadow focus:outline-none"
            placeholder="e.g. 5"
          />
          <span className="ml-2 text-xs text-gray-400">hours</span>
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
    </div>
  );
}

export const Route = createFileRoute("/_layout/assessment/performance/tennis")({
  beforeLoad: () => {
    return { assessment: { step: 2, performance: { sport: "tennis" } } };
  },
  component: RouteComponent,
});
