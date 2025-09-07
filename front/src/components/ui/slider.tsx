"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  value: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
  inverted?: boolean;
}

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className,
  disabled = false,
  orientation = "horizontal",
  inverted = false,
}: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const [internalValue, setInternalValue] = useState(value);

  // Ensure we have at least two values for range
  const normalizedValue =
    internalValue.length >= 2 ? internalValue : [min, max];
  const [minVal, maxVal] = normalizedValue;

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const getPercentage = useCallback(
    (val: number) => {
      return ((val - min) / (max - min)) * 100;
    },
    [min, max],
  );

  const getValueFromPosition = useCallback(
    (clientX: number, clientY: number) => {
      if (!trackRef.current) return min;

      const rect = trackRef.current.getBoundingClientRect();
      let percentage;

      if (orientation === "horizontal") {
        percentage = (clientX - rect.left) / rect.width;
      } else {
        percentage = (rect.bottom - clientY) / rect.height;
      }

      if (inverted) {
        percentage = 1 - percentage;
      }

      percentage = Math.max(0, Math.min(1, percentage));
      const rawValue = min + percentage * (max - min);
      return Math.round(rawValue / step) * step;
    },
    [min, max, step, orientation, inverted],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (isDragging === null || disabled) return;

      const newValue = getValueFromPosition(e.clientX, e.clientY);
      let newValues = [...normalizedValue];

      if (isDragging === 0) {
        // Dragging min handle
        newValues[0] = Math.min(newValue, newValues[1]);
      } else {
        // Dragging max handle
        newValues[1] = Math.max(newValue, newValues[0]);
      }

      setInternalValue(newValues);
      onValueChange?.(newValues);
    },
    [
      isDragging,
      disabled,
      getValueFromPosition,
      normalizedValue,
      onValueChange,
    ],
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  useEffect(() => {
    if (isDragging !== null) {
      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
      document.body.style.userSelect = "none";

      return () => {
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", handlePointerUp);
        document.body.style.userSelect = "";
      };
    }
  }, [isDragging, handlePointerMove, handlePointerUp]);

  const handleThumbPointerDown = (index: number) => (e: React.PointerEvent) => {
    if (disabled) return;

    e.preventDefault();
    e.stopPropagation();
    setIsDragging(index);
  };

  const handleTrackClick = (e: React.MouseEvent) => {
    if (disabled || isDragging !== null) return;

    const newValue = getValueFromPosition(e.clientX, e.clientY);
    let newValues = [...normalizedValue];

    // Determine which handle is closer
    const distToMin = Math.abs(newValue - minVal);
    const distToMax = Math.abs(newValue - maxVal);

    if (distToMin <= distToMax) {
      newValues[0] = Math.min(newValue, newValues[1]);
    } else {
      newValues[1] = Math.max(newValue, newValues[0]);
    }

    setInternalValue(newValues);
    onValueChange?.(newValues);
  };

  const minPercentage = getPercentage(minVal);
  const maxPercentage = getPercentage(maxVal);

  const thumbSize = 20;
  const trackHeight = 4;

  if (orientation === "vertical") {
    return (
      <div
        className={cn(
          "relative flex h-full w-6 touch-none select-none items-center",
          className,
        )}
      >
        <div
          ref={trackRef}
          className={cn(
            "relative h-full w-1 grow rounded-full bg-gray-200",
            disabled && "opacity-50",
          )}
          onClick={handleTrackClick}
        >
          {/* Active range */}
          <div
            className="absolute w-full rounded-full bg-primary"
            style={{
              bottom: `${minPercentage}%`,
              height: `${maxPercentage - minPercentage}%`,
            }}
          />

          {/* Min thumb */}
          <div
            className={cn(
              "absolute -left-2 h-5 w-5 rounded-full border-2 border-primary bg-white shadow-md transition-colors",
              "hover:border-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              isDragging === 0 && "border-primary-dark",
              disabled && "cursor-not-allowed opacity-50",
            )}
            style={{
              bottom: `${minPercentage}%`,
              transform: "translateY(50%)",
            }}
            onPointerDown={handleThumbPointerDown(0)}
            tabIndex={disabled ? -1 : 0}
            role="slider"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={minVal}
            aria-orientation="vertical"
          />

          {/* Max thumb */}
          <div
            className={cn(
              "absolute -left-2 h-5 w-5 rounded-full border-2 border-primary bg-white shadow-md transition-colors",
              "hover:border-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              isDragging === 1 && "border-primary-dark",
              disabled && "cursor-not-allowed opacity-50",
            )}
            style={{
              bottom: `${maxPercentage}%`,
              transform: "translateY(50%)",
            }}
            onPointerDown={handleThumbPointerDown(1)}
            tabIndex={disabled ? -1 : 0}
            role="slider"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={maxVal}
            aria-orientation="vertical"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className,
      )}
    >
      <div
        ref={trackRef}
        className={cn(
          "relative h-1 w-full grow rounded-full bg-gray-200",
          disabled && "opacity-50",
        )}
        onClick={handleTrackClick}
        style={{ height: trackHeight }}
      >
        {/* Active range */}
        <div
          className="absolute h-full rounded-full bg-primary"
          style={{
            left: `${minPercentage}%`,
            width: `${maxPercentage - minPercentage}%`,
          }}
        />

        {/* Min thumb */}
        <div
          className={cn(
            "absolute -top-2 h-5 w-5 rounded-full border-2 border-primary bg-white shadow-md transition-colors cursor-pointer",
            "hover:border-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            "touch-manipulation",
            isDragging === 0 &&
              "border-primary-dark ring-2 ring-primary ring-offset-2",
            disabled && "cursor-not-allowed opacity-50",
          )}
          style={{
            left: `${minPercentage}%`,
            transform: "translateX(-50%)",
          }}
          onPointerDown={handleThumbPointerDown(0)}
          tabIndex={disabled ? -1 : 0}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={minVal}
          aria-orientation="horizontal"
          aria-label={`Minimum value: ${minVal}`}
        />

        {/* Max thumb */}
        <div
          className={cn(
            "absolute -top-2 h-5 w-5 rounded-full border-2 border-primary bg-white shadow-md transition-colors cursor-pointer",
            "hover:border-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            "touch-manipulation",
            isDragging === 1 &&
              "border-primary-dark ring-2 ring-primary ring-offset-2",
            disabled && "cursor-not-allowed opacity-50",
          )}
          style={{
            left: `${maxPercentage}%`,
            transform: "translateX(-50%)",
          }}
          onPointerDown={handleThumbPointerDown(1)}
          tabIndex={disabled ? -1 : 0}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={maxVal}
          aria-orientation="horizontal"
          aria-label={`Maximum value: ${maxVal}`}
        />
      </div>
    </div>
  );
}
