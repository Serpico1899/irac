"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  value?: string;
  required?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked,
      onCheckedChange,
      disabled = false,
      className,
      id,
      name,
      value,
      required,
      ...props
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!disabled) {
        onCheckedChange?.(e.target.checked);
      }
    };

    return (
      <div className="relative inline-flex">
        <input
          ref={ref}
          type="checkbox"
          id={id}
          name={name}
          value={value}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          className="sr-only"
          {...props}
        />
        <div
          className={cn(
            "relative h-4 w-4 rounded border-2 border-gray-300 bg-white transition-all duration-200 ease-in-out",
            "hover:border-gray-400 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
            "cursor-pointer touch-manipulation",
            checked && "border-primary bg-primary",
            disabled && "cursor-not-allowed opacity-50 bg-gray-100 border-gray-200",
            className
          )}
        >
          {/* Checkmark */}
          {checked && (
            <svg
              className="absolute inset-0 h-full w-full text-white"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
                clipRule="evenodd"
              />
            </svg>
          )}

          {/* Indeterminate state (optional) */}
          {checked === undefined && (
            <div className="absolute inset-1 bg-primary rounded-sm opacity-50" />
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
