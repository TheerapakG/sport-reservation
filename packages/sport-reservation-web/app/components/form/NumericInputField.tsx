import { StandaloneFieldLabel } from "./StandaloneFieldLabel";
import StandaloneNumericInputField from "./StandaloneNumericInputField";

export default function NumericInputField({
  classNames,
  label,
  placeholder,
  trailingText,
  buttons,
  min,
  max,
}: {
  classNames?: {
    label?: string;
    input?: string;
    container?: string;
  };
  label?: string;
  placeholder?: string;
  trailingText?: string;
  buttons?: boolean;
  min?: number;
  max?: number;
}) {
  return (
    <div className="space-y-2">
      <StandaloneFieldLabel label={label} className={classNames?.label} />
      <StandaloneNumericInputField
        placeholder={placeholder}
        trailingText={trailingText}
        buttons={buttons}
        classNames={classNames}
        min={min}
        max={max}
      />
    </div>
  );
}
