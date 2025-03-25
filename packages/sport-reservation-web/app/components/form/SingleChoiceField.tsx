import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useFieldContext } from "@/utils/form/context";

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
  const field = useFieldContext<"" | T>();

  return (
    <div className="space-y-2">
      <Label
        className={cn("block font-semibold text-gray-700", classNames?.label)}
      >
        {label}
      </Label>
      <div className={spread ? "flex justify-between" : "flex flex-wrap gap-2"}>
        {options.map((option) => (
          <Button
            key={option.value}
            variant="outline"
            className={cn(
              "h-auto rounded-full px-3 py-1 aria-[invalid]:ring-1 aria-[invalid]:ring-red-500 aria-[invalid]:ring-offset-2",
              field.state.meta.isPristine || field.state.value !== option.value
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
              field.handleChange(option.value);
              field.handleBlur();
            }}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
