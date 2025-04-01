import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFieldContext } from "@/utils/form/context";
import { useStore } from "@tanstack/react-form";
import { Array, pipe } from "effect";

export default function StandaloneMultipleChoiceField<T>({
  classNames,
  spread,
  options,
}: {
  classNames?: {
    button?: string;
  };
  spread?: boolean;
  options: { label: string; value: T }[];
}) {
  const field = useFieldContext<T[]>();
  const fieldIsPristine = useStore(
    field.store,
    (state) => state.meta.isPristine,
  );
  const fieldValue = useStore(field.store, (state) => state.value);

  return (
    <div className={spread ? "flex justify-between" : "flex flex-wrap gap-2"}>
      {options.map((option) => (
        <Button
          key={option.label}
          type="button"
          variant="outline"
          className={cn(
            "h-auto rounded-full px-3 py-1 aria-[invalid]:ring-1 aria-[invalid]:ring-red-500 aria-[invalid]:ring-offset-2",
            fieldIsPristine || !Array.contains(option.value)(fieldValue)
              ? "border-gray-300 text-gray-500 hover:bg-gray-100"
              : "border-[#65D1F8] bg-[#E1F8FE] text-[#65D1F8] hover:bg-[#E1F8FE] hover:text-[#65D1F8] dark:bg-[#E1F8FE]",
            classNames?.button,
          )}
          {...(field.state.meta.errors.length > 0
            ? {
                "aria-invalid": true,
              }
            : {})}
          onClick={() => {
            console.log(
              fieldValue,
              pipe(
                fieldValue,
                Array.contains(option.value)(fieldValue)
                  ? Array.filter((value) => value !== option.value)
                  : Array.append(option.value),
              ),
            );
            field.handleChange(
              pipe(
                fieldValue,
                Array.contains(option.value)(fieldValue)
                  ? Array.filter((value) => value !== option.value)
                  : Array.append(option.value),
              ),
            );
            field.handleBlur();
          }}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
