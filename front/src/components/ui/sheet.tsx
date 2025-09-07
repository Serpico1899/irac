"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  forwardRef,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils";

interface SheetContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SheetContext = createContext<SheetContextType | null>(null);

interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export function Sheet({ open = false, onOpenChange, children }: SheetProps) {
  const [internalOpen, setInternalOpen] = useState(open);

  useEffect(() => {
    setInternalOpen(open);
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    setInternalOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <SheetContext.Provider
      value={{ open: internalOpen, onOpenChange: handleOpenChange }}
    >
      {children}
    </SheetContext.Provider>
  );
}

interface SheetTriggerProps {
  asChild?: boolean;
  children: ReactNode;
  className?: string;
}

export const SheetTrigger = forwardRef<HTMLButtonElement, SheetTriggerProps>(
  ({ asChild, children, className, ...props }, ref) => {
    const context = useContext(SheetContext);

    if (!context) {
      throw new Error("SheetTrigger must be used within a Sheet");
    }

    const { onOpenChange } = context;

    if (asChild) {
      return React.cloneElement(children as React.ReactElement<any>, {
        onClick: () => onOpenChange(true),
        ...props,
      });
    }

    return (
      <button
        ref={ref}
        className={cn("", className)}
        onClick={() => onOpenChange(true)}
        {...props}
      >
        {children}
      </button>
    );
  },
);

SheetTrigger.displayName = "SheetTrigger";

interface SheetContentProps {
  side?: "left" | "right" | "top" | "bottom";
  className?: string;
  children: ReactNode;
}

export function SheetContent({
  side = "right",
  className,
  children,
  ...props
}: SheetContentProps) {
  const context = useContext(SheetContext);

  if (!context) {
    throw new Error("SheetContent must be used within a Sheet");
  }

  const { open, onOpenChange } = context;

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "0px"; // Prevent layout shift
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [open]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange]);

  if (!open) return null;

  const sideClasses = {
    left: "left-0 top-0 h-full w-full sm:max-w-md translate-x-0",
    right: "right-0 top-0 h-full w-full sm:max-w-md translate-x-0",
    top: "top-0 left-0 right-0 h-full max-h-96",
    bottom: "bottom-0 left-0 right-0 h-full max-h-96",
  };

  const slideClasses = {
    left: open ? "translate-x-0" : "-translate-x-full",
    right: open ? "translate-x-0" : "translate-x-full",
    top: open ? "translate-y-0" : "-translate-y-full",
    bottom: open ? "translate-y-0" : "translate-y-full",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={() => onOpenChange(false)}
      />

      {/* Sheet */}
      <div
        className={cn(
          "fixed z-50 bg-white shadow-2xl transition-transform duration-300 ease-in-out",
          sideClasses[side],
          slideClasses[side],
          side === "left" && "border-r border-gray-200",
          side === "right" && "border-l border-gray-200",
          side === "top" && "border-b border-gray-200 rounded-b-lg",
          side === "bottom" && "border-t border-gray-200 rounded-t-lg",
          className,
        )}
        {...props}
      >
        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
          aria-label="Close"
        >
          <svg
            className="h-4 w-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="h-full overflow-y-auto">{children}</div>
      </div>
    </>
  );
}

interface SheetHeaderProps {
  className?: string;
  children: ReactNode;
}

export function SheetHeader({ className, children }: SheetHeaderProps) {
  return <div className={cn("px-6 pt-6 pb-4", className)}>{children}</div>;
}

interface SheetTitleProps {
  className?: string;
  children: ReactNode;
}

export function SheetTitle({ className, children }: SheetTitleProps) {
  return (
    <h2 className={cn("text-lg font-semibold text-gray-900", className)}>
      {children}
    </h2>
  );
}

interface SheetDescriptionProps {
  className?: string;
  children: ReactNode;
}

export function SheetDescription({
  className,
  children,
}: SheetDescriptionProps) {
  return (
    <p className={cn("text-sm text-gray-600 mt-2", className)}>{children}</p>
  );
}
