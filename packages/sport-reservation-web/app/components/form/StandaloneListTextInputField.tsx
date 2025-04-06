import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFieldContext } from "@/utils/form/context";
import { useStore } from "@tanstack/react-form";
import { PlusIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Input } from "../ui/input";

export default function StandaloneListTextInputField({
  classNames,
  placeholder,
  style = "list",
}: {
  classNames?: {
    input?: string;
  };
  placeholder?: string;
  style?: "list" | "badge";
}) {
  const field = useFieldContext<undefined | { id?: string; value: string }[]>();
  const fieldValue = useStore(field.store, (state) => state.value ?? []);

  const [inputValue, setInputValue] = useState<string>("");

  return (
    <div
      className={cn(
        "flex flex-col gap-y-2 rounded-lg bg-[#CAF2FF]/40 p-2",
        { "flex-col": style === "list" },
        { "flex-row flex-wrap gap-x-2": style === "badge" },
      )}
    >
      {fieldValue.map(({ value: rowValue }) => {
        return (
          <div
            key={rowValue}
            className="flex h-7 items-center justify-between gap-x-2 rounded-lg border border-[#65D1F8] bg-white pl-2"
          >
            <span className="grow-1 text-sm">{rowValue}</span>
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
        <Input
          type="text"
          className={cn(
            "h-7 rounded-none border-0 px-2 py-1 shadow focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none aria-[invalid]:ring-1 aria-[invalid]:ring-red-500 aria-[invalid]:ring-offset-2",
            classNames?.input,
          )}
          {...(field.state.meta.errors.length > 0
            ? {
                "aria-invalid": true,
              }
            : {})}
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={field.handleBlur}
        />
        <Button
          type="button"
          disabled={!inputValue}
          variant="outline"
          className="h-7 w-7 grow-0 p-0"
          onClick={() => {
            if (!inputValue) {
              return;
            }
            field.handleChange([...fieldValue, { value: inputValue }]);
            setInputValue("");
          }}
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
