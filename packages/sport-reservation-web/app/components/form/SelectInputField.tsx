import { StandaloneFieldLabel } from "./StandaloneFieldLabel";
import StandaloneSelectInputField from "./StandaloneSelectInputField";

export default function SelectInputField<T>({
  classNames,
  label,
  placeholder,
  options,
}: {
  classNames?: {
    label?: string;
    select?: string;
  };
  label?: string;
  placeholder?: string;
  options: { label: string; value: T }[];
}) {
  return (
    <div className="space-y-2">
      <StandaloneFieldLabel label={label} className={classNames?.label} />
      <StandaloneSelectInputField
        placeholder={placeholder}
        options={options}
        classNames={classNames}
      />
    </div>
  );
}
