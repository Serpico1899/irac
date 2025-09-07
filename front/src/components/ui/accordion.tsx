"use client";

import React, {
  createContext,
  useContext,
  useState,
  forwardRef,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils";

interface AccordionContextType {
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  type: "single" | "multiple";
  collapsible?: boolean;
}

const AccordionContext = createContext<AccordionContextType | null>(null);

interface AccordionProps {
  type: "single" | "multiple";
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  collapsible?: boolean;
  className?: string;
  children: ReactNode;
}

export function Accordion({
  type,
  value,
  defaultValue,
  onValueChange,
  collapsible = false,
  className,
  children,
}: AccordionProps) {
  const [internalValue, setInternalValue] = useState<string | string[]>(
    value || defaultValue || (type === "multiple" ? [] : ""),
  );

  const currentValue = value !== undefined ? value : internalValue;

  const handleValueChange = (newValue: string | string[]) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <AccordionContext.Provider
      value={{
        value: currentValue,
        onValueChange: handleValueChange,
        type,
        collapsible,
      }}
    >
      <div className={cn("space-y-2", className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps {
  value: string;
  className?: string;
  children: ReactNode;
}

function AccordionItemWithContext({
  value,
  className,
  children,
}: AccordionItemProps) {
  const context = useContext(AccordionContext);

  if (!context) {
    throw new Error("AccordionItem must be used within an Accordion");
  }

  const isOpen =
    context.type === "multiple"
      ? Array.isArray(context.value) && context.value.includes(value)
      : context.value === value;

  return (
    <div
      className={cn(
        "border border-gray-200 rounded-lg overflow-hidden bg-white",
        className,
      )}
      data-state={isOpen ? "open" : "closed"}
      data-value={value}
    >
      {children}
    </div>
  );
}

interface AccordionTriggerProps {
  className?: string;
  children: ReactNode;
}

export const AccordionTrigger = forwardRef<
  HTMLButtonElement,
  AccordionTriggerProps
>(({ className, children, ...props }, ref) => {
  const context = useContext(AccordionContext);
  const item = useContext(AccordionItemContext);

  if (!context) {
    throw new Error("AccordionTrigger must be used within an Accordion");
  }

  if (!item) {
    throw new Error("AccordionTrigger must be used within an AccordionItem");
  }

  const isOpen =
    context.type === "multiple"
      ? Array.isArray(context.value) && context.value.includes(item.value)
      : context.value === item.value;

  const handleClick = () => {
    if (context.type === "multiple") {
      const currentArray = Array.isArray(context.value) ? context.value : [];
      const newValue = isOpen
        ? currentArray.filter((v) => v !== item.value)
        : [...currentArray, item.value];
      context.onValueChange?.(newValue);
    } else {
      const newValue = isOpen && context.collapsible ? "" : item.value;
      context.onValueChange?.(newValue);
    }
  };

  return (
    <button
      ref={ref}
      className={cn(
        "flex w-full items-center justify-between p-4 font-medium text-left",
        "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        "transition-colors duration-200",
        className,
      )}
      onClick={handleClick}
      aria-expanded={isOpen}
      data-state={isOpen ? "open" : "closed"}
      {...props}
    >
      {children}
      <svg
        className={cn(
          "h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200",
          isOpen && "rotate-180",
        )}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
  );
});

AccordionTrigger.displayName = "AccordionTrigger";

interface AccordionContentProps {
  className?: string;
  children: ReactNode;
}

const AccordionItemContext = createContext<{ value: string } | null>(null);

// Update AccordionItem to provide context
export function AccordionItemWithContext({
  value,
  className,
  children,
}: AccordionItemProps) {
  const context = useContext(AccordionContext);

  if (!context) {
    throw new Error("AccordionItem must be used within an Accordion");
  }

  const isOpen =
    context.type === "multiple"
      ? Array.isArray(context.value) && context.value.includes(value)
      : context.value === value;

  return (
    <AccordionItemContext.Provider value={{ value }}>
      <div
        className={cn(
          "border border-gray-200 rounded-lg overflow-hidden bg-white",
          className,
        )}
        data-state={isOpen ? "open" : "closed"}
        data-value={value}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

export function AccordionContent({
  className,
  children,
}: AccordionContentProps) {
  const context = useContext(AccordionContext);
  const item = useContext(AccordionItemContext);

  if (!context) {
    throw new Error("AccordionContent must be used within an Accordion");
  }

  if (!item) {
    throw new Error("AccordionContent must be used within an AccordionItem");
  }

  const isOpen =
    context.type === "multiple"
      ? Array.isArray(context.value) && context.value.includes(item.value)
      : context.value === item.value;

  return (
    <div
      className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out",
        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
      )}
      data-state={isOpen ? "open" : "closed"}
    >
      <div className={cn("p-4 pt-0", className)}>{children}</div>
    </div>
  );
}

// Export the corrected AccordionItem
export { AccordionItemWithContext as AccordionItem };
