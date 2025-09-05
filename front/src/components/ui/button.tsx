"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "ghost"
    | "destructive"
    | "link";
  size?: "sm" | "default" | "lg" | "icon";
  asChild?: boolean;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const baseClasses = [
      // Base styles
      "inline-flex items-center justify-center",
      "whitespace-nowrap rounded-lg text-sm font-medium",
      "ring-offset-background transition-colors",
      "focus-visible:outline-none focus-visible:ring-2",
      "focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      // Mobile-first: Ensure minimum touch target
      "min-h-[44px] min-w-[44px]",
      // RTL support
      "[&>svg]:shrink-0",
    ];

    const variantClasses = {
      default: [
        "bg-primary text-primary-foreground",
        "hover:bg-primary/90",
        "active:bg-primary/95",
      ],
      secondary: [
        "bg-secondary text-secondary-foreground",
        "hover:bg-secondary/80",
        "active:bg-secondary/70",
      ],
      outline: [
        "border border-input bg-background",
        "hover:bg-accent hover:text-accent-foreground",
        "active:bg-accent/90",
      ],
      ghost: [
        "hover:bg-accent hover:text-accent-foreground",
        "active:bg-accent/90",
      ],
      destructive: [
        "bg-destructive text-destructive-foreground",
        "hover:bg-destructive/90",
        "active:bg-destructive/95",
      ],
      link: [
        "text-primary underline-offset-4",
        "hover:underline",
        "active:text-primary/90",
      ],
    };

    const sizeClasses = {
      sm: "h-10 px-3 text-xs gap-2",
      default: "h-12 px-4 py-2 gap-2",
      lg: "h-14 px-6 text-base gap-3",
      icon: "h-12 w-12 p-0",
    };

    const classes = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      loading && "relative text-transparent",
      className,
    );

    const LoadingSpinner = () => (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      </div>
    );

    if (asChild) {
      // When asChild is true, we expect children to be a single React element
      // This allows using the button styles on other elements like Link
      const child = React.Children.only(children) as React.ReactElement;
      return React.cloneElement(child, {
        className: cn(classes, child.props.className),
        ref,
        ...props,
      });
    }

    return (
      <button
        className={classes}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <LoadingSpinner />}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };
