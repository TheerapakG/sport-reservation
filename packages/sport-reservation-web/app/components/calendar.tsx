import { Calendar as CalendarPrimitive } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ComponentProps } from "react";
import { buttonVariants } from "./ui/button";

export default function Calendar({
  className,
  classNames,
  ...props
}: ComponentProps<typeof CalendarPrimitive>) {
  return (
    <CalendarPrimitive
      captionLayout="dropdown"
      showOutsideDays
      className={cn("p-0", className)}
      classNames={{
        months: "relative flex flex-col space-y-4 sm:space-x-4 sm:space-y-0",
        dropdown: "text-[#F28382] font-semibold",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "hidden",
        nav: "absolute w-full inset-x-0 h-8 space-x-1 flex items-center",
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 rounded-full bg-transparent p-0 opacity-50 hover:opacity-100",
          "absolute left-1 z-10",
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 rounded-full bg-transparent p-0 opacity-50 hover:opacity-100",
          "absolute right-1 z-10",
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: cn(
          "relative rounded-full font-normal px-0.5 py-0 text-center text-sm focus-within:relative",
          "aria-selected:rounded-full aria-selected:bg-[#65D1F8] aria-selected:text-white aria-selected:opacity-100",
          "[&[data-outside=true]]:text-gray-400 [&[data-outside=true]]:aria-selected:[#65D1F8]/50 [&[data-outside=true]]:aria-selected:text-white",
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal hover:bg-transparent",
        ),
        ...classNames,
      }}
      components={{
        Chevron: ({ className, ...props }) => {
          if (props.orientation === "left") {
            return (
              <ChevronLeft
                className={cn("h-8 w-8 rounded-full text-[#F28382]", className)}
                {...props}
              />
            );
          }
          return (
            <ChevronRight
              className={cn("h-8 w-8 rounded-full text-[#F28382]", className)}
              {...props}
            />
          );
        },
      }}
      {...props}
    />
  );
}
