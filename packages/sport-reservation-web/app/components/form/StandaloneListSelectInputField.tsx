import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useFieldContext } from "@/utils/form/context";
import { useStore } from "@tanstack/react-form";
import { PlusIcon, XIcon } from "lucide-react";
import { useState } from "react";

export default function StandaloneListSelectInputField<T>({
  classNames,
  placeholder,
  options,
  style = "list",
}: {
  classNames?: {
    select?: string;
  };
  placeholder?: string;
  options: {
    icon?: (props: { className?: string }) => React.ReactNode;
    label: string;
    value: T;
  }[];
  style?: "list" | "badge";
}) {
  const field = useFieldContext<
    undefined | { id?: string; label: string; value: T }[]
  >();
  const fieldValue = useStore(field.store, (state) => state.value ?? []);
  const fieldValueValues = fieldValue?.map(({ value }) => value);

  const optionLookup = Object.fromEntries(
    options.map((option) => [option.label, option]),
  ) as Record<
    string,
    {
      icon?: (props: { className?: string }) => React.ReactNode;
      label: string;
      value: T;
    }
  >;

  const leftOverOptions = options.filter(
    (option) => !fieldValueValues?.includes(option.value),
  );

  const [selectedOption, setSelectedOption] = useState<
    undefined | { label: string; value: T }
  >(undefined);

  return (
    <div
      className={cn(
        "flex flex-col gap-y-2 rounded-lg bg-[#CAF2FF]/40 p-2",
        { "flex-col": style === "list" },
        { "flex-row flex-wrap gap-x-2": style === "badge" },
      )}
    >
      {fieldValue.map(({ label, value: rowValue }) => {
        const option = optionLookup[label];

        return (
          <div
            key={label}
            className="flex h-7 items-center justify-between gap-x-2 rounded-lg border border-[#65D1F8] bg-white pl-2"
          >
            {option.icon && (
              <div className="flex h-4 w-4 grow-0 items-center justify-center">
                <option.icon />
              </div>
            )}
            <span className="grow-1 text-sm">{label}</span>
            <Button
              variant="ghost"
              onClick={() =>
                field.handleChange(
                  fieldValue.filter(({ value }) => value !== rowValue),
                )
              }
              className="h-6 w-6 grow-0 rounded-lg p-0"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        );
      })}
      <div className="flex w-full gap-x-2">
        <Select
          key={fieldValue.map(({ label }) => label).join(",")}
          onValueChange={(value) => {
            const option = leftOverOptions.find(
              (option) => option.label === value,
            );
            if (!option) {
              return;
            }
            setSelectedOption(option);
          }}
        >
          <SelectTrigger
            onBlur={field.handleBlur}
            className={cn(
              "h-7 appearance-none rounded-none border-0 border-l-4 border-l-[#65D1F8] bg-white px-2 py-1 text-gray-700 shadow focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none aria-[invalid]:ring-1 aria-[invalid]:ring-red-500 aria-[invalid]:ring-offset-2",
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
            {leftOverOptions.map((option) => (
              <SelectItem
                key={option.label}
                value={option.label}
                className="flex items-center gap-x-2"
              >
                {option.icon && <option.icon className="h-4 w-4 grow-0" />}
                <span className="text-sm">{option.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          disabled={!selectedOption}
          variant="outline"
          className="h-7 w-7 grow-0 p-0"
          onClick={() => {
            if (!selectedOption) {
              return;
            }
            field.handleChange([...fieldValue, selectedOption]);
            setSelectedOption(undefined);
          }}
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
