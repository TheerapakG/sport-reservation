import { StandaloneFieldLabel } from "./StandaloneFieldLabel";
import StandaloneTimePickerField from "./StandaloneTimePickerField";

export default function TimePickerField({
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
      <StandaloneTimePickerField
        placeholder={placeholder}
        classNames={classNames}
      />
    </div>
  );
}
