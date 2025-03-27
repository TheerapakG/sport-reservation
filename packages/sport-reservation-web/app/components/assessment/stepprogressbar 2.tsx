// src/components/assessment/StepProgressBar.tsx
import React from "react"

type StepProgressBarProps = {
  currentStep: number
}

export default function StepProgressBar({ currentStep }: StepProgressBarProps) {
  return (
    <div className="mb-6 flex items-center justify-center space-x-8">
      {/* Step 1 */}
      <div className="flex flex-col items-center">
        <div
          className={`h-8 w-8 rounded-full border-2 ${
            currentStep >= 1
              ? "border-[#65D1F8] bg-[#65D1F8] text-white"
              : "border-gray-300 bg-white text-gray-400"
          } flex items-center justify-center font-bold`}
        >
          1
        </div>
        <p className="mt-1 text-xs text-gray-600">Physical assessment</p>
      </div>

      {/* Step 2 */}
      <div className="flex flex-col items-center">
        <div
          className={`h-8 w-8 rounded-full border-2 ${
            currentStep >= 2
              ? "border-[#65D1F8] bg-[#65D1F8] text-white"
              : "border-gray-300 bg-white text-gray-400"
          } flex items-center justify-center font-bold`}
        >
          2
        </div>
        <p className="mt-1 text-xs text-gray-600">Performance evaluation</p>
      </div>

      {/* Step 3 - Just a placeholder */}
      <div className="flex flex-col items-center">
        <div className="h-8 w-8 rounded-full border-2 border-gray-300 bg-white text-gray-400 flex items-center justify-center font-bold">
          3
        </div>
        <p className="mt-1 text-xs text-gray-600">Enjoy your matching!</p>
      </div>
    </div>
  )
}