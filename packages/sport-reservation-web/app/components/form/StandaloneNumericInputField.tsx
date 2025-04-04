import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useFieldContext } from "@/utils/form/context";
import { useStore } from "@tanstack/react-form";
import { MinusIcon, PlusIcon } from "lucide-react";
import { useCallback, useEffect } from "react";

export default function StandaloneNumericInputField({
  classNames,
  placeholder,
  trailingText,
  buttons,
  min,
  max,
}: {
  classNames?: {
    container?: string;
    input?: string;
  };
  placeholder?: string;
  trailingText?: string;
  buttons?: boolean;
  min?: number;
  max?: number;
}) {
  const field = useFieldContext<undefined | number>();
  const fieldValue = useStore(field.store, (state) => state.value);
  const handleChange = useCallback(
    (value: number) => {
      field.handleChange(value);
    },
    [field],
  );

  useEffect(() => {
    if (min !== undefined && fieldValue !== undefined && fieldValue < min) {
      handleChange(min);
    }
    if (max !== undefined && fieldValue !== undefined && fieldValue > max) {
      handleChange(max);
    }
  }, [fieldValue, min, max, handleChange]);

  return (
    <div className={cn("flex items-center gap-2", classNames?.container)}>
      {buttons && (
        <div className="flex flex-col gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              handleChange(
                fieldValue === undefined ? (min ?? 0) : fieldValue - 1,
              )
            }
            disabled={fieldValue !== undefined && fieldValue === min}
            className="rounded-full bg-[#65D1F8] text-white hover:bg-[#65D1F8]/80 hover:text-white"
          >
            <MinusIcon className="h-4 w-4" />
          </Button>
        </div>
      )}
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
        value={fieldValue === undefined ? "" : fieldValue}
        onChange={(e) => field.handleChange(e.target.valueAsNumber)}
        onBlur={field.handleBlur}
      />
      {trailingText && (
        <span className="text-xs text-gray-400">{trailingText}</span>
      )}
      {buttons && (
        <div className="flex flex-col gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              handleChange(
                fieldValue === undefined ? (min ?? 0) : fieldValue + 1,
              )
            }
            disabled={fieldValue !== undefined && fieldValue === max}
            className="rounded-full bg-[#65D1F8] text-white hover:bg-[#65D1F8]/80 hover:text-white"
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
