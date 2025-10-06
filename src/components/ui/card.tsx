import { cn } from '@/lib/utils';
import * as React from 'react';

// =====================================
// TYPE DEFINITIONS
// =====================================

type CardVariant = 'default' | 'secondary' | 'tertiary' | 'elevated';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: CardVariant;
  children: React.ReactNode;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
  children: React.ReactNode;
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
  children: React.ReactNode;
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

// =====================================
// CARD COMPONENT
// =====================================

/**
 * Main card container component with variant support
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'default', children, ...props }, ref) => {
    const variants: Record<CardVariant, string> = {
      default: 'bg-card text-card-foreground border-border',
      secondary: 'bg-card-secondary text-card-foreground border-border',
      tertiary: 'bg-card-tertiary text-card-foreground border-border',
      elevated: 'bg-card-elevated text-card-foreground border-border shadow-lg',
    };

    return (
      <div
        ref={ref}
        className={cn('rounded-lg border shadow-sm', variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Card.displayName = 'Card';

// =====================================
// CARD HEADER COMPONENT
// =====================================

/**
 * Card header component for titles and descriptions
 */
const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = '', children, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props}>
      {children}
    </div>
  ),
);
CardHeader.displayName = 'CardHeader';

// =====================================
// CARD TITLE COMPONENT
// =====================================

/**
 * Card title heading component
 */
const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className = '', children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
      {...props}
    >
      {children}
    </h3>
  ),
);
CardTitle.displayName = 'CardTitle';

// =====================================
// CARD DESCRIPTION COMPONENT
// =====================================

/**
 * Card description paragraph component
 */
const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className = '', children, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props}>
      {children}
    </p>
  ),
);
CardDescription.displayName = 'CardDescription';

// =====================================
// CARD CONTENT COMPONENT
// =====================================

/**
 * Card content container component
 */
const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className = '', children, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props}>
      {children}
    </div>
  ),
);
CardContent.displayName = 'CardContent';

export { Card, CardContent, CardDescription, CardHeader, CardTitle };
