import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useFieldContext } from "@/utils/form/context";
import { useStore } from "@tanstack/react-form";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

export default function StandaloneSingleChoiceField<
  T extends string | number | undefined,
>({
  options,
  placeholder,
}: {
  options: { label: string; value: T }[];
  placeholder?: string;
}) {
  const field = useFieldContext<undefined | T>();
  const fieldValue = useStore(field.store, (state) => state.value);

  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          onBlur={field.handleBlur}
          className="h-7 w-72 appearance-none justify-between rounded-none border-0 border-l-4 border-l-[#65D1F8] bg-white px-2 py-1 text-gray-700 shadow focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none aria-[invalid]:ring-1 aria-[invalid]:ring-red-500 aria-[invalid]:ring-offset-2"
          {...(field.state.meta.errors.length > 0
            ? {
                "aria-invalid": true,
              }
            : {})}
        >
          <span className="truncate">
            {options.find((option) => option.value === fieldValue)?.label ??
              placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>No item found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.label}
                  value={option.label}
                  onSelect={() => {
                    field.setValue(option.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      fieldValue === option.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
