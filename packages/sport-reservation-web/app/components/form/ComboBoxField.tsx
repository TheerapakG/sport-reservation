import StandaloneComboBoxField from "./StandaloneComboBoxField";
import { StandaloneFieldLabel } from "./StandaloneFieldLabel";

export default function ComboBoxField<T extends string | number | undefined>({
  classNames,
  label,
  options,
  placeholder,
}: {
  classNames?: {
    label?: string;
  };
  label?: string;
  options: { label: string; value: T }[];
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <StandaloneFieldLabel label={label} className={classNames?.label} />
      <StandaloneComboBoxField options={options} placeholder={placeholder} />
    </div>
  );
}
