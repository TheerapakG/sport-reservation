export default function StepProgressbarComponent({
  step,
  title,
  currentStep,
}: {
  step: number;
  title: string;
  currentStep: number;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`h-8 w-8 rounded-full border-2 ${
          currentStep >= step
            ? "border-[#65D1F8] bg-[#65D1F8] text-white"
            : "border-gray-300 bg-white text-gray-400"
        } flex items-center justify-center font-bold`}
      >
        {step}
      </div>
      <p className="mt-1 text-xs text-gray-600">{title}</p>
    </div>
  );
}
