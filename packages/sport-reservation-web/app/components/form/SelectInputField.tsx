import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useFieldContext } from "@/utils/form/context";

export default function SelectInputField({
  classNames,
  label,
  placeholder,
  options,
}: {
  classNames?: {
    label?: string;
    select?: string;
  };
  label?: string;
  placeholder?: string;
  options: { label: string; value: string }[];
}) {
  const field = useFieldContext<undefined | string>();

  return (
    <div className="space-y-2">
      <Label
        className={cn("block font-semibold text-gray-700", classNames?.label)}
      >
        {label}
      </Label>
      <Select
        onValueChange={field.handleChange}
        defaultValue={field.state.value}
      >
        <SelectTrigger
          className={cn(
            "h-7 w-36 appearance-none rounded-none border-0 border-l-4 border-l-[#65D1F8] bg-white px-2 py-1 text-gray-700 shadow focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none",
            classNames?.select,
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
