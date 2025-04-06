import { StandaloneFieldLabel } from "./StandaloneFieldLabel";
import StandaloneListSelectInputField from "./StandaloneListSelectInputField";

export default function ListSelectInputField<T>({
  classNames,
  label,
  placeholder,
  options,
  style,
}: {
  classNames?: {
    label?: string;
    select?: string;
  };
  label?: string;
  placeholder?: string;
  options: {
    icon?: (props: { className?: string }) => React.ReactNode;
    label: string;
    value: T;
  }[];
  style?: "list" | "badge";
}) {
  return (
    <div className="space-y-2">
      <StandaloneFieldLabel label={label} className={classNames?.label} />
      <StandaloneListSelectInputField
        placeholder={placeholder}
        options={options}
        classNames={classNames}
        style={style}
      />
    </div>
  );
}
