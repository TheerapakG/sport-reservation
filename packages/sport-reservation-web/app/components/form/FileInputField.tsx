import { StandaloneFieldLabel } from "./StandaloneFieldLabel";
import StandaloneFileInputField from "./StandaloneFileInputField";

export default function FileInputField({
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
      <StandaloneFileInputField
        placeholder={placeholder}
        trailingText={trailingText}
        classNames={classNames}
      />
    </div>
  );
}
