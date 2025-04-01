import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useFieldContext } from "@/utils/form/context";
import { useStore } from "@tanstack/react-form";

export default function TextInputField({
  classNames,
  placeholder,
  trailingText,
  variant = "input",
}: {
  classNames?: {
    input?: string;
  };
  placeholder?: string;
  trailingText?: string;
  variant?: "input" | "textarea";
}) {
  const field = useFieldContext<undefined | string>();
  const fieldValue = useStore(field.store, (state) => state.value);

  return (
    <div className="flex items-center gap-2">
      {variant === "input" ? (
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
          value={fieldValue === undefined ? "" : fieldValue}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
        />
      ) : undefined}
      {variant === "textarea" ? (
        <Textarea
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
          value={fieldValue === undefined ? "" : fieldValue}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
        />
      ) : undefined}
      {trailingText && (
        <span className="text-xs text-gray-400">{trailingText}</span>
      )}
    </div>
  );
}
