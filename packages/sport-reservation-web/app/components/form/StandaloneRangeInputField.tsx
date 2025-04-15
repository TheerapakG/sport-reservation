import { useFieldContext } from "@/utils/form/context";
import { useStore } from "@tanstack/react-form";
import { Ranger, useRanger } from "@tanstack/react-ranger";
import { useRef } from "react";

export default function StandaloneNumericInputField({
  min,
  max,
  stepSize,
  trailingText,
}: {
  min: number;
  max: number;
  stepSize: number;
  trailingText?: string;
}) {
  "use no memo";

  const field = useFieldContext<undefined | number | number[]>();
  const fieldValues = useStore(field.store, (state) =>
    state.value
      ? Array.isArray(state.value)
        ? state.value
        : [state.value]
      : [min],
  );
  const fieldMultipleValue = fieldValues.length > 1;

  const rangerRef = useRef<HTMLDivElement>(null);
  const rangerInstance = useRanger<HTMLDivElement>({
    getRangerElement: () => rangerRef.current,
    values: fieldValues,
    min,
    max,
    stepSize,
    onChange: (instance: Ranger<HTMLDivElement>) => {
      if (fieldMultipleValue) {
        field.handleChange([...instance.sortedValues]);
      } else {
        field.handleChange(instance.sortedValues[0]);
      }
    },
  });
  const rangerSteps = rangerInstance.getSteps();
  const rangerHandles = rangerInstance.handles();

  return (
    <div
      ref={rangerRef}
      className="relative mt-8 mb-2 h-1.5 w-full rounded-full bg-gray-300 select-none"
    >
      {rangerSteps.length > 2 ? (
        rangerSteps.slice(1, -1).map(({ left, width }, i) => (
          <div
            key={i}
            className="absolute left-[var(--ranger-left-percentage)] h-full w-[var(--ranger-width-percentage)] rounded-full bg-[#65D1F8]"
            style={
              {
                "--ranger-left-percentage": `${left}%`,
                "--ranger-width-percentage": `${width}%`,
              } as React.CSSProperties
            }
          />
        ))
      ) : (
        <div
          className="absolute left-[var(--ranger-left-percentage)] h-full w-[var(--ranger-width-percentage)] rounded-full bg-[#65D1F8]"
          style={
            {
              "--ranger-left-percentage": `${rangerSteps[0].left}%`,
              "--ranger-width-percentage": `${rangerSteps[0].width}%`,
            } as React.CSSProperties
          }
        />
      )}
      {rangerHandles.map(
        ({ value, onKeyDownHandler, onMouseDownHandler, onTouchStart }, i) => (
          <button
            key={i}
            onKeyDown={onKeyDownHandler}
            onMouseDown={onMouseDownHandler}
            onTouchStart={onTouchStart}
            role="slider"
            aria-valuemin={rangerInstance.options.min}
            aria-valuemax={rangerInstance.options.max}
            aria-valuenow={value}
            className="absolute top-1/2 left-[var(--ranger-percentage)] z-20 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#65D1F8] bg-white"
            style={
              {
                "--ranger-percentage": `${rangerInstance.getPercentageForValue(value)}%`,
              } as React.CSSProperties
            }
          >
            <span className="absolute w-12 -translate-x-1/2 -translate-y-[200%] text-xs font-semibold text-[#65D1F8]">
              {value} {trailingText}
            </span>
          </button>
        ),
      )}
    </div>
  );
}
