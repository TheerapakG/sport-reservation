import Calendar from "@/components/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useFieldContext } from "@/utils/form/context";
import { useStore } from "@tanstack/react-form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

export default function StandaloneDatePickerField({
  placeholder,
  classNames,
}: {
  placeholder?: string;
  classNames?: {
    button?: string;
  };
}) {
  const field = useFieldContext<undefined | Date>();
  const fieldValue = useStore(field.store, (state) => state.value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "h-7 w-72 appearance-none justify-between rounded-none border-0 border-l-4 border-l-[#65D1F8] bg-white px-2 py-1 text-gray-700 shadow focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none aria-[invalid]:ring-1 aria-[invalid]:ring-red-500 aria-[invalid]:ring-offset-2",
            classNames?.button,
          )}
          {...(field.state.meta.errors.length > 0
            ? {
                "aria-invalid": true,
              }
            : {})}
        >
          <span>{fieldValue ? format(fieldValue, "PPP") : placeholder}</span>
          <CalendarIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4">
        <Calendar
          mode="single"
          selected={fieldValue}
          onSelect={(date) => field.setValue(date)}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
