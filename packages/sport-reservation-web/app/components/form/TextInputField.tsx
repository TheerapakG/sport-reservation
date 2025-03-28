import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useFieldContext } from "@/utils/form/context";

export default function TextInputField({
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
  const field = useFieldContext<string>();

  return (
    <div className="space-y-2">
      <Label
        className={cn("block font-semibold text-gray-700", classNames?.label)}
      >
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          className={cn(
            "h-7 rounded-none border-0 px-2 py-1 shadow focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none aria-[invalid]:ring-1 aria-[invalid]:ring-red-500 aria-[invalid]:ring-offset-2",
            classNames?.input,
          )}
          {...(field.state.meta.errors.length > 0
            ? {
                "aria-invalid": true,
              }
            : {})}
          placeholder={placeholder}
          value={field.state.meta.isPristine ? "" : field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
        />
        {trailingText && (
          <span className="text-xs text-gray-400">{trailingText}</span>
        )}
      </div>
    </div>
  );
}
