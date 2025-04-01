import { StandaloneFieldLabel } from "./StandaloneFieldLabel";
import StandaloneMultipleChoiceField from "./StandaloneMultipleChoiceField";

export default function MultipleChoiceField<T>({
  classNames,
  label,
  spread,
  options,
}: {
  classNames?: {
    label?: string;
    button?: string;
  };
  label?: string;
  spread?: boolean;
  options: { label: string; value: T }[];
}) {
  return (
    <div className="space-y-2">
      <StandaloneFieldLabel label={label} className={classNames?.label} />
      <StandaloneMultipleChoiceField
        spread={spread}
        options={options}
        classNames={classNames}
      />
    </div>
  );
}
