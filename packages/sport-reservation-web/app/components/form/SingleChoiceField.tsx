import { StandaloneFieldLabel } from "./StandaloneFieldLabel";
import StandaloneSingleChoiceField from "./StandaloneSingleChoiceField";

export default function SingleChoiceField<T extends string | number>({
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
      <StandaloneSingleChoiceField
        spread={spread}
        options={options}
        classNames={classNames}
      />
    </div>
  );
}
