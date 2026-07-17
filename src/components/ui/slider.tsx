import * as React from "react";
import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    type="range"
    ref={ref}
    className={cn(
      "h-2 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-white",
      className,
    )}
    {...props}
  />
));
Slider.displayName = "Slider";

export { Slider };
