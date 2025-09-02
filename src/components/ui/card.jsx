import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef(({ className = "", variant = "default", children, ...props }, ref) => {
  const variants = {
    default: "bg-card text-card-foreground border-border",
    secondary: "bg-card-secondary text-card-foreground border-border",
    tertiary: "bg-card-tertiary text-card-foreground border-border",
    elevated: "bg-card-elevated text-card-foreground border-border shadow-lg"
  };
  
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border shadow-sm",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
})
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className = "", children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  >
    {children}
  </div>
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className = "", children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
    {...props}
  >
    {children}
  </h3>
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className = "", children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  >
    {children}
  </p>
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className = "", children, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props}>
    {children}
  </div>
))
CardContent.displayName = "CardContent"

export { Card, CardContent, CardDescription, CardHeader, CardTitle };

