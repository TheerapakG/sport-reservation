import { StandaloneFieldLabel } from "./StandaloneFieldLabel";
import StandaloneTextInputField from "./StandaloneTextInputField";

export default function TextInputField({
  classNames,
  label,
  type,
  placeholder,
  trailingText,
  variant = "input",
}: {
  classNames?: {
    label?: string;
    input?: string;
  };
  label?: string;
  type?: "text" | "email" | "password" | "date";
  placeholder?: string;
  trailingText?: string;
  variant?: "input" | "textarea";
}) {
  return (
    <div className="space-y-2">
      <StandaloneFieldLabel label={label} className={classNames?.label} />
      <StandaloneTextInputField
        type={type}
        placeholder={placeholder}
        trailingText={trailingText}
        classNames={classNames}
        variant={variant}
      />
    </div>
  );
}
