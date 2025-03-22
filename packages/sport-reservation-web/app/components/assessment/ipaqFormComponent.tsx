import { Info } from "lucide-react";
import { useState } from "react";
import AssessmentHeaderComponent from "./AssessmentHeaderComponent";
import AssessmentContainerComponent from "./AssesssmentContainerComponent";

type Props = {
  onNext: () => void;
  onBack: () => void;
};

export default function PhysicalAssessmentForm({ onNext, onBack }: Props) {
  // State for each dropdown/input
  const [vigorousDays, setVigorousDays] = useState("0 days");
  const [vigorousMins, setVigorousMins] = useState("120");
  const [moderateDays, setModerateDays] = useState("0 days");
  const [moderateMins, setModerateMins] = useState("120");
  const [walkingDays, setWalkingDays] = useState("0 days");
  const [walkingMins, setWalkingMins] = useState("120");

  // Common dropdown options
  const dayOptions = [
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
    <AssessmentContainerComponent>
      <div className="mt-4">
        <AssessmentHeaderComponent
          title="Physical assessment"
          description="We use the International Physical Activity Questionnaire (IPAQ) to
          measure your overall activity level. This helps us find a suitable
          partner in terms of fitness and conditions."
          className="mb-6"
        />

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
          <p className="mb-2 text-xs text-gray-500">
            During the last 7 days, how many days did you do vigorous physical
            activities for at least 10 minutes at a time?
          </p>
          {/* Dropdown: left-border-only, shorter width, with shadow */}
          <select
            className="w-36 appearance-none border-0 border-l-4 border-l-[#65D1F8] bg-white px-2 py-1 text-sm text-gray-700 shadow focus:ring-0 focus:outline-none"
            value={vigorousDays}
            onChange={(e) => setVigorousDays(e.target.value)}
          >
            {dayOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <p className="mt-3 mb-2 text-xs text-gray-500">
            On these days, how much time did you usually spend on vigorous
            activities? (minutes)
          </p>
          {/* Text input: no border, longer width, with shadow */}
          <input
            type="number"
            className="w-44 border-0 px-2 py-1 text-sm text-gray-700 shadow focus:ring-0 focus:outline-none"
            placeholder="e.g. 120"
            value={vigorousMins}
            onChange={(e) => setVigorousMins(e.target.value)}
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
          <p className="mb-2 text-xs text-gray-500">
            During the last 7 days, how many days did you do moderate physical
            activities for at least 10 minutes at a time?
          </p>
          {/* Dropdown: left-border-only, shorter width, with shadow */}
          <select
            className="w-36 appearance-none border-0 border-l-4 border-l-[#65D1F8] bg-white px-2 py-1 text-sm text-gray-700 shadow focus:ring-0 focus:outline-none"
            value={moderateDays}
            onChange={(e) => setModerateDays(e.target.value)}
          >
            {dayOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <p className="mt-3 mb-2 text-xs text-gray-500">
            On these days, how much time did you usually spend on moderate
            activities? (minutes)
          </p>
          {/* Text input: no border, longer width, with shadow */}
          <input
            type="number"
            className="w-44 border-0 px-2 py-1 text-sm text-gray-700 shadow focus:ring-0 focus:outline-none"
            placeholder="e.g. 120"
            value={moderateMins}
            onChange={(e) => setModerateMins(e.target.value)}
          />
        </div>

        {/* ====== WALKING ====== */}
        <div className="mb-6">
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            Walking
          </label>
          <p className="mb-2 text-xs text-gray-500">
            During the last 7 days, how many days did you walk at least 10
            minutes at a time?
          </p>
          {/* Dropdown: left-border-only, shorter width, with shadow */}
          <select
            className="w-36 appearance-none border-0 border-l-4 border-l-[#65D1F8] bg-white px-2 py-1 text-sm text-gray-700 shadow focus:ring-0 focus:outline-none"
            value={walkingDays}
            onChange={(e) => setWalkingDays(e.target.value)}
          >
            {dayOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <p className="mt-3 mb-2 text-xs text-gray-500">
            On these days, how much time did you usually spend walking?
            (minutes)
          </p>
          {/* Text input: no border, longer width, with shadow */}
          <input
            type="number"
            className="w-44 border-0 px-2 py-1 text-sm text-gray-700 shadow focus:ring-0 focus:outline-none"
            placeholder="e.g. 120"
            value={walkingMins}
            onChange={(e) => setWalkingMins(e.target.value)}
          />
        </div>
      </div>

      {/* Navigation Buttons inside the card, centered */}
      <div className="mt-6 flex justify-center space-x-4">
        <button
          onClick={onBack}
          className="rounded border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-100"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="rounded bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] px-4 py-2 text-white hover:opacity-90"
        >
          Save and continue
        </button>
      </div>
    </AssessmentContainerComponent>
  );
}
