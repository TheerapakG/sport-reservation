import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_layout/matchfilter")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <MatchFilters />
    </div>
  );
}

function MatchFilters() {
  type GenderType = "male" | "female" | "preferNotToSay";
  type ObjectiveType = "casual" | "competitive" | "fitness";

  const [radius, setRadius] = useState(16);
  const [ageRange, setAgeRange] = useState<[number, number]>([22, 27]);

  const [gender, setGender] = useState<Record<GenderType, boolean>>({
    male: true,
    female: false,
    preferNotToSay: false,
  });

  const [objectives, setObjectives] = useState<Record<ObjectiveType, boolean>>({
    casual: true,
    competitive: false,
    fitness: false,
  });

  return (
    <Card className="relative mx-auto max-w-sm rounded-2xl bg-gradient-to-b from-[#65D1F8] to-[#6CCFD0] p-[2px] shadow-lg">
      <div className="rounded-2xl bg-white p-6">
        {/* Header */}
        <h2 className="bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] bg-clip-text text-center text-xl font-extrabold text-transparent">
          Match Filters
        </h2>
        <p className="mb-4 text-center text-gray-500">
          Being more personalized match with your type of person!
        </p>

        {/* Radius of Location */}
        <div className="mb-4">
          <label className="block font-semibold text-gray-600">
            Radius of location
          </label>
          <input
            type="range"
            min="2"
            max="10"
            step="1"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full accent-[#65D1F8]"
          />
          <p className="text-center text-sm text-[#65D1F8]">{radius} km</p>
        </div>

        {/* Age Range */}
        <div className="mb-4">
          <label className="block font-semibold text-gray-600">Age range</label>

          {/* Slider Container */}
          <div className="relative mt-2 w-full">
            {/* Full Background Track */}
            <div className="absolute top-1/2 h-1 w-full rounded-full bg-gray-300"></div>

            {/* Selected Range Track */}
            <div
              className="absolute top-1/2 h-1 rounded-full bg-[#65D1F8]"
              style={{
                left: `${((ageRange[0] - 18) / (60 - 18)) * 100}%`,
                width: `${((ageRange[1] - ageRange[0]) / (60 - 18)) * 100}%`,
              }}
            ></div>

            {/* Left Slider (Min Age - Freely Adjustable) */}
            <input
              type="range"
              min="18"
              max="60"
              value={ageRange[0]}
              onChange={(e) => {
                const newMin = Number(e.target.value);
                if (newMin < ageRange[1]) {
                  setAgeRange([newMin, ageRange[1]]);
                }
              }}
              className="absolute w-full cursor-pointer appearance-none bg-transparent"
              style={{ zIndex: 3 }}
            />

            {/* Right Slider (Max Age - Freely Adjustable) */}
            <input
              type="range"
              min="18"
              max="60"
              value={ageRange[1]}
              onChange={(e) => {
                const newMax = Number(e.target.value);
                if (newMax > ageRange[0]) {
                  setAgeRange([ageRange[0], newMax]);
                }
              }}
              className="absolute w-full cursor-pointer appearance-none bg-transparent"
              style={{ zIndex: 4 }}
            />
          </div>

          {/* Age Range Display */}
          <div className="mt-2 flex justify-between text-gray-700">
            <span>18</span>
            <span className="font-semibold text-[#65D1F8]">
              {ageRange[0]} - {ageRange[1]}
            </span>
            <span>60</span>
          </div>
        </div>

        {/* Gender Preferences */}
        <div className="mb-4">
          <label className="block font-semibold text-gray-600">
            Gender preferences
          </label>
          <div className="flex gap-2">
            {(["male", "female", "preferNotToSay"] as GenderType[]).map(
              (key) => (
                <label
                  key={key}
                  className="flex items-center gap-1 text-gray-600"
                >
                  <input
                    type="checkbox"
                    checked={gender[key]}
                    onChange={() =>
                      setGender((prev) => ({ ...prev, [key]: !prev[key] }))
                    }
                    className="accent-[#65D1F8]"
                  />
                  {key.charAt(0).toUpperCase() +
                    key.slice(1).replace(/NotToSay/, " Not to Say")}
                </label>
              ),
            )}
          </div>
        </div>

        {/* Objectives */}
        <div className="mb-4">
          <label className="block font-semibold text-gray-600">
            Objectives
          </label>
          <div className="flex gap-2">
            {(["casual", "competitive", "fitness"] as ObjectiveType[]).map(
              (key) => (
                <label
                  key={key}
                  className="flex items-center gap-1 text-gray-600"
                >
                  <input
                    type="checkbox"
                    checked={objectives[key]}
                    onChange={() =>
                      setObjectives((prev) => ({ ...prev, [key]: !prev[key] }))
                    }
                    className="accent-[#65D1F8]"
                  />
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
              ),
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-between">
          <button className="rounded-lg bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] px-6 py-3 font-semibold text-white shadow-md transition-transform hover:scale-105">
            Apply filters
          </button>
          <button
            className="rounded-lg bg-gray-300 px-6 py-3 font-semibold text-gray-600"
            onClick={() => {
              setGender({ male: true, female: false, preferNotToSay: false });
              setObjectives({
                casual: true,
                competitive: false,
                fitness: false,
              });
              setAgeRange([22, 27]);
              setRadius(16);
            }}
          >
            Reset
          </button>
        </div>
      </div>
    </Card>
  );
}
