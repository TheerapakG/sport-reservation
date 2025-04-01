import StandaloneDatePickerField from "./StandaloneDatePickerField";
import { StandaloneFieldLabel } from "./StandaloneFieldLabel";

export default function DatePickerField({
  classNames,
  label,
  placeholder,
}: {
  classNames?: {
    label?: string;
    button?: string;
  };
  label?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <StandaloneFieldLabel label={label} className={classNames?.label} />
      <StandaloneDatePickerField
        placeholder={placeholder}
        classNames={classNames}
      />
    </div>
  );
}
