import * as React from "react";
import { cn } from "@/lib/utils";

interface RadioGroupContextType {
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
}

const RadioGroupContext = React.createContext<RadioGroupContextType | undefined>(undefined);

const useRadioGroupContext = () => {
  const context = React.useContext(RadioGroupContext);
  if (!context) {
    throw new Error("RadioGroupItem must be used within a RadioGroup");
  }
  return context;
};

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, name, ...props }, ref) => {
    return (
      <RadioGroupContext.Provider value={{ value, onValueChange, name }}>
        <div
          ref={ref}
          className={cn("grid gap-2", className)}
          role="radiogroup"
          {...props}
        />
      </RadioGroupContext.Provider>
    );
  }
);
RadioGroup.displayName = "RadioGroup";

export interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, children, ...props }, ref) => {
    const { value: groupValue, onValueChange, name } = useRadioGroupContext();
    const isChecked = value === groupValue;
    const id = React.useId();

    return (
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <input
          ref={ref}
          type="radio"
          id={id}
          name={name}
          value={value}
          checked={isChecked}
          onChange={(e) => {
            if (e.target.checked && onValueChange) {
              onValueChange(value);
            }
          }}
          className={cn(
            "aspect-square h-4 w-4 rounded-full border border-gray-300 text-gray-900",
            "focus:ring-2 focus:ring-gray-950 focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "dark:border-gray-600 dark:text-gray-100 dark:focus:ring-gray-300",
            "sm:h-5 sm:w-5",
            className
          )}
          {...props}
        />
        {children && (
          <label
            htmlFor={id}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-900 dark:text-gray-100 cursor-pointer select-none"
          >
            {children}
          </label>
        )}
      </div>
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
