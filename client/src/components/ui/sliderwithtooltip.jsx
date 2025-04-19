import React, { useState, useEffect } from "react";
import { Slider } from "./Slider";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const SliderWithTooltip = ({
  className,
  label,
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  onValueCommit,
  unit = "",
  showTooltip = true,
  tooltipPlacement = "top",
  showMinMax = true,
  disabled = false,
  variant = "default",
  ...props
}) => {
  // Use either controlled or uncontrolled approach
  const [localValue, setLocalValue] = useState(value || defaultValue || [min]);
  const [showTooltipValue, setShowTooltipValue] = useState(false);

  // Keep local value in sync with props
  useEffect(() => {
    if (value !== undefined) {
      setLocalValue(value);
    }
  }, [value]);

  // Handle change and pass to parent
  const handleChange = (newValue) => {
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  // Get tooltip position based on slider value
  const getTooltipPosition = () => {
    const percentage = ((localValue[0] - min) / (max - min)) * 100;
    return `${Math.max(0, Math.min(percentage, 100))}%`;
  };

  // Define variant styles
  const variantStyles = {
    default: {
      track: "bg-gray-200",
      range: "bg-primary",
      thumb: "border-primary bg-white",
    },
    secondary: {
      track: "bg-gray-200",
      range: "bg-blue-500",
      thumb: "border-blue-500 bg-white",
    },
    success: {
      track: "bg-gray-200",
      range: "bg-green-500",
      thumb: "border-green-500 bg-white",
    },
    warning: {
      track: "bg-gray-200",
      range: "bg-yellow-500",
      thumb: "border-yellow-500 bg-white",
    },
    destructive: {
      track: "bg-gray-200",
      range: "bg-red-500",
      thumb: "border-red-500 bg-white",
    },
  };

  const variantStyle = variantStyles[variant] || variantStyles.default;

  return (
    <div className={cn("space-y-4", className)}>
      {label && (
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium">{label}</Label>
          <div className="text-sm text-gray-500 font-medium">
            {localValue[0]}{unit}
          </div>
        </div>
      )}
      
      <div className="relative pt-1">
        <Slider
          min={min}
          max={max}
          step={step}
          value={value !== undefined ? value : undefined}
          defaultValue={defaultValue || [min]}
          onValueChange={handleChange}
          onValueCommit={onValueCommit}
          disabled={disabled}
          onMouseEnter={() => setShowTooltipValue(true)}
          onMouseLeave={() => setShowTooltipValue(false)}
          onTouchStart={() => setShowTooltipValue(true)}
          onTouchEnd={() => setShowTooltipValue(false)}
          className={cn("", props.className)}
          {...props}
        />
        
        {showTooltip && showTooltipValue && (
          <div 
            className="absolute -mt-8 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs"
            style={{ 
              left: getTooltipPosition(),
              opacity: showTooltipValue ? 1 : 0,
              transition: "opacity 0.2s",
            }}
          >
            {localValue[0]}{unit}
          </div>
        )}
        
        {showMinMax && (
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-500">{min}{unit}</span>
            <span className="text-xs text-gray-500">{max}{unit}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export { SliderWithTooltip };