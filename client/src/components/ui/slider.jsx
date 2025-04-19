import React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

const Slider = React.forwardRef(({ 
  className, 
  min = 0, 
  max = 100,
  step = 1,
  defaultValue,
  value,
  onValueChange,
  onValueCommit,
  disabled,
  orientation = "horizontal",
  inverted = false,
  ...props 
}, ref) => {
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex touch-none select-none items-center",
        orientation === "horizontal" ? "w-full h-5" : "h-full w-5 flex-col",
        className
      )}
      min={min}
      max={max}
      step={step}
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      onValueCommit={onValueCommit}
      disabled={disabled}
      orientation={orientation}
      dir={inverted ? "rtl" : "ltr"}
      {...props}
    >
      <SliderPrimitive.Track
        className={cn(
          "relative rounded-full bg-gray-200 dark:bg-gray-800",
          orientation === "horizontal" 
            ? "h-2 w-full" 
            : "w-2 h-full"
        )}
      >
        <SliderPrimitive.Range 
          className={cn(
            "absolute rounded-full bg-primary",
            orientation === "horizontal" 
              ? "h-full" 
              : "w-full"
          )} 
        />
      </SliderPrimitive.Track>
      {(defaultValue || value) && (defaultValue || value).map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          className={cn(
            "block h-5 w-5 rounded-full border-2 border-primary bg-white ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            "hover:bg-primary/10 hover:border-primary/80",
            "data-[state=active]:cursor-grabbing data-[state=active]:bg-primary/20"
          )}
        />
      ))}
    </SliderPrimitive.Root>
  );
});

Slider.displayName = "Slider";

export { Slider };