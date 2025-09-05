import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface SelectContextType {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
}

const SelectContext = React.createContext<SelectContextType | undefined>(
  undefined,
);

const useSelectContext = () => {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("Select components must be used within a Select component");
  }
  return context;
};

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

const Select = ({ value, onValueChange, children }: SelectProps) => {
  return (
    <SelectContext.Provider value={{ value, onValueChange }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex h-12 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-base ring-offset-white",
        "placeholder:text-gray-500",
        "focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:focus:ring-gray-300",
        "sm:h-10 sm:text-sm",
        "transition-colors",
        className,
      )}
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn(
          "h-4 w-4 opacity-50 transition-transform duration-200",
          isOpen && "rotate-180",
        )}
      />
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

export interface SelectValueProps {
  placeholder?: string;
}

const SelectValue = ({
  placeholder = "Select an option...",
}: SelectValueProps) => {
  const { value } = useSelectContext();

  return (
    <span
      className={cn("truncate", !value && "text-gray-500 dark:text-gray-400")}
    >
      {value || placeholder}
    </span>
  );
};

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-lg border border-gray-200 bg-white text-gray-950 shadow-md",
        "dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50",
        "mt-1 w-full",
        "animate-in fade-in-0 zoom-in-95",
        "max-h-60 overflow-y-auto",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SelectContent.displayName = "SelectContent";

export interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value, ...props }, ref) => {
    const { value: selectedValue, onValueChange } = useSelectContext();
    const isSelected = value === selectedValue;

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full cursor-default select-none items-center rounded-sm py-2 px-3 text-sm outline-none",
          "focus:bg-gray-100 focus:text-gray-900",
          "dark:focus:bg-gray-800 dark:focus:text-gray-50",
          "hover:bg-gray-100 hover:text-gray-900",
          "dark:hover:bg-gray-800 dark:hover:text-gray-50",
          isSelected &&
            "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50",
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          "touch-manipulation min-h-[44px] sm:min-h-[36px]", // Better touch targets on mobile
          className,
        )}
        onClick={() => onValueChange?.(value)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
SelectItem.displayName = "SelectItem";

// Simple native select alternative for better mobile UX
export interface NativeSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "flex h-12 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-base ring-offset-white",
          "focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:focus:ring-gray-300",
          "sm:h-10 sm:text-sm",
          "transition-colors",
          "appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke-width%3D%221.5%22%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19.5%208.25l-7.5%207.5-7.5-7.5%22/%3E%3C/svg%3E')] bg-[length:16px_16px] bg-[right_12px_center] bg-no-repeat",
          "rtl:bg-[left_12px_center]",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    );
  },
);
NativeSelect.displayName = "NativeSelect";

export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  NativeSelect,
};
