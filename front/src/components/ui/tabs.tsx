import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

const useTabsContext = () => {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tab components must be used within a Tabs component");
  }
  return context;
};

const Tabs = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string;
    onValueChange: (value: string) => void;
  }
>(({ className, value, onValueChange, ...props }, ref) => (
  <TabsContext.Provider value={{ value, onValueChange }}>
    <div
      ref={ref}
      className={cn("w-full", className)}
      {...props}
    />
  </TabsContext.Provider>
));
Tabs.displayName = "Tabs";

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-12 items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
      "w-full sm:w-auto",
      "overflow-x-auto scrollbar-hide",
      className
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    value: string;
  }
>(({ className, value, children, ...props }, ref) => {
  const { value: selectedValue, onValueChange } = useTabsContext();
  const isSelected = value === selectedValue;

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-white transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300",
        "min-w-0 flex-1 sm:flex-initial sm:min-w-[100px]",
        isSelected
          ? "bg-white text-gray-950 shadow-sm dark:bg-gray-950 dark:text-gray-50"
          : "hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-100",
        className
      )}
      onClick={() => onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  );
});
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string;
  }
>(({ className, value, ...props }, ref) => {
  const { value: selectedValue } = useTabsContext();

  if (value !== selectedValue) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn(
        "mt-4 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300",
        "w-full",
        className
      )}
      {...props}
    />
  );
});
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
