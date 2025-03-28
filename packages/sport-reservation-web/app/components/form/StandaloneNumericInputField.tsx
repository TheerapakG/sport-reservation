import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useFieldContext } from "@/utils/form/context";
import { type } from "arktype";
import { Effect } from "effect";
import { effectType } from "tiara-stack/utils/effectType";

export default function StandaloneNumericInputField({
  classNames,
  placeholder,
  trailingText,
}: {
  classNames?: {
    input?: string;
  };
  placeholder?: string;
  trailingText?: string;
}) {
  const field = useFieldContext<"" | number>();

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        className={cn(
          "h-7 rounded-none border-0 px-2 py-1 shadow focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none aria-[invalid]:ring-1 aria-[invalid]:ring-red-500 aria-[invalid]:ring-offset-2",
          classNames?.input,
        )}
        {...(field.state.meta.errors.length > 0
          ? {
              "aria-invalid": true,
            }
          : {})}
        placeholder={placeholder}
        value={field.state.meta.isPristine ? "" : field.state.value}
        onChange={(e) =>
          field.handleChange(
            Effect.runSync(
              effectType(type("string.numeric.parse"), e.target.value),
            ),
          )
        }
        onBlur={field.handleBlur}
      />
      {trailingText && (
        <span className="text-xs text-gray-400">{trailingText}</span>
      )}
    </div>
  );
}
