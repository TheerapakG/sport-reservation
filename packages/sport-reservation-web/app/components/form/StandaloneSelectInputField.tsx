import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useFieldContext } from "@/utils/form/context";

export default function SelectInputField<T>({
  classNames,
  placeholder,
  options,
}: {
  classNames?: {
    select?: string;
  };
  placeholder?: string;
  options: { label: string; value: T }[];
}) {
  const field = useFieldContext<"" | T>();

  return (
    <Select
      onValueChange={(value) => {
        const option = options.find((option) => option.label === value);
        if (!option) {
          return;
        }
        field.handleChange(option.value);
      }}
    >
      <SelectTrigger
        onBlur={field.handleBlur}
        className={cn(
          "h-7 w-36 appearance-none rounded-none border-0 border-l-4 border-l-[#65D1F8] bg-white px-2 py-1 text-gray-700 shadow focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none aria-[invalid]:ring-1 aria-[invalid]:ring-red-500 aria-[invalid]:ring-offset-2",
          classNames?.select,
        )}
        {...(field.state.meta.errors.length > 0
          ? {
              "aria-invalid": true,
            }
          : {})}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.label} value={option.label}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
