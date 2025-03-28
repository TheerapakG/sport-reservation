import { StandaloneFieldLabel } from "./StandaloneFieldLabel";
import StandaloneTextInputField from "./StandaloneTextInputField";

export default function TextInputField({
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
      <StandaloneTextInputField
        placeholder={placeholder}
        trailingText={trailingText}
        classNames={classNames}
      />
    </div>
  );
}
