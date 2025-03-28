import { cn } from "@/lib/utils";

export function StandaloneFieldLabel({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("block font-semibold text-gray-700", className)}>
      {label}
    </div>
  );
}
