import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";

function RouteComponent() {
  const router = useRouter();
  // States for Running
  const [distance, setDistance] = useState<number>(0);
  const [pace, setPace] = useState<number>(0);
  const [weeklyFrequency, setWeeklyFrequency] = useState<number>(0);
  const [primaryGoal, setPrimaryGoal] = useState<string>("Casual");
  const [performanceMarker, setPerformanceMarker] = useState<string>("");

  const frequencyOptions = [
    "0 days",
    "1 day",
    "2 days",
    "3 days",
    "4 days",
    "5 days",
    "6 days",
    "7 days",
  ];

  return (
    <div className="space-y-6">
      {/* Q1: Typical distance */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          1. What is your typical running distance (in km)?
        </label>
        <input
          type="number"
          value={distance}
          onChange={(e) => setDistance(parseFloat(e.target.value) || 0)}
          className="w-44 border-0 bg-white px-2 py-1 text-sm shadow focus:outline-none"
          placeholder="e.g. 10"
        />
      </div>

      {/* Q2: Pace (min/km) */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          2. What is your average pace (min/km)?
        </label>
        <input
          type="number"
          value={pace}
          onChange={(e) => setPace(parseFloat(e.target.value) || 0)}
          className="w-44 border-0 bg-white px-2 py-1 text-sm shadow focus:outline-none"
          placeholder="e.g. 5"
        />
      </div>

      {/* Q3: Weekly frequency (days/week) as dropdown */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          3. How many days per week do you run?
        </label>
        <select
          className="w-36 appearance-none border-0 border-l-4 border-l-[#65D1F8] bg-white px-2 py-1 text-sm text-gray-700 shadow focus:outline-none"
          value={weeklyFrequency}
          onChange={(e) => setWeeklyFrequency(parseInt(e.target.value) || 0)}
        >
          {frequencyOptions.map((opt, index) => (
            <option key={opt} value={index}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* Q4: Primary goal */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          4. What is your primary goal?
        </label>
        <div className="flex flex-wrap gap-2">
          {["Casual", "Race training", "Social", "Speed work"].map((goal) => (
            <button
              key={goal}
              onClick={() => setPrimaryGoal(goal)}
              className={`rounded-full border px-3 py-1 text-sm ${
                primaryGoal === goal
                  ? "border-[#65D1F8] bg-[#E1F8FE] text-[#65D1F8]"
                  : "border-gray-300 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>

      {/* Q5: Best performance marker */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          5. What is your best performance marker? (e.g., "10K in 50:00")
        </label>
        <input
          type="text"
          value={performanceMarker}
          onChange={(e) => setPerformanceMarker(e.target.value)}
          className="w-44 border-0 bg-white px-2 py-1 text-sm shadow focus:outline-none"
          placeholder="e.g. 10K in 50:00"
        />
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

export const Route = createFileRoute("/_layout/assessment/performance/running")(
  {
    beforeLoad: () => {
      return { assessment: { step: 2, performance: { sport: "running" } } };
    },
    component: RouteComponent,
  },
);
