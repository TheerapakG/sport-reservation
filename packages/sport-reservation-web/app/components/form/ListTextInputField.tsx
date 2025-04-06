import { StandaloneFieldLabel } from "./StandaloneFieldLabel";
import StandaloneListTextInputField from "./StandaloneListTextInputField";

export default function ListTextInputField({
  classNames,
  label,
  placeholder,
  style,
}: {
  classNames?: {
    label?: string;
    input?: string;
  };
  label?: string;
  placeholder?: string;
  style?: "list" | "badge";
}) {
  return (
    <div className="space-y-2">
      <StandaloneFieldLabel label={label} className={classNames?.label} />
      <StandaloneListTextInputField
        placeholder={placeholder}
        classNames={classNames}
        style={style}
      />
    </div>
  );
}
