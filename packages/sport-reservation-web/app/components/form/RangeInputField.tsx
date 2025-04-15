import { StandaloneFieldLabel } from "./StandaloneFieldLabel";
import StandaloneRangeInputField from "./StandaloneRangeInputField";

export default function RangeInputField({
  classNames,
  label,
  min,
  max,
  stepSize,
  trailingText,
}: {
  classNames?: {
    label?: string;
  };
  label?: string;
  min: number;
  max: number;
  stepSize: number;
  trailingText?: string;
}) {
  return (
    <div className="space-y-2">
      <StandaloneFieldLabel label={label} className={classNames?.label} />
      <StandaloneRangeInputField
        min={min}
        max={max}
        stepSize={stepSize}
        trailingText={trailingText}
      />
    </div>
  );
}
