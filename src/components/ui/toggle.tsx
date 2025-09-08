
export const toggleVariants = ({
  variant,
  size,
}: {
  variant?: string;
  size?: string;
}) => {
  const parts: Array<string | false | null | undefined> = [
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
    // variant mapping
    variant === "outline" && "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
    (!variant || variant === "default") && "bg-muted text-foreground hover:bg-muted/80",
    // size mapping
    (!size || size === "default") && "h-9 px-3",
    size === "sm" && "h-8 px-2 text-xs",
    size === "lg" && "h-10 px-4 text-base",
  ];
  return parts.filter(Boolean).join(" ");
};

import { ComponentProps } from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cn } from "@/lib/utils"

function Toggle({
  className,
  variant,
  size,
  ...props
}: ComponentProps<typeof TogglePrimitive.Root> & {
  variant?: string;
  size?: string;
}) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Toggle }
