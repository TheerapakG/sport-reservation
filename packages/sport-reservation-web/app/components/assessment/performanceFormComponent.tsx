import { useState } from "react";
import AssessmentHeaderComponent from "./AssessmentHeaderComponent";
import AssessmentContainerComponent from "./AssesssmentContainerComponent";

type Props = {
  onNext?: () => void;
  onBack?: () => void;
};

export default function PerformanceForm({ onNext, onBack }: Props) {
  const [selectedTab, setSelectedTab] = useState<
    "Badminton" | "Tennis" | "Running"
  >("Badminton");

  // Common states for Badminton & Tennis
  const [skillRating, setSkillRating] = useState<number>(1); // from 1 to 5
  const [years, setYears] = useState<number>(1);
  // For Badminton: playing style; for Tennis: stroke proficiency
  const [option, setOption] = useState<string>("Offensive");
  const [format, setFormat] = useState("Singles");
  const [hours, setHours] = useState<number>(0);

  // States for Running
  const [distance, setDistance] = useState<number>(0);
  const [pace, setPace] = useState<number>(0);
  const [weeklyFrequency, setWeeklyFrequency] = useState<number>(0);
  const [primaryGoal, setPrimaryGoal] = useState<string>("Casual");
  const [performanceMarker, setPerformanceMarker] = useState<string>("");

  const yearOptions = [1, 2, 3, 4, 5];
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

  // Render question set for Badminton
  const renderBadmintonQuestions = () => (
    <div className="space-y-6">
      {/* Q1: Overall badminton skill (1 to 5) */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          1. How would you rate your overall badminton skill? (1 = Beginner, 5 =
          Expert)
        </label>
        <div className="grid grid-cols-5 gap-2 text-sm">
          {yearOptions.map((r) => (
            <label key={r} className="flex items-center space-x-1">
              <input
                type="radio"
                name="badmintonSkill"
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

      {/* Q2: Years playing badminton */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          2. How many years have you been playing badminton?
        </label>
        <input
          type="number"
          value={years}
          onChange={(e) => setYears(parseInt(e.target.value) || 0)}
          className="w-36 border-0 border-l-4 border-l-[#65D1F8] bg-white px-2 py-1 text-sm shadow focus:outline-none"
          placeholder="Years"
        />
      </div>

      {/* Q3: Playing style */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          3. Which best describes your typical playing style?
        </label>
        <div className="grid grid-cols-3 gap-2 text-sm">
          {["Offensive", "Defensive", "Balanced"].map((style) => (
            <label key={style} className="flex items-center space-x-1">
              <input
                type="radio"
                name="badmintonStyle"
                value={style}
                checked={option === style}
                onChange={() => setOption(style)}
                className="text-[#65D1F8] focus:ring-[#65D1F8]"
              />
              <span>{style}</span>
            </label>
          ))}
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
                name="badmintonFormat"
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
          5. On average, how many hours per week do you play or practice
          badminton?
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
    </div>
  );

  // Render question set for Tennis
  const renderTennisQuestions = () => (
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
    </div>
  );

  // Render question set for Running
  const renderRunningQuestions = () => (
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
    </div>
  );

  return (
    <AssessmentContainerComponent>
      <div className="mt-4">
        {/* Tabs inside the card */}
        <div className="mb-6 flex space-x-2 text-sm font-medium">
          {(["Badminton", "Running", "Tennis"] as const).map((sport) => {
            const isActive = selectedTab === sport;
            return (
              <button
                key={sport}
                onClick={() => setSelectedTab(sport)}
                className={`rounded-full border px-4 py-1 ${
                  isActive
                    ? "border-[#65D1F8] bg-[#E1F8FE] text-[#65D1F8]"
                    : "border-gray-300 text-gray-500 hover:bg-gray-100"
                }`}
              >
                {sport}
              </button>
            );
          })}
        </div>

        <AssessmentHeaderComponent
          title="Rate your performance!"
          description="Describe your skills, experience, and style so we can fine-tune your matches and ensure you find the best partner."
          className="mb-6"
        />

        {selectedTab === "Badminton" && renderBadmintonQuestions()}
        {selectedTab === "Tennis" && renderTennisQuestions()}
        {selectedTab === "Running" && renderRunningQuestions()}
      </div>

      {/* Navigation Buttons at bottom, centered */}
      <div className="mt-6 flex justify-center space-x-4">
        {onBack && (
          <button
            onClick={onBack}
            className="rounded border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-100"
          >
            Back
          </button>
        )}
        {onNext && (
          <button
            onClick={onNext}
            className="rounded bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] px-4 py-2 text-white hover:opacity-90"
          >
            Save and continue
          </button>
        )}
      </div>
    </AssessmentContainerComponent>
  );
}
