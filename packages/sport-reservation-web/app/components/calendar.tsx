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
      className={cn("p-0", className)}
      classNames={{
        caption_label: "text-[#F28382] font-semibold",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 rounded-full bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        cell: cn(
          "relative px-0.5 py-0 text-center text-sm focus-within:relative focus-within:z-20[&:has([aria-selected].day-range-end)]:rounded-r-full [&:has([aria-selected].day-range-end)]:rounded-r-full",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-full [&:has(>.day-range-start)]:rounded-l-full first:[&:has([aria-selected])]:rounded-l-full last:[&:has([aria-selected])]:rounded-r-full"
            : "[&:has([aria-selected])]:rounded-full",
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 rounded-full p-0 font-normal aria-selected:bg-[#65D1F8] aria-selected:text-white aria-selected:opacity-100",
        ),
        day_outside:
          "day-outside text-gray-400 aria-selected:[#65D1F8]/50 aria-selected:text-white",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft
            className={cn("h-8 w-8 rounded-full text-[#F28382]", className)}
            {...props}
          />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight
            className={cn("h-8 w-8 rounded-full text-[#F28382]", className)}
            {...props}
          />
        ),
      }}
      {...props}
    />
  );
}
