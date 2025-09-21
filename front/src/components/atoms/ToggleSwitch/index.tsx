"use client";

import { motion } from "framer-motion";

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
  label?: string;
  className?: string;
  id?: string;
}

const ToggleSwitch = ({
  enabled,
  onChange,
  disabled = false,
  size = "medium",
  label,
  className = "",
  id,
}: ToggleSwitchProps) => {
  const sizeConfig = {
    small: {
      container: "h-4 w-7",
      toggle: "h-3 w-3",
      translateX: "translate-x-4",
    },
    medium: {
      container: "h-6 w-11",
      toggle: "h-4 w-4",
      translateX: "translate-x-6",
    },
    large: {
      container: "h-8 w-14",
      toggle: "h-6 w-6",
      translateX: "translate-x-7",
    },
  };

  const config = sizeConfig[size];

  const handleToggle = () => {
    if (!disabled) {
      onChange(!enabled);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className={`text-sm font-medium select-none ${
            disabled ? "text-text-light cursor-not-allowed" : "text-text-primary cursor-pointer"
          }`}
        >
          {label}
        </label>
      )}

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          relative inline-flex items-center rounded-full transition-all duration-200 ease-in-out
          ${config.container}
          ${
            enabled
              ? disabled
                ? "bg-primary bg-opacity-50"
                : "bg-primary hover:bg-primary-dark focus:bg-primary-dark"
              : disabled
              ? "bg-background-darkest bg-opacity-50"
              : "bg-background-darkest hover:bg-background-darkest focus:bg-background-darkest"
          }
          ${
            disabled
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 focus:ring-offset-2 focus:ring-offset-white"
          }
        `}
      >
        <motion.span
          className={`
            inline-block rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out
            ${config.toggle}
            ${enabled ? config.translateX : "translate-x-1"}
          `}
          animate={{
            x: enabled ? (size === "small" ? 16 : size === "medium" ? 24 : 28) : 4,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        />

        {/* Screen reader text */}
        <span className="sr-only">
          {enabled ? "Enabled" : "Disabled"}
          {label && ` ${label}`}
        </span>
      </button>
    </div>
  );
};

export default ToggleSwitch;
