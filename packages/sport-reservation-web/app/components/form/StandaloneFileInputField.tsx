import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useFieldContext } from "@/utils/form/context";

export default function StandaloneFileInputField({
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
  const field = useFieldContext<undefined | File>();

  return (
    <div className="flex items-center gap-2">
      <Input
        type="file"
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
        onChange={(e) => field.handleChange(e.target.files?.[0])}
        onBlur={field.handleBlur}
      />
      {trailingText && (
        <span className="text-xs text-gray-400">{trailingText}</span>
      )}
    </div>
  );
}
