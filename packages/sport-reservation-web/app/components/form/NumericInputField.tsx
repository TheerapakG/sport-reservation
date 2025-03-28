import { StandaloneFieldLabel } from "./StandaloneFieldLabel";
import StandaloneNumericInputField from "./StandaloneNumericInputField";

export default function NumericInputField({
  classNames,
  label,
  placeholder,
  trailingText,
}: {
  classNames?: {
    label?: string;
    input?: string;
  };
  label?: string;
  placeholder?: string;
  trailingText?: string;
}) {
  return (
    <div className="space-y-2">
      <StandaloneFieldLabel label={label} className={classNames?.label} />
      <StandaloneNumericInputField
        placeholder={placeholder}
        trailingText={trailingText}
        classNames={classNames}
      />
    </div>
  );
}
