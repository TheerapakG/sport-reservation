import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useFieldContext } from "@/utils/form/context";
import { useStore } from "@tanstack/react-form";
import { ClockIcon } from "lucide-react";

export default function StandaloneTimePickerField({
  placeholder,
  classNames,
}: {
  placeholder?: string;
  classNames?: {
    button?: string;
  };
}) {
  const field = useFieldContext<undefined | [number, number]>();
  const fieldValue = useStore(field.store, (state) => state.value);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          onBlur={field.handleBlur}
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
          <span>
            {fieldValue
              ? `${fieldValue[0].toString().padStart(2, "0")}:${fieldValue[1].toString().padStart(2, "0")}`
              : placeholder}
          </span>
          <ClockIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="sm:flex">
          <div className="flex flex-col divide-y sm:h-[300px] sm:flex-row sm:divide-x sm:divide-y-0">
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex p-2 sm:flex-col">
                {hours.map((hour) => (
                  <Button
                    key={hour}
                    size="icon"
                    variant="ghost"
                    className="aspect-square shrink-0 sm:w-full"
                    onClick={() => field.setValue([hour, fieldValue?.[1] ?? 0])}
                  >
                    {hour.toString().padStart(2, "0")}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex p-2 sm:flex-col">
                {minutes.map((minute) => (
                  <Button
                    key={minute}
                    size="icon"
                    variant="ghost"
                    className="aspect-square shrink-0 sm:w-full"
                    onClick={() =>
                      field.setValue([fieldValue?.[0] ?? 0, minute])
                    }
                  >
                    {minute.toString().padStart(2, "0")}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
